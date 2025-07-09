import { dbConnect } from '../../lib/dbConnect';
import Loyalty from '../../../models/loyalty';

export async function GET(req, { params }) {
  await dbConnect();
  const { wallet_address } = await params;

  try {
    const entry = await Loyalty.findOne({ wallet_address });

    if (!entry) {
      return new Response(JSON.stringify({ success: false, message: 'Loyalty not found' }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify({ success: true, loyalty: entry.loyalty }), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
    });
  }
}
