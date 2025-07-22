import { dbConnect } from '../../lib/dbConnect';
import Checkout from '../../../models/checkout';

export async function GET(request, { params }) {
  await dbConnect();
  
  // Await params before accessing its properties
  const { id } = await params;
  
  try {
    // First try to find by reference (as shown in your original code)
    let checkout = await Checkout.findOne({ reference: id });
    
    // If not found by reference, try by id
    if (!checkout) {
      checkout = await Checkout.findOne({ id });
    }
    
    if (!checkout) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Transaction not found' 
        }), 
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        status: checkout.status || 'pending', // Add status field
        data: {
          amount: checkout.amount,
          label: checkout.label,
          message: checkout.message,
          memo: checkout.memo,
          reference: checkout.reference,
          merchant_wallet_address: checkout.merchant_wallet_address,
          collection: checkout.collection,
          updateAuthority: checkout.updateAuthority
        }
      }), 
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (err) {
    console.error('Database error:', err);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: err.message 
      }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}