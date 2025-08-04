const cron = require('node-cron');
const DailyReturn = require('../models/DailyReturn');
const User = require('../models/User');
const Commission = require('../models/Commission');
const telegramService = require('../services/telegram');

// Run every minute to check for due daily returns
cron.schedule('* * * * *', async () => {
  await processDueDailyReturns();
});

async function processDueDailyReturns() {
  try {
    const now = new Date();
    
    // Find all pending daily returns that are due
    const dueReturns = await DailyReturn.find({
      status: 'pending',
      scheduledFor: { $lte: now }
    }).populate('user').populate('deposit');

    for (const dailyReturn of dueReturns) {
      try {
        await processSingleDailyReturn(dailyReturn);
      } catch (error) {
        console.error(`Failed to process daily return ${dailyReturn._id}:`, error);
        dailyReturn.status = 'failed';
        await dailyReturn.save();
      }
    }

    if (dueReturns.length > 0) {
      console.log(`Processed ${dueReturns.length} daily returns`);
    }
  } catch (error) {
    console.error('Daily returns job error:', error);
  }
}

async function processSingleDailyReturn(dailyReturn) {
  // Update user balance
  await User.findByIdAndUpdate(dailyReturn.user._id, {
    $inc: { balance: dailyReturn.amount }
  });

  // Mark as processed
  dailyReturn.status = 'processed';
  dailyReturn.processedAt = new Date();
  await dailyReturn.save();

  // Process commissions for daily returns
  await processDailyReturnCommissions(dailyReturn);

  // Send notification to user
  if (dailyReturn.user.telegramChatId) {
    await telegramService.sendMessage(
      dailyReturn.user.telegramChatId,
      `💰 Daily Return Credited!\n\n` +
      `Amount: ${dailyReturn.amount.toLocaleString()} ETB\n` +
      `Day: ${dailyReturn.dayNumber}\n` +
      `Package: ${dailyReturn.deposit.package}\n` +
      `Your balance has been updated.`
    );
  }

  console.log(`Processed daily return for user ${dailyReturn.user.fullName}: ${dailyReturn.amount} ETB`);
}

async function processDailyReturnCommissions(dailyReturn) {
  try {
    const user = await User.findById(dailyReturn.user).populate('referredBy');
    if (!user || !user.referredBy) return;

    const commissionRates = [0.08, 0.04, 0.02, 0.01]; // 8%, 4%, 2%, 1%
    let currentUser = user.referredBy;
    let level = 1;

    while (currentUser && level <= 4) {
      const commissionAmount = dailyReturn.amount * commissionRates[level - 1];
      
      // Create commission record
      const commission = new Commission({
        user: currentUser._id,
        fromUser: dailyReturn.user,
        amount: commissionAmount,
        level,
        type: 'daily_return',
        description: `Level ${level} commission from ${user.fullName}'s daily return (Day ${dailyReturn.dayNumber})`,
        sourceTransaction: dailyReturn._id,
        sourceModel: 'DailyReturn'
      });

      await commission.save();

      // Update user balance and commission total
      await User.findByIdAndUpdate(currentUser._id, {
        $inc: {
          balance: commissionAmount,
          totalCommissions: commissionAmount
        }
      });

      // Send notification
      if (currentUser.telegramChatId) {
        await telegramService.sendMessage(
          currentUser.telegramChatId,
          `💰 Daily Return Commission!\n` +
          `Amount: ${commissionAmount.toLocaleString()} ETB\n` +
          `Level: ${level}\n` +
          `From: ${user.fullName}'s daily return`
        );
      }

      // Move to next level
      const nextUser = await User.findById(currentUser._id).populate('referredBy');
      currentUser = nextUser?.referredBy;
      level++;
    }
  } catch (error) {
    console.error('Daily return commission processing error:', error);
  }
}

// Function to schedule daily returns for a deposit
async function scheduleDailyReturns(deposit, userTimezone) {
  try {
    const packageReturns = {
      '1st Stock Package': { daily: 50, total: 3000 },
      '2nd Stock Package': { daily: 100, total: 6000 },
      '3rd Stock Package': { daily: 200, total: 12000 },
      '4th Stock Package': { daily: 400, total: 24000 },
      '5th Stock Package': { daily: 800, total: 48000 },
      '6th Stock Package': { daily: 1600, total: 96000 },
      '7th Stock Package': { daily: 3200, total: 192000 }
    };

    const packageInfo = packageReturns[deposit.package];
    if (!packageInfo) {
      throw new Error(`Unknown package: ${deposit.package}`);
    }

    const dailyReturnAmount = packageInfo.daily;
    const totalDays = Math.floor(packageInfo.total / dailyReturnAmount); // Should be 60 days for all packages
    
    // Schedule returns starting from next midnight in user's timezone
    const startDate = new Date(deposit.createdAt);
    startDate.setDate(startDate.getDate() + 1); // Start tomorrow
    startDate.setHours(0, 0, 0, 0); // Set to midnight

    const dailyReturns = [];
    for (let day = 1; day <= totalDays; day++) {
      const scheduledDate = new Date(startDate);
      scheduledDate.setDate(startDate.getDate() + (day - 1));

      const dailyReturn = new DailyReturn({
        user: deposit.user,
        deposit: deposit._id,
        amount: dailyReturnAmount,
        returnRate: dailyReturnAmount / deposit.amount,
        dayNumber: day,
        scheduledFor: scheduledDate,
        timezone: userTimezone
      });

      dailyReturns.push(dailyReturn);
    }

    await DailyReturn.insertMany(dailyReturns);
    console.log(`Scheduled ${totalDays} daily returns for deposit ${deposit._id}`);
  } catch (error) {
    console.error('Error scheduling daily returns:', error);
    throw error;
  }
}

// Export functions
module.exports = { 
  processDueDailyReturns, 
  scheduleDailyReturns,
  processSingleDailyReturn 
};