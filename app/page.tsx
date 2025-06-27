"use client";
import { quanta } from "@/app/fonts";
import { useAppKit } from "@reown/appkit/react";
import { useAppKitAccount } from "@reown/appkit/react";
import Logo from "@/public/supermigrate.png";
import Image from "next/image";
import { cn } from "@/lib/utilis";
import {
  // QrCode,
  // Check,
  // Wallet,
  // Link as LinkIcon,
  MessageSquare,
  Tag,
  Copy,
  DollarSign,
  ExternalLink,
  Loader2,
  Mail,
  Gift,
  // CreditCard,
} from "lucide-react";
import React, { useState } from "react";
import Link from "next/link";
import {QRCodeCanvas} from 'qrcode.react'


const Page = () => {
  const [form, setForm] = useState({
    amount: "",
    label: "",
    message: "",
    email: "",
    memo: "",
    merchant_wallet_address: "",
    redirectUrl: ""
  });
    const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const [jsonContent, setJsonContent] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [link, setLink] = useState("");
  const [showQR, setShowQR] = useState(false);
  const BASE_URL = typeof window !== "undefined" ? window.location.origin : "";

  const handleConnect = () => {
    console.log("🔗 Attempting to connect wallet...");
    try {
      open();
      console.log("✅ Wallet connection modal opened");
    } catch (err) {
      console.error("❌ Failed to open wallet connection:", err);
      setError("Failed to open wallet connection");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("📁 File upload initiated...");
    const file = e.target.files?.[0];
    if (!file) {
      console.log("⚠️ No file selected");
      return;
    }

    console.log("📄 File selected:", file.name, "Size:", file.size, "bytes");

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const result = event.target?.result;
        if (typeof result === "string") {
          const json = JSON.parse(result);
          setJsonContent(json);
          console.log("✅ JSON file parsed successfully:", json);
          setSuccess("JSON file uploaded successfully!");
          setTimeout(() => setSuccess(""), 3000);
        } else {
          console.error("❌ File could not be read as text");
          setError("File could not be read as text.");
          setTimeout(() => setError(""), 3000);
        }
      } catch (err) {
        console.error("❌ Invalid JSON file:", err);
        setError("Invalid JSON file. Please check the format.");
        setTimeout(() => setError(""), 3000);
      }
    };

    reader.onerror = (err) => {
      console.error("❌ File reading error:", err);
      setError("Failed to read the file. Please try again.");
      setTimeout(() => setError(""), 3000);
    };

    reader.readAsText(file);
  };

  const validatePaymentForm = () => {
    console.log("🔍 Validating payment form...");
    
    if (!form.amount || parseFloat(form.amount) <= 0) {
      setError("Please enter a valid amount greater than 0");
      console.log("❌ Validation failed: Invalid amount");
      return false;
    }
    
    if (!form.label.trim()) {
      setError("Please enter a merchant organization name");
      console.log("❌ Validation failed: Missing label");
      return false;
    }
    
    if (!form.message.trim()) {
      setError("Please enter a message");
      console.log("❌ Validation failed: Missing message");
      return false;
    }
    
    if (!form.memo.trim()) {
      setError("Please enter a memo");
      console.log("❌ Validation failed: Missing memo");
      return false;
    }
    
    if (!form.redirectUrl.trim()) {
      setError("Please enter a redirect URL");
      console.log("❌ Validation failed: Missing redirect URL");
      return false;
    }

    // Validate URL format
    try {
      new URL(form.redirectUrl);
    } catch {
      setError("Please enter a valid redirect URL");
      console.log("❌ Validation failed: Invalid URL format");
      return false;
    }

    console.log("✅ Payment form validation passed");
    return true;
  };

 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🚀 Payment link generation started...");
    
    if (!validatePaymentForm()) {
      setTimeout(() => setError(""), 5000);
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    setLink("");
    
    console.log("📤 Sending payment data:", form);
    
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(form.amount),
          label: form.label,
          message: form.message,
          email: form.email,
          memo: form.memo,
          merchant_wallet_address: address,
          redirectUrl: form.redirectUrl
        })
      });

      console.log("📡 API Response status:", res.status);
      
      const data = await res.json();
      console.log("📡 API Response data:", data);

      if (!res.ok || !data.success) {
        const errorMsg = data.error || "Failed to create payment link";
        console.error("❌ Payment link creation failed:", errorMsg);
        setError(errorMsg);
        setTimeout(() => setError(""), 5000);
      } else {
        console.log("✅ Payment link created successfully:", data.id);
        setSuccess("Payment link created successfully!");
        setLink(`${BASE_URL}/embed/${data.id}`);
        setShowQR(true);
        setTimeout(() => setSuccess(""), 5000);
      }
    } catch (err) {
      console.error("❌ Network/API error:", err);
      setError("Something went wrong. Please check your connection and try again.");
      setTimeout(() => setError(""), 5000);
    }
    setLoading(false);
  };

  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    console.log(`📝 Form field changed: ${name} = ${value}`);
    setForm({ ...form, [name]: value });
  };

 

  const handleCopy = async () => {
    console.log("📋 Attempting to copy link to clipboard...");
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      console.log("✅ Link copied to clipboard successfully");
      setSuccess("Link copied to clipboard successfully");
      setTimeout(() => setCopied(false), 2000);
      setSuccess("");
    } catch (err) {
      console.error('❌ Failed to copy link to clipboard:', err);
      setError("Failed to copy link. Please copy it manually.");
      setTimeout(() => setError(""), 3000);
    }
  };

  return (
    <main className="flex items-center justify-center relative">
         <div
        className={cn(
          "absolute inset-0 -z-50 opacity-5",
          "[background-size:40px_40px]",
          "[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]",
          "dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]",
        )}
        style={{
          WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 60%, black 50%, transparent 100%)",
          maskImage: "linear-gradient(to right, transparent 0%, black 60%, black 90%, transparent 100%)"
        }}
      />
    
      <section className="max-w-[1440px] w-full ">
        <header className="flex items-center gap-3 justify-between text-[14px] mt-[20px] px-5">
          <div className="flex items-center gap-1">
            <Image
              src={Logo}
              alt="logo"
              width={50}
              height={50}
              className="rounded-[8px]"
            />
            <h1
              className={`font-semibold text-[18px] md:flex hidden ${quanta.className}`}
            >
              Supercharge
            </h1>
          </div>

          <span
            className={`font-light opacity-50 text-[12px] cursor-pointer hover:opacity-70 transition-opacity flex gap-3 items-center ${quanta.className}`}
            onClick={handleConnect}
          >
            {!isConnected ? (
              "Connect Wallet"
            ) : (
              <span className="text-green-600">
                Connected:{" "}
                <span className="text-[#111]">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
              </span>
            )}
          </span>
        </header>

        {/* Error and Success Messages */}
        {error && (
          <div className="mx-5 mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mx-5 mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
            {success}
          </div>
        )}

        <section className="flex  justify-center items-center xl:flex-row flex-col gap-[100px] md:mt-[50px] mt-[30px] m-5 mb-[50px]">
          <div className="flex-1 items-center justify-center flex flex-col">
            <div>
              <h1
                className={`${quanta.className} text-[45px] font-bold w-full max-w-[550px] bg-gradient-to-r from-blue-600 to-blue-300 bg-clip-text text-transparent `}
              >
                All in one Loyalty payment Checkout gateway.
              </h1>
              <p className="text-[14px] font-light opacity-70">
                Turn customers into brand advocates & businesses into partners
                with just one platform.
              </p>
              <div className="flex gap-5">
                <Link href="/create" className=" cursor-pointer w-full py-[10px] text-[14px] mt-[25px] rounded-[8px] hover:opacity-90 transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-400 text-white">
              
                  <Gift className="w-4 h-4" />
                  Create Loyalty
               
                </Link>
               
              </div>
            </div>
          </div>


          <div className=" flex-1 flex flex-col w-full max-w-[600px] items-center justify-center bg-[#fff] px-[20px] py-[20px]">
           
              <div className="flex flex-col gap-3 w-full">
                <div>
                  <label className={`block text-[12px] font-medium text-gray-700 mb-2 ${quanta.className}`}>
                    Amount
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
                    <input
                      type="number"
                      step="0.01"
                      name="amount"
                      placeholder="150.50"
                      value={form.amount}
                      onChange={handleChange}
                      required
                      className="w-full pl-8 pr-4 py-2 border text-[11px] border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
                    />
                  </div>
                </div>
                
                <div>
                  <label className={`block text-[12px] font-medium text-gray-700 mb-2 ${quanta.className}`}>
                    Merchant Organisation
                  </label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
                    <input
                      type="text"
                      name="label"
                      placeholder="Coffee Shop Payment"
                      value={form.label}
                      onChange={handleChange}
                      required
                      className="w-full pl-8 pr-4 py-2 border text-[11px] border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-[12px] font-medium text-gray-700 mb-2 ${quanta.className}`}>Message</label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
                    <input
                      type="text"
                      name="message"
                      placeholder="Payment for 2 Lattes and 1 Croissant"
                      value={form.message}
                      onChange={handleChange}
                      required
                      className="w-full pl-8 pr-4 py-2 border text-[11px] border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-[12px] font-medium text-gray-700 mb-2 ${quanta.className}`}>Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      placeholder="example@gmail.com"
                      value={form.email}
                      onChange={handleChange}
                      required
                      className="w-full pl-8 pr-4 py-2 border text-[11px] border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-[12px] font-medium text-gray-700 mb-2 ${quanta.className}`}>Memo</label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
                    <input
                      type="text"
                      name="memo"
                      placeholder="Order #12345 - Table 8"
                      value={form.memo}
                      onChange={handleChange}
                      required
                      className="w-full pl-8 pr-4 py-2 border text-[11px] border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-[12px] font-medium text-gray-700 mb-2 ${quanta.className}`}>Redirect URL (Optional)</label>
                  <div className="relative">
                    <ExternalLink className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
                    <input
                      type="url"
                      name="redirectUrl"
                      placeholder="https://coffeeshop.com/payment-success"
                      value={form.redirectUrl}
                      onChange={handleChange}
                      required
                      className="w-full pl-8 pr-4 py-2 border text-[12px] border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-[12px] font-medium text-gray-700 mb-2 ${quanta.className}`}>Upload loyalty json (Optional)</label>
                  <div className="relative">
                    <ExternalLink className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
                    <input
                      type="file"
                      accept=".json,application/json"
                      onChange={handleFileChange}
                      className="w-full pl-8 pr-4 py-2 border text-[11px] border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
                    />
                  </div>
                </div>

                {jsonContent && (
                  <pre className="mt-4 bg-gray-100 p-2 rounded text-xs max-h-32 overflow-y-auto">
                    {JSON.stringify(jsonContent, null, 2)}
                  </pre>
                )}

                <div className="flex flex-col gap-5">
                  <button
                    type="submit"
                    disabled={loading}
                    onClick={handleSubmit}
                    className="cursor-pointer bg-gradient-to-r from-blue-600 to-purple-400 px-[30px] py-[10px] text-[#fff] mt-[25px] text-[14px] rounded-[8px] hover:opacity-90 w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      "Generate Paylink"
                    )}
                  </button>

                  <div className="w-full pl-8 pr-4 py-3 border text-[12px] border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 opacity-60 relative cursor-pointer" onClick={handleCopy}>
                    <Copy 
                      className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 cursor-pointer transition-colors ${
                        copied ? 'text-green-600' : 'text-gray-900 hover:text-blue-600'
                      }`} 
                      onClick={handleCopy}
                    />
                    {link ? link : "https://supercharge-theta.vercel.app/"}
               
                  </div>
                 
                </div>
              </div>
          
          </div>
          
        </section>
      </section>
      
      {showQR && link && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white/20 backdrop-blur-md rounded-xl border border-white/30 shadow-lg p-8 flex flex-col items-center relative">
            {/* Close Button */}
            <button
              className="absolute top-2 right-2 text-gray-700 hover:text-red-500 text-[40px] font-bold cursor-pointer"
              onClick={() => setShowQR(false)}
              aria-label="Close"
            >
              ×
            </button>
            <QRCodeCanvas id="qr-download" value={link} size={300}  />
            <span className="text-[12px] opacity-70 w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 my-[10px] break-all" onClick={handleCopy}>{link}</span>
            <button
              className="hover:opacity-70 bg-[#000] text-[#fff] py-[6px] px-4 cursor-pointer rounded-[8px] mt-2"
              onClick={() => {
                const canvas = document.getElementById('qr-download') as HTMLCanvasElement;
                if (!canvas) return;
                const url = canvas.toDataURL("image/png");
                const a = document.createElement("a");
                a.href = url;
                a.download = "qrcode.png";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              }}
            >
              Download QR Code
            </button>
          </div>
        </div>
      )}
   
    </main>
  );
};

export default Page;