const mongoose = require('mongoose');

const referenceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'userData',
    required: true,
  },
  referenceCode: {
    type: String,
    required: true,
    unique: true,
  },
  usedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'userData',
  }],
});

const Reference = mongoose.model('Reference', referenceSchema);

module.exports = Reference;