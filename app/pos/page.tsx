"use client";
import React, { useState, useEffect , useCallback} from "react";
import checkLogo from "@/public/check.png";
import Logo from "@/public/usdc.png";
import { Keypair } from "@solana/web3.js";
import Image from "next/image";
import { submitPayment, copyToClipboard } from "@/utilis/paymentUtilis";
import { useAppKitProvider, useAppKitAccount ,useAppKit  } from "@reown/appkit/react";
import { Loader2, Copy } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import Link from "next/link";
import { useDisconnect } from "@reown/appkit/react";
import { getProgramDetails, initializeVerxio } from "@verxioprotocol/core";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { publicKey } from "@metaplex-foundation/umi";
import { WalletAdapter, walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import type { Provider } from "@reown/appkit-adapter-solana/react";


interface LoyaltyData {
  collection: string;
  updateAuthority: object;
}


export default function PaymentForm() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const { walletProvider } = useAppKitProvider<Provider>("solana");
  const [checkingLoyalty, setCheckingLoyalty] = useState<boolean>(false);
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyData | null>(null);
  const { open } = useAppKit();
  const { disconnect } = useDisconnect();
  const { address, isConnected } = useAppKitAccount();
  const [amount, setAmount] = useState<string>("");
  const [reference, setReference] = useState<string>("");
  const [organisation, setOrganisation] = useState<string>("");
  const [collection, setCollection] = useState<string>("");
  const [owner, setOwner] = useState<string>("");
  const [memo, setMemo] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [, setIsWaitingForPayment] = useState<boolean>(false);
  const [link, setLink] = useState("");
  const [, setShowQR] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "success" | "failed">("pending");
  const [updateAuthority, setUpdateAuthority] = useState<{
    publicKey: string;
    secretKey: Uint8Array;
  } | null>(null);

  const BASE_URL = typeof window !== "undefined" ? window.location.origin : "";
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await copyToClipboard(link, setCopied);
  };

  const handleConnect = () => {
    open();
  };
  const handleDisconnect = () => {
    disconnect();
  };

  const checkLoyaltyProgram = useCallback(async (walletAddress: string) => {
    setCheckingLoyalty(true);
    try {
      const response = await fetch(`/api/loyalty/${walletAddress}`);
      const data = await response.json();
  
      if (data.success) {
        setLoyaltyData(data.loyalty);
        console.log("✅ Found existing loyalty program:", data.loyalty);
  
        try {
          const umi = createUmi(
            `${process.env.NEXT_PUBLIC_HELIUS_RPC_URL}`,
          );
  
          const context = initializeVerxio(
            umi,
            publicKey(address ?? "11111111111111111111111111111111")
          );

            // if (walletProvider) {
            //   context.umi.use(walletAdapterIdentity(walletProvider as Provider));
            // }

          if (walletProvider && walletProvider.publicKey !== undefined) {
            const compatibleAdapter: WalletAdapter = {
              ...walletProvider,
              publicKey: walletProvider.publicKey ?? null,
            };
            context.umi.use(walletAdapterIdentity(compatibleAdapter));
          }
  
          const collection = data.loyalty.collection;
          const updateAuthority = data.loyalty.updateAuthority;
          setUpdateAuthority(updateAuthority);
          setCollection(collection);
          console.log(updateAuthority);
  
          if (data.loyalty.collection) {
            context.collectionAddress = publicKey(data.loyalty.collection);
          }
  
          const programDetails = await getProgramDetails(context);
          console.log("📊 Program Details:", programDetails);
  
          setOrganisation(programDetails.metadata.organizationName);
          setOwner(programDetails.name);
        } catch (programError) {
          console.error("❌ Error fetching program details:", programError);
        }
      } else {
        setLoyaltyData(null);
        console.log("ℹ️ No existing loyalty program found");
      }
    } catch (error) {
      console.error("❌ Error checking loyalty program:", error);
      setLoyaltyData(null);
    }
    setCheckingLoyalty(false);
  }, [address, walletProvider]);

 
  

  // Check for existing loyalty program when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      checkLoyaltyProgram(address);
    }
  }, [isConnected, address, checkLoyaltyProgram]);
 

