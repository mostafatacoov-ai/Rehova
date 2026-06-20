const mongoose = require('mongoose');

const giftCardSchema = mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },
    initialValue: {
      type: Number,
      required: true,
    },
    currentBalance: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['Available', 'Purchased'],
      default: 'Available',
    },
    purchasedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    purchasedAt: {
      type: Date,
    }
  },
  {
    timestamps: true,
  }
);

const GiftCard = mongoose.model('GiftCard', giftCardSchema);
module.exports = GiftCard;
