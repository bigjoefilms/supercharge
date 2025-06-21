"use client";
import React, { useState } from "react";

const Page = () => {
  const [form, setForm] = useState({
    amount: "",
    label: "",
    message: "",
    memo: "",
    merchant_wallet_address: "",
    redirectUrl: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [link, setLink] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    setLink("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(form.amount),
          label: form.label,
          message: form.message,
          memo: form.memo,
          merchant_wallet_address: form.merchant_wallet_address,
          redirectUrl: form.redirectUrl
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Failed to create payment link");
      } else {
        setSuccess("Payment link created!");
        setLink(`http://localhost:3000/embed/${data.id}`);
      }
    } catch (err: any) {
      setError("Something went wrong");
    }
    setLoading(false);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Create Payment Link</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="number"
            step="0.01"
            name="amount"
            placeholder="Amount (e.g. 150.50)"
            value={form.amount}
            onChange={handleChange}
            required
            className="border rounded px-3 py-2"
          />
          <input
            type="text"
            name="label"
            placeholder="Label (e.g. Coffee Shop Payment)"
            value={form.label}
            onChange={handleChange}
            required
            className="border rounded px-3 py-2"
          />
          <input
            type="text"
            name="message"
            placeholder="Message (e.g. Payment for 2 Lattes and 1 Croissant)"
            value={form.message}
            onChange={handleChange}
            required
            className="border rounded px-3 py-2"
          />
          <input
            type="text"
            name="memo"
            placeholder="Memo (e.g. Order #12345 - Table 8)"
            value={form.memo}
            onChange={handleChange}
            required
            className="border rounded px-3 py-2"
          />
          <input
            type="text"
            name="merchant_wallet_address"
            placeholder="Merchant Wallet Address (Solana address)"
            value={form.merchant_wallet_address}
            onChange={handleChange}
            required
            className="border rounded px-3 py-2"
          />
          <input
            type="url"
            name="redirectUrl"
            placeholder="Redirect URL (e.g. https://coffeeshop.com/payment-success)"
            value={form.redirectUrl}
            onChange={handleChange}
            required
            className="border rounded px-3 py-2"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-700 text-white py-2 rounded hover:bg-blue-800 transition"
          >
            {loading ? "Creating..." : "Create Payment Link"}
          </button>
        </form>
        {error && <div className="text-red-600 mt-4 text-center">{error}</div>}
        {success && <div className="text-green-600 mt-4 text-center">{success}</div>}
        {link && (
          <div className="mt-4 flex flex-col items-center">
            <span className="text-gray-700">Your payment link:</span>
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 underline break-all"
            >
              {link}
            </a>
            <button
              className="mt-2 px-3 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300"
              onClick={() => {
                navigator.clipboard.writeText(link);
              }}
            >
              Copy Link
            </button>
          </div>
        )}
      </div>
    </main>
  );
};

export default Page;
