"use client";
import React, { useState, useEffect } from "react";
import padlockIcon from "@/public/padlock.png";
import Image from "next/image";
import solanapayIcon from "@/public/solana.svg";
import checkIcon from "@/public/check.png";
import warningIcon from "@/public/warning.png";
import closeIcon from "@/public/close.png";
import usdcIcon from "@/public/usdc.png";
import logoIcon from "@/public/logo.png";
import { ToastContainer, toast } from "react-toastify";
import {
  useAppKit,
  useAppKitAccount,
  useAppKitProvider,
} from "@reown/appkit/react";
import QRCode from "react-qr-code";
import {
  Cluster,
  clusterApiUrl,
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  Commitment,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
  Message,
  ParsedAccountData
} from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createTransferCheckedInstruction,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import bs58 from "bs58";
import {
  encodeURL,
  createQR,
  validateTransfer,
  FindReferenceError,
  findReference,
} from "@solana/pay";
import BigNumber from "bignumber.js";
import { createTransfer, parseURL } from "@/app/lib/index";
import { TransferRequestURL } from "@/app/lib/parseURL";
import { CUSTOMER_WALLET } from "./constant";
import type { Provider } from "@reown/appkit-adapter-solana/react";

const Page = () => {
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const wallet = address ? new PublicKey(address) : null;
  const { walletProvider } = useAppKitProvider<Provider>("solana");
  const connection = new Connection(
    "https://mainnet.helius-rpc.com/?api-key=c7e5b412-c980-4f46-8b06-2c85c0b4a08d",
    "confirmed"
  );
  const commitment: Commitment = "processed";
  const [paymentStatus, setPaymentStatus] = useState(false);
  const [isLoading, setIsLoading] = useState(false);


 // const urlParams = new URLSearchParams(window.location.search);
  // const transactionUuid = urlParams.get("transaction_uuid");
  // console.log(urlParams);
  // console.log(transactionUuid);
  const recipient = new PublicKey(
    "6CosoQbwT83vniGvPARw9DbRtt3nA6GRsKYzMBLM9aoB"
  );
  const amount = 1;
  const label = "Coffee Purchase ";
  const message = "Thanks for the coffee!";
  const memo = "Order #12345";
  const reference = new Keypair().publicKey;
  
 


  // const verifyTransfer = async (
  //   recipient: PublicKey,
  //   amount: BigNumber,
  //   reference: PublicKey,
  //   memo: string
  // ) => {
  //   try {
  //     console.log(reference)
  //     console.log(`5. Verifying the payment`);
  //     let signatureInfo;
   
  //     const { signature } = await new Promise<{ signature: string }>((resolve, reject) => {
         
  //         const interval = setInterval(async () => {
  //             console.count('Checking for transaction...'+reference);
  //             try {
  //                 signatureInfo = await findReference(connection, reference, { finality: 'confirmed' });
  //                 console.log('\n Signature: ', signatureInfo.signature,signatureInfo);
  //                 clearInterval(interval);
  //                 resolve(signatureInfo);
  //             } catch (error: any) {
  //                 if (!(error instanceof FindReferenceError)) {
  //                     console.error(error);
  //                     clearInterval(interval);
  //                     reject(error);
  //                 }
  //             }
  //         }, 250);
  //     });
  
  //     setPaymentStatus("success");
  //     setQrCode(undefined);
      
  //     alert('verified')
     
  //   } catch (err) {
  //     console.error("Failed to create transfer:", err);
  //   }
  // };

  // const CreateTransfer = async (
  //   recipient: PublicKey,
  //   amount: BigNumber,
  //   memo: string,
  //   label: string,
  //   reference:PublicKey,
  //   message:string,
  //   // spltoken:PublicKey

  // ) => {
  //   try {
      
  //     console.log(reference)
  //     const url = encodeURL({
  //       recipient,
  //       amount,
  //       label,
  //       reference,
  //       message,
  //       memo,
  //       // splToken,
  //     });
  //     setQrCodeValue(url.toString());
  //     const qr = createQR(url);

  //     const qrBlob = await qr.getRawData("png");
  //     if (!qrBlob) return;
      
  //     const reader = new FileReader();
  //     reader.onload = (event) => {
  //       if (typeof event.target?.result === "string") {
  //         setQrCode(event.target.result);
  //       }
  //     };
  //     reader.readAsDataURL(qrBlob);

      
  //   } catch (err) {
  //     console.error("failed", err);
  //   }
  // };

  const CreateTransfer = async () => {
    setIsLoading(true)
    if (!wallet) {
      setPaymentStatus(false);
      return;
    }
    try {
     
  
      const tokenMint = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
      const to = new PublicKey("GtR7Tmu6eRpWKSpT1uspPUqVZhuGgyF4vgqqkjuzz2ZV");
  
      const senderATA = await getAssociatedTokenAddress(tokenMint, wallet, true);
      const toATA = await getAssociatedTokenAddress(tokenMint, to, true);
  
      const tx = new Transaction();
      const toInfo = await connection.getAccountInfo(toATA);
      if (!toInfo) {
        tx.add(createAssociatedTokenAccountInstruction(wallet, toATA, to, tokenMint));
      }
  
      const mintInfo = await connection.getParsedAccountInfo(tokenMint);
      const decimals = (mintInfo.value?.data as ParsedAccountData)?.parsed?.info?.decimals || 0;
      const amounts = amount! * Math.pow(10, decimals);

      tx.add(
        createTransferCheckedInstruction(
          senderATA,
          tokenMint,
          toATA,
          wallet,
          amount,
          decimals
        )
      );
  
      const latestBlockhash = await connection.getLatestBlockhash();
      tx.recentBlockhash = latestBlockhash.blockhash;
      tx.feePayer = wallet;
  
      const signedTx = await walletProvider.signTransaction(tx);
      const signature = await connection.sendRawTransaction(signedTx.serialize(), {
        skipPreflight: true,
      });
  
      await connection.confirmTransaction(
        {
          signature,
          blockhash: latestBlockhash.blockhash,
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        },
        commitment
      );  setIsLoading(false)
      console.log("Transaction ID:", signature);
      toast.success(`Transaction ID: ${signature}`);
      setPaymentStatus(true)
      return { success: true };

    } catch (err) {
      console.error("USDC transfer failed:", err);
      return { error: "Transaction failed." };
    }
  };



  const handleConnectWallet = async () => {
    open();
  };
  const shortenAddress = (address: string | undefined) => {
    if (!address) return "";
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };


  return (
    <div className="flex items-center justify-center mx-2">
    <main className="flex items-center justify-center md:h-screen pt-[50px] md:pt-[0px] max-w-[500px] w-full">
      <ToastContainer
          position="bottom-left"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
      <div className="flex-col w-full">
        <h1 className="font-bold text-[14px]  to-blue-600 mt-[10px] flex justify-between pb-1">
          SUPERCHARGE CHECKOUT <span className="cursor-pointer bg-blue-700 text-[#fff] px-[5px] py-[5px] rounded-[8px] text-[11px] font-light" onClick={handleConnectWallet}>{isConnected ? shortenAddress(address) : "Connect wallet"}</span>
        </h1>
        <div className="flex items-start md:items-center font-light text-[12px] md:text-[12px] opacity-80 gap-1 sm:flex-row flex-col ">

       
        <p className=" flex items-center justify-center">
          Use one of the payment methods below to pay
         
         
        </p>
        <span className="flex items-center gap-1">
        {amount ? `$${amount} USDC`  : "$10" } <Image src={usdcIcon} width={15} height={15} alt="padlockicon" /> to {label || "Merchant"}
         
          
          

          </span>
        </div>
        {!paymentStatus && (
        <div>
          <button
            className="bg-[#cacaca33] px-[10px] py-[12px] cursor-pointer my-2 flex items-center gap-2 text-[#555555] hover:opacity-75 w-full"
            onClick={() => CreateTransfer()}
            disabled={isLoading}
          >
            Pay with Solana wallet
            <Image
              src={solanapayIcon}
              width={20}
              height={20}
              alt="solanapayIcon"
            />
          </button>
        </div>
      )}

        <div className="flex items-center justify-center  ">

        
        </div>

<div className="py-7">


        {paymentStatus && (
        <Success price={amount} organisation={label} />
        )}
        </div>
       {/* <Error/> */}
      
        <div className="flex items-center justify-center gap-4">
        {!paymentStatus && (
          <button className="flex items-center  gap-1 py-[5px] text-[13px] justify-center bg-[#cacaca33]  rounded-[8px]  w-[140px] mt-[20px] font-light cursor-pointer "  >
            {" "}
            <Image
              src={closeIcon}
              width={11}
              height={11}
              alt="padlockicon"
            />{" "}
            Cancel Payment
          </button>
        )}

          {paymentStatus && (
          <button className="flex items-center  gap-1 py-[5px] text-[13px] justify-center bg-[#cacaca33]  rounded-[8px]  w-[140px] mt-[20px] font-light cursor-pointer " >
            {" "}
            
             Back to Merchant
          </button>
           )}
         
         
        </div>
        <section className="flex items-center gap-3 font-light justify-center mt-[50px] text-[14px]">
          <Image src={padlockIcon} width={20} height={20} alt="padlockicon" />

          <div className="flex gap-1">
            secured by <span className="font-bold text-blue-700 flex items-center gap-1 ">supercharge

            <Image src={logoIcon} width={20} height={20} alt="Logoicon" />
            </span>
          </div>
        </section>
      </div>
    </main>
    </div>
  );
};

export default Page;

const Success = ({
  price,
  organisation,
}: {
  price: number | null;
  organisation: string | null;
}) => {
  return (
    <main className="flex flex-col items-center justify-center p-7">
      <Image src={checkIcon} width={200} height={200} alt="padlockicon" />
      <h1 className="pt-[15px]  ">Payment Successful</h1>
      <p className="pt-[5px] font-light text-[14px]">
        You paid ${price} to {organisation}
      </p>
    </main>
  );
};

const Error = () => {
  return (
    <main className="flex flex-col items-center justify-center">
      <Image src={warningIcon} width={80} height={80} alt="padlockicon" />
      <h1 className="pt-[15px]  ">Payment failed</h1>
      <p className="py-[30px] font-light text-[14px]">User cancels the order</p>
      <div className="flex flex-col gap-3 w-full">
        <button className="bg-[#0077D4]  py-[6px] text-[#fff] rounded-[8px] cursor-pointer">
          Try Again
        </button>
        <button className="border-[#0077D4] border w-full py-[6px]  rounded-[8px] cursor-pointer">
          Cancel
        </button>
      </div>
    </main>
  );
};


