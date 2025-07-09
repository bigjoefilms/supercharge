import { dbConnect } from '../lib/dbConnect'; 
import Waitlist from '../../models/waitlist'; // Your Mongoose model

export async function POST(req) {
  await dbConnect();
  const { email } = await req.json();

  if (!email || !email.includes('@')) {
    return new Response(JSON.stringify({ success: false, message: 'Invalid email' }), {
      status: 400,
    });
  }

  try {
    const existing = await Waitlist.findOne({ email });
    if (existing) {
      return new Response(JSON.stringify({ success: false, message: 'Email already exists' }), {
        status: 409,
      });
    }

    const entry = await Waitlist.create({ email });
    return new Response(JSON.stringify({ success: true, id: entry._id }), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
    });
  }
}
