"use client"
import React from "react";
import Image from "next/image";
import { useAppKit } from "@reown/appkit/react";
import { useAppKitAccount } from "@reown/appkit/react";
import CheckoutButton from "@/components/CheckoutButton"; 
import Logo from "@/public/supermigrate.png"
import localFont from 'next/font/local'
import verxioLogo from "@/public/verxio-logo.jpg";
 
const quanta = localFont({
  src: './QuantaGroteskProBold.otf',
})


const Page = () => {
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();

  const handleConnect = () => {
    open();
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
            {/* <div className=" w-[2px] h-7 bg-[#a6a6a6] opacity-70 "></div> */}
            {!isConnected ? 'Connect Wallet' : <span className="text-green-600">Connected:  <span className="text-[#111]">{address?.slice(0, 6)}...{address?.slice(-4)}</span> </span> } 
          </span>
        </header>

        <div className="flex items-center justify-center h-[80vh] flex-col">
          <div className="w-full max-w-[500px] flex flex-col gap-4">
            <div className={`text-2xl font-semibold mb-6 ${quanta.className} `}>
              <h1>SuperCharge your Products</h1>
              <h1 className="opacity-50">
              Check out with ease. Come back for the rewards.
              </h1>
              
            </div>
            <h1 className="text-[14px] py-3">
                Try out Demo
              </h1>

            <CheckoutButton
              walletAddress={address}
              collectionAddress="HDArn9La3DbPWaVPxAkyqyHfJ644wmgLUfPo132HBADd"
              mintAddress="B9yLURHdYh8iv8GaPC4cd8NnXLGmCYXJstbRr1o9NXyr"
              originalAmount={10}
              discountPercentage={10}
              purchaseDescription="Solana mobile "
              rpcUrl="https://devnet.helius-rpc.com/?api-key=c7e5b412-c980-4f46-8b06-2c85c0b4a08d" // Replace with your RPC URL
              programAuthority="CmMdpyDEuXbB9tbot1XaSNrvLq8q15HQGtbkBMMS65kc" // Replace with actual program authority
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
        </footer> */}
      </main>
    </>
  );
};

export default Page;