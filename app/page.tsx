"use client";
import React, { useState } from "react";
import { Copy, QrCode, Check, Wallet, Link as LinkIcon, MessageSquare, Tag, DollarSign, ExternalLink } from "lucide-react";

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
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const generateQRCode = (text: string) => {
    const size = 200;
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}`;
    return qrApiUrl;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    setLink("");
    setShowQR(false);
    
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
        setSuccess("Payment link created successfully!");
        setLink(`http://localhost:3000/embed/${data.id}`);
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
      </div>

      <main className="relative flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Create Payment Link
            </h1>
            <p className="text-gray-600">Generate secure Solana payment links with QR codes</p>
          </div>

          {/* Main Card */}
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Amount Input */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    name="amount"
                    placeholder="150.50"
                    value={form.amount}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
                  />
                </div>
              </div>

              {/* Label Input */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">Label</label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="label"
                    placeholder="Coffee Shop Payment"
                    value={form.label}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
                  />
                </div>
              </div>

              {/* Message Input */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="message"
                    placeholder="Payment for 2 Lattes and 1 Croissant"
                    value={form.message}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
                  />
                </div>
              </div>

              {/* Memo Input */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">Memo</label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="memo"
                    placeholder="Order #12345 - Table 8"
                    value={form.memo}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
                  />
                </div>
              </div>

              {/* Wallet Address Input */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">Merchant Wallet Address</label>
                <div className="relative">
                  <Wallet className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="merchant_wallet_address"
                    placeholder="Solana wallet address"
                    value={form.merchant_wallet_address}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 font-mono text-sm"
                  />
                </div>
              </div>

              {/* Redirect URL Input */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">Redirect URL</label>
                <div className="relative">
                  <ExternalLink className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="url"
                    name="redirectUrl"
                    placeholder="https://coffeeshop.com/payment-success"
                    value={form.redirectUrl}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creating...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <LinkIcon className="w-5 h-5 mr-2" />
                    Create Payment Link
                  </div>
                )}
              </button>
            </form>

            {/* Error Message */}
            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="text-red-600 text-center font-medium">{error}</div>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="text-green-600 text-center font-medium">{success}</div>
              </div>
            )}

            {/* Payment Link Result */}
            {link && (
              <div className="mt-6 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Your Payment Link</h3>
                  <div className="bg-white rounded-lg p-3 border">
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800 underline break-all text-sm font-mono"
                    >
                      {link}
                    </a>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleCopy}
                    className="flex-1 flex items-center justify-center px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 mr-2 text-green-500" />
                        <span className="text-green-500 font-medium">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2 text-gray-600" />
                        <span className="text-gray-700 font-medium">Copy Link</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setShowQR(!showQR)}
                    className="flex-1 flex items-center justify-center px-4 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors duration-200"
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    <span className="font-medium">{showQR ? 'Hide QR' : 'Show QR'}</span>
                  </button>
                </div>

                {/* QR Code */}
                {showQR && (
                  <div className="mt-6 text-center">
                    <div className="inline-block p-4 bg-white rounded-xl shadow-lg">
                      <img
                        src={generateQRCode(link)}
                        alt="Payment Link QR Code"
                        className="w-48 h-48 mx-auto"
                      />
                      <p className="text-sm text-gray-600 mt-3">Scan to open payment link</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Page;