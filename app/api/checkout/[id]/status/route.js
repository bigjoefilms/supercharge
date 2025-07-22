import { NextResponse } from "next/server";
import Checkout from "@/app/models/checkout";
import { dbConnect } from '../../../lib/dbConnect';

export async function GET(req, { params }) {
  await dbConnect();
  const { id } = await params; // Add await here
  
  const checkout = await Checkout.findOne({ reference: id });
  if (!checkout) {
    return NextResponse.json({ status: "not_found" }, { status: 404 });
  }
  return NextResponse.json({ status: checkout.transactionStatus || "pending" });
}

export async function POST(req, { params }) {
  await dbConnect();
  const { id } = await params; // Add await here
  const { status } = await req.json();
  
  const checkout = await Checkout.findOneAndUpdate(
    { reference: id },
    { transactionStatus: status }, // Use transactionStatus instead of status
    { new: true }
  );
  if (!checkout) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}