"use client"
import React, { useState, ChangeEvent } from "react";
import Image from "next/image";
import { useAppKit } from "@reown/appkit/react";
import { useAppKitAccount } from "@reown/appkit/react";
import CheckoutButton from "@/components/CheckoutButton"; 
import Logo from "@/public/supermigrate.png"
import localFont from 'next/font/local'
// import verxioLogo from "@/public/verxio-logo.jpg";
 
const quanta = localFont({
  src: './QuantaGroteskProBold.otf',
})

const Page = () => {
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();

  // State for form inputs
  const [formData, setFormData] = useState({
    collectionAddress: "HDArn9La3DbPWaVPxAkyqyHfJ644wmgLUfPo132HBADd",
    mintAddress: "B9yLURHdYh8iv8GaPC4cd8NnXLGmCYXJstbRr1o9NXyr",
    originalAmount: 1,
    discountPercentage: 10,
    merchantWallet: "6p7UrAdysKfd65vSbKWRqANYcYEWckZM3Gn4ovwAhqUQ",
    purchaseDescription: "Solana mobile",
    rpcUrl: "https://devnet.helius-rpc.com/?api-key=c7e5b412-c980-4f46-8b06-2c85c0b4a08d",
    programAuthority: "CmMdpyDEuXbB9tbot1XaSNrvLq8q15HQGtbkBMMS65kc"
  });

  const [showForm, setShowForm] = useState(false);

  const handleConnect = () => {
    open();
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const resetToDefaults = () => {
    setFormData({
      collectionAddress: "HDArn9La3DbPWaVPxAkyqyHfJ644wmgLUfPo132HBADd",
      mintAddress: "B9yLURHdYh8iv8GaPC4cd8NnXLGmCYXJstbRr1o9NXyr",
      originalAmount: 1,
      discountPercentage: 10,
      merchantWallet: "6p7UrAdysKfd65vSbKWRqANYcYEWckZM3Gn4ovwAhqUQ",
      purchaseDescription: "Solana mobile",
      rpcUrl: "https://devnet.helius-rpc.com/?api-key=c7e5b412-c980-4f46-8b06-2c85c0b4a08d",
      programAuthority: "CmMdpyDEuXbB9tbot1XaSNrvLq8q15HQGtbkBMMS65kc"
    });
  };

  return (
    <>
      <main className="p-6">
        <header className="flex items-center gap-3 justify-between text-[14px]">
          <div className="flex items-center gap-1">
            <Image src={Logo} alt="logo" width={50} height={50} className="rounded-[8px] "/>
            <h1 className={`font-semibold text-[18px] md:flex hidden  ${quanta.className} `}>Supercharge</h1>
          </div>
          
          <span 
            className={`font-light opacity-50 text-[12px] cursor-pointer hover:opacity-70 transition-opacity flex gap-3 items-center ${quanta.className} `} 
            onClick={handleConnect}
          >
            {!isConnected ? 'Connect Wallet' : <span className="text-green-600">Connected:  <span className="text-[#111]">{address?.slice(0, 6)}...{address?.slice(-4)}</span> </span> } 
          </span>
        </header>

        <div className="flex items-center justify-center h-full  flex-col md:mt-[150px] mt-[100px] ">
          <div className="w-full max-w-[800px] flex flex-col gap-4">
            <div className={`text-2xl font-semibold mb-6 ${quanta.className} `}>
              <h1>SuperCharge your Products</h1>
              <h1 className="opacity-50">
                Check out with ease. Come back for the rewards.
              </h1>
            </div>

            {/* Toggle Form Button */}
            <div className="flex gap-3 items-center">
              <h1 className="text-[14px] py-2">
                Try out Demo
              </h1>
              <button
                onClick={() => setShowForm(!showForm)}
                className="text-[12px] px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                {showForm ? 'Hide Config' : 'Show Config'}
              </button>
            </div>

            {/* Configuration Form */}
            {showForm && (
              <div className="bg-gray-50 p-6 rounded-lg border mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className={`text-lg font-semibold ${quanta.className}`}>
                    Checkout Configuration
                  </h2>
                  <button
                    onClick={resetToDefaults}
                    className="text-[12px] px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                  >
                    Reset Defaults
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Collection Address</label>
                    <input
                      type="text"
                      name="collectionAddress"
                      value={formData.collectionAddress}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded text-sm font-mono"
                      placeholder="Collection address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Mint Address</label>
                    <input
                      type="text"
                      name="mintAddress"
                      value={formData.mintAddress}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded text-sm font-mono"
                      placeholder="Mint address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Original Amount (SOL)</label>
                    <input
                      type="number"
                      name="originalAmount"
                      value={formData.originalAmount}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      className="w-full p-2 border rounded text-sm"
                      placeholder="Amount in SOL"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Discount Percentage</label>
                    <input
                      type="number"
                      name="discountPercentage"
                      value={formData.discountPercentage}
                      onChange={handleInputChange}
                      min="0"
                      max="100"
                      className="w-full p-2 border rounded text-sm"
                      placeholder="Discount %"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Merchant Wallet</label>
                    <input
                      type="text"
                      name="merchantWallet"
                      value={formData.merchantWallet}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded text-sm font-mono"
                      placeholder="Merchant wallet address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Purchase Description</label>
                    <input
                      type="text"
                      name="purchaseDescription"
                      value={formData.purchaseDescription}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded text-sm"
                      placeholder="Product description"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">RPC URL</label>
                    <input
                      type="text"
                      name="rpcUrl"
                      value={formData.rpcUrl}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded text-sm font-mono"
                      placeholder="Solana RPC endpoint"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Program Authority</label>
                    <input
                      type="text"
                      name="programAuthority"
                      value={formData.programAuthority}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded text-sm font-mono"
                      placeholder="Program authority address"
                    />
                  </div>
                </div>

                {/* Current Values Display */}
                <div className="mt-4 p-3 bg-white rounded border">
                  <h3 className="text-sm font-semibold mb-2">Current Configuration:</h3>
                  <div className="text-xs space-y-1 text-gray-600">
                    <div><strong>Amount:</strong> {formData.originalAmount} SOL</div>
                    <div><strong>Discount:</strong> {formData.discountPercentage}%</div>
                    <div><strong>Final Price:</strong> {(formData.originalAmount * (1 - formData.discountPercentage / 100)).toFixed(4)} SOL</div>
                    <div><strong>Product:</strong> {formData.purchaseDescription}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Checkout Button with Dynamic Props */}
            <CheckoutButton
              walletAddress={address}
              collectionAddress={formData.collectionAddress}
              mintAddress={formData.mintAddress}
              originalAmount={formData.originalAmount}
              discountPercentage={formData.discountPercentage}
              merchantWallet={formData.merchantWallet}
              purchaseDescription={formData.purchaseDescription}
              rpcUrl={formData.rpcUrl}
              programAuthority={formData.programAuthority}
            />
          </div>
        </div>

        {/* 
        <footer className="flex items-center justify-center">
          <div className="flex gap-2 items-center text-[12px] opacity-70 font-semibold">
            Powered by 
            <Image
              src={verxioLogo}
              alt="verxio-logo"
              width={40}
              height={40}
              className="rounded-full"
            />
          </div>
        </footer> 
        */}
      </main>
    </>
  );
};

export default Page;