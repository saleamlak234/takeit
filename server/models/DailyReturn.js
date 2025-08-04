const mongoose = require('mongoose');

const dailyReturnSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  deposit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deposit',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  returnRate: {
    type: Number,
    required: true // Store the daily return rate (e.g., 0.0167 for 1.67%)
  },
  dayNumber: {
    type: Number,
    required: true // Day 1, 2, 3, etc.
  },
  scheduledFor: {
    type: Date,
    required: true // When this return should be processed
  },
  processedAt: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'processed', 'failed'],
    default: 'pending'
  },
  timezone: {
    type: String,
    required: true // User's timezone when deposit was made
  }
}, {
  timestamps: true
});

// Index for efficient querying
dailyReturnSchema.index({ scheduledFor: 1, status: 1 });
dailyReturnSchema.index({ user: 1, deposit: 1 });

module.exports = mongoose.model('DailyReturn', dailyReturnSchema);