// backend/models/promoCodeModel.js
const mongoose = require('mongoose');

const promoCodeSchema = mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    discountType: { type: String, required: true, enum: ['fixed', 'percentage'] },
    discountValue: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
    usageCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

const PromoCode = mongoose.model('PromoCode', promoCodeSchema);
module.exports = PromoCode;
