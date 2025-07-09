import mongoose from 'mongoose';

const LoyaltySchema = new mongoose.Schema({
  wallet_address: {
    type: String,
    required: true,
    unique: true,
    match: [/^[A-Za-z0-9]{32,44}$/, 'Invalid wallet address'],
  },
  loyalty: {
    type: Object,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Loyalty || mongoose.model('Loyalty', LoyaltySchema);
