"use client";
import React, { useState, useEffect} from "react";
import Image from "next/image";
import Logo from "@/public/usdc.png";
// import padlockIcon from "@/public/padlock.png";
// import solanapayIcon from "@/public/solana.svg";
// import checkIcon from "@/public/check.png";
// // import warningIcon from "@/public/warning.png";
// // import closeIcon from "@/public/close.png";
// // import usdcIcon from "@/public/usdc.png";
// import logoIcon from "@/public/verxio-logo.jpg";
// import { cn } from "@/lib/utilis";
import { toast } from "react-toastify";
// import {
//   initializeVerxio,
//   getWalletLoyaltyPasses,
//   getProgramDetails,
//   // getAssetData,
//   issueLoyaltyPass,
// } from "@verxioprotocol/core";
// import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
// import {
//   publicKey,
//   generateSigner,
//   signerIdentity,
// } from "@metaplex-foundation/umi";
import {
  useAppKit,
  useAppKitAccount,
  useAppKitProvider,
} from "@reown/appkit/react";
import {
  Connection,
  PublicKey,
  // Keypair,
  Transaction,
  Commitment,
  ParsedAccountData,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createTransferCheckedInstruction,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import type { Provider } from "@reown/appkit-adapter-solana/react";
import { useParams } from "next/navigation";
// import Link from "next/link";

interface Data {
  amount: number;
  reference: string;
  memo: string;
  merchant_wallet_address: string;
  message: string;
 
}

const Page = () => {
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const wallet = address ? new PublicKey(address) : null;
  const params = useParams();
  const { walletProvider } = useAppKitProvider<Provider>("solana");
  const connection = new Connection(
    "https://mainnet.helius-rpc.com/?api-key=c7e5b412-c980-4f46-8b06-2c85c0b4a08d",
    "confirmed"
  );
  // const rpcUrl =
  // "https://devnet.helius-rpc.com/?api-key=c7e5b412-c980-4f46-8b06-2c85c0b4a08d";


  const commitment: Commitment = "processed";
  const [data, setData] = useState<Data | null>(null);
  const BASE_URL = typeof window !== "undefined" ? window.location.origin : "";
  const [, setPaymentStatus] = useState(false);
  const [, setIsLoading] = useState<boolean>(false);
  // const [organisation, setOrganisation] = useState("");
  // const [loyal, setLoyal] = useState(false);
 
 

  const loadData = async () => {
    setIsLoading(true);
    try {
      console.log("loading data", params.slug);
      const res = await fetch(`${BASE_URL}/api/checkout/${params.slug}`);
      if (!res.ok) {
        console.log("Failed to fetch users");
        setIsLoading(false);
        return;
      }
      const response = await res.json();
      console.log(response.data);

      setData(response.data);
    } catch (err) {
      console.log("failed", err);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const CreateTransfer = async () => {
    setIsLoading(true);
    // const umi = createUmi(rpcUrl);
    // // Initialize program
    // const programAuth = data?.loyalty?.updateAuthority?.publicKey;
    // const collectionAddr = data?.loyalty?.collection?.publicKey;
    // console.log("programAuth", programAuth, collectionAddr);
    // if (!programAuth) {
    //   console.error("Program authority is missing");
    //   setIsLoading(false);
    //   return;
    // }
    // if (!collectionAddr) {
    //   console.error("Collection address is missing");
    //   setIsLoading(false);
    //   return;
    // }
    // const context = initializeVerxio(umi, publicKey(programAuth));
    // context.collectionAddress = publicKey(collectionAddr);
    // console.log(context);

    // if (!address) {
    //   console.error("No wallet address available");
    //   return;
    // }
    // const passes = await getWalletLoyaltyPasses(context, publicKey(address));
    // const assetData = await getProgramDetails(context);

    // console.log(assetData);
    // setOrganisation(assetData?.name ?? "");

    // setLoyal(Array.isArray(passes) && passes.length > 0);
    // console.log("Loyalty passes found:", passes);
    if (!wallet || !isConnected || !walletProvider) {
      setPaymentStatus(false);
      toast.error("Please connect your wallet.");
      setIsLoading(false);
      return;
    }
    try {
      if (!data || !data.merchant_wallet_address) {
        console.log("Merchant wallet address is missing");
        setIsLoading(false);
        return;
      }
      const to = new PublicKey(data.merchant_wallet_address);
      const tokenMint = new PublicKey(
        "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
      );
      const senderATA = await getAssociatedTokenAddress(
        tokenMint,
        wallet,
        true
      );
      const toATA = await getAssociatedTokenAddress(tokenMint, to, true);
      const tx = new Transaction();
      const toInfo = await connection.getAccountInfo(toATA);
      if (!toInfo) {
        tx.add(
          createAssociatedTokenAccountInstruction(wallet, toATA, to, tokenMint)
        );
      }

      const mintInfo = await connection.getParsedAccountInfo(tokenMint);
      const decimals =
        (mintInfo.value?.data as ParsedAccountData)?.parsed?.info?.decimals ||
        0;
      // const amounts = amount! * Math.pow(10, decimals);

      tx.add(
        createTransferCheckedInstruction(
          senderATA,
          tokenMint,
          toATA,
          wallet,
          data.amount,
          decimals
        )
      );

      const latestBlockhash = await connection.getLatestBlockhash();
      tx.recentBlockhash = latestBlockhash.blockhash;
      tx.feePayer = wallet;

      const signedTx = await walletProvider.signTransaction(tx);
      const signature = await connection.sendRawTransaction(
        signedTx.serialize(),
        {
          skipPreflight: true,
        }
      );

      await connection.confirmTransaction(
        {
          signature,
          blockhash: latestBlockhash.blockhash,
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        },
        commitment
      );
      setIsLoading(false);
      console.log("Transaction ID:", signature);
      toast.success(`Transaction ID: ${signature}`);
      setPaymentStatus(true);
      return { success: true };
    } catch (err) {
      setPaymentStatus(false);
      setIsLoading(false);
      console.error("USDC transfer failed:", err);
      return { error: "Transaction failed." };
    }
  };

  const handleConnectWallet = async () => {
    open();
  };

  // const handleClaimLoyaltyPass = async () => {
  //   try {
  //     if (!address || !wallet || !data?.merchant_wallet_address) {
  //       console.error("No wallet address or merchant data available");
  //       return;
  //     }

  //     // Create UMI instance
  //     const umi = createUmi(rpcUrl);
  //     console.log(umi);
  //     const updateAuthority = generateSigner(umi);

  //     // Set the signer identity on UMI
  //     umi.use(signerIdentity(updateAuthority));

  //     // Initialize program
  //     const programAuth = data?.loyalty?.updateAuthority?.publicKey;
  //     const collectionAddr = data?.loyalty?.collection?.publicKey;
  //     if (!programAuth) {
  //       console.error("Program authority is missing");
  //       return;
  //     }
  //     if (!collectionAddr) {
  //       console.error("Collection address is missing");
  //       return;
  //     }
  //     const context = initializeVerxio(umi, publicKey(programAuth));
  //     context.collectionAddress = publicKey(collectionAddr);
  //     const assetData = await getProgramDetails(context);
  //     console.log(assetData);

  //     const result = await issueLoyaltyPass(context, {
  //       collectionAddress: context.collectionAddress,
  //       recipient: publicKey(address),
  //       passName: assetData?.name || "Coffee Rewards Pass",
  //       passMetadataUri: assetData?.uri || "https://arweave.net/...",
  //       updateAuthority: updateAuthority,
  //     });

  //     console.log(result);
  //     console.log("Claiming loyalty pass for wallet:", address);
  //   } catch (err) {
  //     console.error("Claim error:", err);
  //     //   setError('Failed to claim loyalty pass. Please try again.');
  //   } finally {
  //   }
  // };

  

  return (
    <main>
      <div className="flex justify-center items-center h-[80vh] flex-col">
        <div className="max-w-[500px] mx-auto w-full p-6 ">
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-[12px] opacity-80">Amount</span>
              <span className="text-[24px] font-bold flex items-center gap-2">
                {data?.amount} Usdc
                <Image
                  src={Logo}
                  alt="logo"
                  width={25}
                  height={25}
                  className="mb-0.5"
                />
              </span>
            </div>
            <div>
              <h1 className="opacity-40 text-[14px]">REF# {data?.reference.slice(0,9)}.....</h1>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center pt-[40px]">
              <span className="text-[14px] opacity-70">To</span>
              <span className="font-semibold">{data?.merchant_wallet_address.slice(0,9)}.....</span>
            </div>
            <div className="flex justify-between items-center py-[10px]">
              <span className="text-[14px] opacity-70">Date</span>
              <span className="font-semibold">{new Date().toLocaleString('en-US', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[14px] opacity-70">Memo</span>
              <span className="font-semibold text-[20px]">{data?.memo}</span>
            </div>
          </div>
          <div className="flex flex-col mt-[35px] bg-[#edecec] px-[20px] py-[20px] rounded-[12px]">
            <span className="text-[14px] font-semibold">MESSAGE</span>
            <span className="text-[12px]">{data?.message}</span>
          </div>
          <button className="w-full flex gap-4">
      <span
           className={`font-light  rounded-[8px] justify-center items-center flex text-[14px] text-[#222] border border-[#7c0b0b] py-[10px] w-full cursor-pointer hover:opacity-70 transition-opacity  gap-3 my-[20px] `}
           onClick={handleConnectWallet}
         >
           {!isConnected ? (
             "Connect Wallet"
           ) : (
             <span className="text-[#222]">
               Disconnect{" "}
               <span className="">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
             </span>
           )}
          </span>
          <span
           className={`font-light  rounded-[8px] justify-center items-center flex text-[14px] text-[#fff] bg-[#7c0b0b] py-[10px] w-full cursor-pointer hover:opacity-70 transition-opacity  gap-3 my-[20px] `}
           onClick={CreateTransfer}
         >
           
             Pay Now
           
          </span>
      </button>
        </div>
       
      </div>
      
    </main>
  );
};

export default Page;
