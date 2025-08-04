const express = require('express');
const DailyReturn = require('../models/DailyReturn');
const User = require('../models/User');

const router = express.Router();

// Get daily returns for user
router.get('/', async (req, res) => {
  try {
    const { period = 'all' } = req.query;
    const userId = req.user._id;

    let dateFilter = {};
    const now = new Date();

    switch (period) {
      case 'today':
        dateFilter = {
          scheduledFor: {
            $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            $lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
          }
        };
        break;
      case 'week':
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        dateFilter = {
          scheduledFor: {
            $gte: weekStart,
            $lt: new Date()
          }
        };
        break;
      case 'month':
        dateFilter = {
          scheduledFor: {
            $gte: new Date(now.getFullYear(), now.getMonth(), 1),
            $lt: new Date(now.getFullYear(), now.getMonth() + 1, 1)
          }
        };
        break;
    }

    const dailyReturns = await DailyReturn.find({
      user: userId,
      ...dateFilter
    })
    .populate('deposit', 'package amount')
    .sort({ scheduledFor: -1 });

    // Calculate stats
    const totalReturns = await DailyReturn.countDocuments({ user: userId });
    const processedReturns = await DailyReturn.countDocuments({ 
      user: userId, 
      status: 'processed' 
    });
    const pendingReturns = await DailyReturn.countDocuments({ 
      user: userId, 
      status: 'pending' 
    });

    const totalEarnedResult = await DailyReturn.aggregate([
      { $match: { user: userId, status: 'processed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const nextReturn = await DailyReturn.findOne({
      user: userId,
      status: 'pending',
      scheduledFor: { $gte: new Date() }
    }).sort({ scheduledFor: 1 });

    const stats = {
      totalReturns,
      processedReturns,
      pendingReturns,
      totalEarned: totalEarnedResult[0]?.total || 0,
      nextReturnAmount: nextReturn?.amount || 0,
      nextReturnTime: nextReturn?.scheduledFor || null
    };

    res.json({ dailyReturns, stats });
  } catch (error) {
    console.error('Get daily returns error:', error);
    res.status(500).json({ message: 'Server error fetching daily returns' });
  }
});

// Get daily return statistics
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user._id;

    const totalReturns = await DailyReturn.countDocuments({ user: userId });
    const processedReturns = await DailyReturn.countDocuments({ 
      user: userId, 
      status: 'processed' 
    });
    const pendingReturns = await DailyReturn.countDocuments({ 
      user: userId, 
      status: 'pending' 
    });

    const totalEarnedResult = await DailyReturn.aggregate([
      { $match: { user: userId, status: 'processed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const nextReturn = await DailyReturn.findOne({
      user: userId,
      status: 'pending',
      scheduledFor: { $gte: new Date() }
    }).sort({ scheduledFor: 1 });

    res.json({
      totalReturns,
      processedReturns,
      pendingReturns,
      totalEarned: totalEarnedResult[0]?.total || 0,
      nextReturnAmount: nextReturn?.amount || 0,
      nextReturnTime: nextReturn?.scheduledFor || null
    });
  } catch (error) {
    console.error('Get daily return stats error:', error);
    res.status(500).json({ message: 'Server error fetching daily return statistics' });
  }
});

module.exports = router;