import { dbConnect } from '../lib/dbConnect';
import Loyalty from '../../models/loyalty';

export async function POST(req) {
  await dbConnect();
  const { wallet_address, loyalty } = await req.json();

  if (!wallet_address || typeof loyalty !== 'object') {
    return new Response(JSON.stringify({ success: false, message: 'Invalid input' }), {
      status: 400,
    });
  }

  try {
    const existing = await Loyalty.findOne({ wallet_address });

    if (existing) {
      existing.loyalty = loyalty;
      await existing.save();
      return new Response(JSON.stringify({ success: true, message: 'Updated existing loyalty' }), {
        status: 200,
      });
    }

    const entry = await Loyalty.create({ wallet_address, loyalty });
    return new Response(JSON.stringify({ success: true, id: entry._id }), {
      status: 201,
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
    });
  }
}
