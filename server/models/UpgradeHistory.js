const mongoose = require('mongoose');

const upgradeHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  originalDeposit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deposit',
    required: true
  },
  upgradeDeposit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deposit',
    required: true
  },
  fromPackage: {
    type: String,
    required: true
  },
  toPackage: {
    type: String,
    required: true
  },
  upgradeAmount: {
    type: Number,
    required: true
  },
  newDailyReturn: {
    type: Number,
    required: true
  },
  effectiveDate: {
    type: Date,
    required: true
  },
  timezone: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

upgradeHistorySchema.index({ user: 1, originalDeposit: 1 });

module.exports = mongoose.model('UpgradeHistory', upgradeHistorySchema);