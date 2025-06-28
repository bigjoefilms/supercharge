import { dbConnect } from '../../lib/dbConnect.js';
import Checkout from '../../models/checkout';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request) {
  await dbConnect();
  const body = await request.json();
  const { amount, label, message, memo, merchant_wallet_address, redirectUrl, collectionAddress, mintAddress, programAuthority, reward, points, email, loyalty} = body;
  const id = uuidv4();

    let loyaltyObject = {};
  try {
    if (loyalty) {
      loyaltyObject = JSON.parse(loyalty);
    }
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: 'Invalid loyalty JSON format' }), {
      status: 400,
    });
  }

  try {
    const newCheckout = await Checkout.create({
      id,
      amount,
      label,
      message,
      memo,
      merchant_wallet_address,
      redirectUrl,
      collectionAddress,
      mintAddress,
      programAuthority,
      reward,
      points,
      email,
      loyalty: loyaltyObject,
    });

    return new Response(JSON.stringify({ success: true, id: newCheckout.id }), { status: 201 });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
  }
}

// export async function GET(request, { params }) {
//   await dbConnect();
//   const { id } = params;

//   try {
//     const data = await Checkout.findOne({ id });
//     if (!data) {
//       return new Response(JSON.stringify({ success: false, message: 'Transaction not found' }), { status: 404 });
//     }
//     return new Response(JSON.stringify({
//       success: true,
//       data: {
//         amount: data.amount,
//         label: data.label,
//         message: data.message,
//         memo: data.memo,
//         merchant_wallet_address: data.merchant_wallet_address,
//         redirectUrl: data.redirectUrl,
//       }
//     }), { status: 200 });
//   } catch (err) {
//     return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
//   }
// }