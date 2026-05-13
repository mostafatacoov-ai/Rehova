// backend/models/subscriberModel.js
const mongoose = require('mongoose');

const subscriberSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    phoneNumber: { type: String, required: true },
  },
  { timestamps: true }
);

const Subscriber = mongoose.model('Subscriber', subscriberSchema);
module.exports = Subscriber;
