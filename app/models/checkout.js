import mongoose from 'mongoose';

const CheckoutSchema = new mongoose.Schema({
   id: {
    type: String,
    unique: true,
    required: true
  },
  amount: {
    type: Number,
    required: true,
  },
  reference: {
    type: String,
    required: true,
  },
  message: {
    type: String,
  },
  memo: {
    type: String,
  },
  merchant_wallet_address: {
    type: String,
    required: true,
  },
  collection: {
    type: String,
    required: true,
  },
  updateAuthority: {
    type: mongoose.Schema.Types.Mixed,
    required: false,
  },
  transactionStatus: {
    type: String,
    enum: ['pending', 'success', 'failed', 'cancelled'],
    default: 'pending',
  },
  transactionSignature: {
    type: String,
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, { // <- Options object goes here, AFTER the fields object
  suppressReservedKeysWarning: true
});

console.log('Schema options:', CheckoutSchema.options); 

export default mongoose.models.Checkout || mongoose.model('Checkout', CheckoutSchema);