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
  // redirectUrl: {
  //   type: String,
  //   required: true,
  // },
 
  
//   email:{
//     type: String,
//      required: true,
//   },
//  loyalty: { type: Object, default: {},},
//   createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Checkout || mongoose.model('Checkout', CheckoutSchema);