useEffect(() => {
  if (!reference) return;
  const interval = setInterval(async () => {
    try {
      const res = await fetch(`/api/checkout/${reference}/status`);
      const data = await res.json();
      if (data.status === "success") {
        setPaymentStatus("success");
        clearInterval(interval);
      } else if (data.status === "failed") {
        setPaymentStatus("failed");
        clearInterval(interval);
      }
    } catch (err) {
      console.error("❌ ", err);
    }

  }, 3000);
  return () => clearInterval(interval);
}, [reference]);

  const handleNumberClick = (num: string) => {
    if (num === "." && amount.includes(".")) return;
    if (amount === "0" && num !== ".") {
      setAmount(num);
    } else {
      setAmount((prev) => prev + num);
    }
  };

  const handleBackspace = () => {
    setAmount((prev) => prev.slice(0, -1) || "0");
  };

  const formatAmount = (value: string) => {
    if (!value || value === "0") return "$0.00";
    // Remove any non-numeric characters except decimal point
    const cleaned = value.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    // Format the integer part with commas
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    // Handle decimal part
    if (parts.length > 1) {
      const decimalPart = parts[1].slice(0, 2); // Limit to 2 decimal places
      return `$${integerPart}.${decimalPart.padEnd(2, "0")}`;
    }
    return `$${integerPart}.00`;
  };

  const handleCancel = () => {
    setCurrentStep(1);
    setAmount("");
    setMemo("");
    setMessage("");
    setIsWaitingForPayment(false);
  };

  const handleNext = () => {
    if (currentStep === 1 && amount && amount !== "0") {
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    }
  };


  const handleRequestPayment = async () => {

    const newReference = reference || new Keypair().publicKey.toBase58();
  setReference(newReference);
   
  if (!updateAuthority) {
    console.error("Update authority not available");
    return;
  }
    try {
      setLoading(true);
      const result = await submitPayment(
        memo,
        parseFloat(amount),
        message,
        newReference, // pass your reference string
        address ?? "",
        collection,
        updateAuthority,
       

      );

      setLink(`${BASE_URL}/pay/${result.data.id}`);
      setShowQR(true);

      // Optionally show a success message or update UI
    } catch (error) {
      // Handle error (show error message, etc.)
      console.error(error);
    }
    setLoading(false);

    setCurrentStep(3);
  };

  if (currentStep === 3) {
    return (
      <div className="flex justify-center flex-col items-center">
        {/* {paymentStatus === "pending" && <div>Waiting for payment...</div>} */}
{paymentStatus === "success" && <div className=" font-bold text-[30px] flex items-center flex-col mb-[10px]">Payment received!
  
  <span>
                <Image
                  src={checkLogo}
                  alt="logo"
                  width={90}
                  height={90}
                  className="mb-0.5 mt-[24px]"
                />
              </span></div>}
{paymentStatus === "failed" && <div className="text-red-600 font-bold text-[30px]">Payment failed.</div>}
        <div className="flex  flex-col items-start w-full max-w-[500px] px-[15px] md:px-[0px]  rounded-3xl border-[#d9d6d6] py-[0px] ">
        <span className="text-[9px]   bg-[#F6F2EB] font-light opacity-55  ">Owner</span>

        <h1 className="font-semibold text-[16px] opacity-75">{organisation}</h1>
        <span className="text-[12px] opacity-60">@{owner}</span>
      </div>
        <div className="max-w-[500px] mx-auto w-full p-6 ">
          <div className="text-center mb-6">
            <h2 className="text-[22px] font-medium text-gray-800 mb-2">
              Scan to Pay
            </h2>
            <div className="flex justify-between items-center">
              <div>
                <h1 className="flex items-start opacity-85 text-[12px]">
                  Payment request
                </h1>
                <div className="text-[16px] font-medium  text-[#222] mb-4 flex items-center gap-1 ">
                  <span>{formatAmount(amount)} USDC</span>

                  <Image
                    src={Logo}
                    alt="logo"
                    width={15}
                    height={15}
                    className="mb-0.5"
                  />
                </div>
              </div>

              <div className="flex items-center justify-center opacity-45 text-[14px]">
                REF# {reference?.slice(0, 7)}...
              </div>
            </div>
          </div>
          {paymentStatus !== "success" && (<div>
          <div className="flex justify-center mb-6">
            <div className="relative bg-white p-4 border-2 border-gray-100 rounded-lg">
              <QRCodeCanvas id="qr-download" value={link} size={200} />
            </div>
          </div>
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#7c0b0b]"></div>
              <span className="text-gray-600 font-medium text-[14px]">
                Waiting for payment...
              </span>
            </div>
            <p className="text-sm text-gray-500">
              Scan the QR code to make payment
            </p>
          </div>
          <div
            className="w-full my-[9px] pl-8 pr-4 py-3 border text-[11px] border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 opacity-60 relative cursor-pointer"
            onClick={handleCopy}
          >
            <Copy
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 cursor-pointer transition-colors ${
                copied ? "text-green-600" : "text-gray-900 hover:text-blue-600"
              }`}
              onClick={handleCopy}
            />
            {link ? link : "https://supercharge-theta.vercel.app/"}
          </div>
</div>
)}

          {(memo || message) && (
            <div className="bg-[#edecec] rounded-lg p-4 mb-6">
              <div className="text-sm text-gray-600 space-y-1">
                <div>
                  <span className="font-medium">Memo:</span> {memo}
                </div>

                <div>
                  <span className="font-medium">Message:</span> {message}
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleCancel}
            className="w-full py-3 bg-[#7c0b0b] hover:opacity-80 text-white text-[12px] rounded-lg font-normal transition-colors cursor-pointer"
          >
            Cancel Payment
          </button>
        </div>
      </div>
    );
  }

  if (currentStep === 2) {
    return (
      <div className="flex justify-center items-center flex-col">
        <div className="flex  flex-col items-start w-full max-w-[500px] px-[30px]  rounded-3xl border-[#d9d6d6] py-[20px] ">
        <span className="text-[11px]  top-[-10] bg-[#F6F2EB] font-light opacity-55  ">Owner</span>

        <h1 className="font-semibold text-[20px] opacity-75">{organisation}</h1>
        <span className="text-[14px] opacity-60">@{owner}</span>
      </div>
        <div className="max-w-[500px] mx-auto w-full p-6 mt-[5px] md:mt-[0px]">
          <div className="text-center mb-6">
            <h2 className="text-[32px] font-medium text-gray-800 mb-2">
              Payment Information
            </h2>
            <div className="text-[14px] font-normal text-[#222] opacity-70 mb-4">
              Provide additional information for this payment.
            </div>
          </div>
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Memo
              </label>
              <input
                type="text"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter memo..."
              />
              <p className="text-[12px] opacity-30 mt-[5px]">
                Attach a memo to the transaction for easier reconcilation later{" "}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                //   rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2  focus:border-transparent resize-none h-[90px]"
                placeholder="Enter message..."
              />
              <p className="text-[12px] opacity-30">
                Share a note with your customer :)
              </p>
            </div>
          </div>
          <div className="flex gap-3 text-[14px]">
            <button
              onClick={handleBack}
              className="flex-1 py-3 bg-[#fff] text-[#222] hover:opacity-80  rounded-lg  transition-colors"
            >
              Back
            </button>

            <button
              type="submit"
              onClick={handleRequestPayment}
              disabled={!amount || amount === "0"}
              className="flex-1 py-3 bg-[#7c0b0b] hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg  transition-colors cursor-pointer"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Requesting...
                </div>
              ) : (
                "Request Payment"
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state while checking loyalty
  if (checkingLoyalty) {
    return (
      <div className="flex justify-center items-center ">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#7c0b0b] border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Checking loyalty program...</p>
        </div>
      </div>
    );
  }

  // Show create loyalty program button if no loyalty program found
  if (isConnected && !loyaltyData) {
    return (
      <div className="flex justify-center items-center p-2 ">
        <div className="max-w-[500px] w-full text-center">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-lg">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                No Loyalty Program Found
              </h2>
              <p className="text-gray-600 text-[14px]">
                You need to create a loyalty program before you can accept
                payments.
              </p>
            </div>

            <div className="flex gap-4 justify-center">
              <Link href="/create">
                <button className="bg-[#7c0b0b] text-[12px] text-white px-10 py-3 rounded-lg font-medium hover:opacity-70 transition-colors cursor-pointer">
                  Create
                </button>
              </Link>
              <button
                onClick={handleDisconnect}
                className="text-[12px] px-6 py-3 rounded-lg font-medium hover:opacity-75 border border-[#7c0b0b] transition-colors cursor-pointer"
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 1: Enter Amount (only show if connected and has loyalty program)
  if (!isConnected) {
    return (
      <div className="flex justify-center items-center mt-[30px] md:mt-[300px]">
        <div
          className="bg-[#7c0b0b] text-[#fff] px-6 py-4 rounded-[10px] cursor-pointer text-lg font-semibold text-[14px]"
          onClick={handleConnect}
        >
          Connect Wallet
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center mt-[20px] md:mt-[50px] flex-col ">
      <div className="flex  flex-col items-start w-full max-w-[500px] px-[30px]  rounded-3xl border-[#d9d6d6] py-[20px] ">
        <span className="text-[11px]  top-[-10] bg-[#F6F2EB] font-light opacity-55  ">Owner</span>

        <h1 className="font-semibold text-[20px] opacity-75">{organisation}</h1>
        <span className="text-[14px] opacity-60">@{owner}</span>
      </div>
      <div className="max-w-[500px] mx-auto w-full p-6 ">
        <div className="text-center mb-6">
          <h2 className="text-[32px] font-normal text-gray-800 mb-2">
            Enter Amount
          </h2>
          <div className="text-[20px] font-bold text-[#222]  mb-4">
            {formatAmount(amount)}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-6">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"].map((num) => (
            <button
              key={num}
              onClick={() => handleNumberClick(num)}
              className="h-14 bg-[#fff] hover:bg-gray-200 rounded-lg text-xl font-semibold transition-colors"
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => handleNumberClick(".")}
            className="h-14 bg-gray-100 hover:bg-gray-200 rounded-lg text-xl  transition-colors"
          >
            .
          </button>
          <button
            onClick={handleBackspace}
            className="h-14 bg-gray-100 hover:bg-gray-200 rounded-lg text-xl transition-colors"
          >
            ⌫
          </button>
        </div>
        <div className="flex gap-3 text-[14px]">
          <button
            onClick={handleCancel}
            className="flex-1 py-3 bg-[#fff] text-[#222] hover:opacity-80  rounded-lg  transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleNext}
            disabled={!amount || amount === "0"}
            className="flex-1 py-3 bg-[#7c0b0b] hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg  transition-colors"
          >
            Next
          </button>
        </div>
        <span
          className={`font-light  text-[14px] cursor-pointer hover:opacity-70  flex gap-3 items-center mt-[10px]`}
          onClick={handleConnect}
        >
          <span className="text-[#7c0b0b] flex gap-2 justify-center items-center w-full py-2  ">
            {address?.slice(0, 9)}...{address?.slice(-4)}{" "}
            <span className="underline font-bold "> Disconnect</span>
          </span>
        </span>
      </div>
    </div>
  );
}
