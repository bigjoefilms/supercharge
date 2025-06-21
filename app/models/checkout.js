import mongoose from 'mongoose';

const CheckoutSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  amount: Number,
 label: String,
  message: String,
  memo: String,
  merchant_wallet_address: String,
  redirectUrl: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Checkout || mongoose.model('Checkout', CheckoutSchema);