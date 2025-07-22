"use client";
import React, { useState, useEffect ,useCallback} from "react";
import Image from "next/image";
import Logo from "@/public/usdc.png";
import checkLogo from "@/public/check.png";
import { toast } from "react-toastify";
import {
  getAssetData,
  getProgramDetails,
  getWalletLoyaltyPasses,
  giftLoyaltyPoints,
  initializeVerxio,
  issueLoyaltyPass,
} from "@verxioprotocol/core";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createSignerFromKeypair,
  generateSigner,
  publicKey,
} from "@metaplex-foundation/umi";
import { fromWeb3JsKeypair } from "@metaplex-foundation/umi-web3js-adapters";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import {
  useAppKit,
  useAppKitAccount,
  useAppKitProvider,
} from "@reown/appkit/react";
import {
  Connection,
  PublicKey,
  Transaction,
  Commitment,
  ParsedAccountData,
  Keypair,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createTransferCheckedInstruction,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import type { Provider } from "@reown/appkit-adapter-solana/react";
import { useParams } from "next/navigation";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


interface Data {
  amount: number;
  reference: string;
  memo: string;
  merchant_wallet_address: string;
  message: string;
  collection: string;
  authority: string;
  updateAuthority: {
    secretKey: number[];
  };
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
  const [organisation, setOrganisation] = useState<string>("");
  const [owner, setOwner] = useState<string>("");
  const commitment: Commitment = "processed";
  const [data, setData] = useState<Data | null>(null);
  const BASE_URL = typeof window !== "undefined" ? window.location.origin : "";
  const [, setPaymentStatus] = useState(false);
  const [, setIsLoading] = useState<boolean>(false);
  const [tier, setTier] = useState<string | null>(null);
const [xp, setXp] = useState<string | null>(null);
const [rewards, setRewards] = useState<string | null>(null);
  const [transactionStatus, setTransactionStatus] = useState<
    "idle" | "pending" | "success" | "failed"
  >("idle");
  // const [updateAuthority, setUpdateAuthority] = useState<{
  //   publicKey: string;
  //   secretKey: Uint8Array;
  // } | null>(null);


  const loadData = useCallback(
    async (walletAddress: string) => {
      if (!walletAddress) {
        console.warn("Wallet address is missing.");
        return;
      }
  
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
  
        const umi = createUmi(
          "https://devnet.helius-rpc.com/?api-key=c7e5b412-c980-4f46-8b06-2c85c0b4a08d"
        );
  
        const context = initializeVerxio(
          umi,
          publicKey(walletAddress ?? "11111111111111111111111111111111")
        );
  
        if (walletProvider) {
          context.umi.use(walletAdapterIdentity(walletProvider as any ));
        }
  
        if (response.data.collection) {
          context.collectionAddress = publicKey(response.data.collection);
        }
  
        const programDetails = await getProgramDetails(context);
        console.log("📊 Program Details:", programDetails);
  
        setOrganisation(programDetails.metadata.organizationName);
        setOwner(programDetails.name);
  
        const passes = await getWalletLoyaltyPasses(context, publicKey(walletAddress));
  
        if (passes.length > 0) {
          const pass = passes[0];
          const assetData = await getAssetData(context, publicKey(pass.publicKey));
          console.log("🎟️ Loyalty Pass Asset Data:", assetData);
  
          if (!assetData || !assetData.uri) {
            console.log("No asset data or URI found");
            return;
          }
  
          const metadataRes = await fetch(assetData.uri);
          const metadata = await metadataRes.json();
  
          const attributes = metadata.attributes || [];
  
          const foundTier = attributes.find((attr: any) => attr.trait_type === "Tier")?.value;
          const foundXp = attributes.find((attr: any) => attr.trait_type === "XP")?.value;
          const foundRewards = attributes.find((attr: any) => attr.trait_type === "Rewards")?.value;
  
          setTier(foundTier || null);
          setXp(foundXp || null);
          setRewards(foundRewards || null);
        } else {
          console.warn("No loyalty passes found for this wallet.");
        }
  
        console.log(passes);
      } catch (err) {
        console.log("failed", err);
      }
  
      setIsLoading(false);
    },
    [params.slug, walletProvider]
  );
  

  useEffect(() => {
    if (address) {
      loadData(address);
    }
  }, [address, loadData,, BASE_URL]);

  const CreateTransfer = async () => {
    setIsLoading(true);
    setTransactionStatus("pending");
    if (!wallet || !isConnected || !walletProvider) {
      setPaymentStatus(false);
      toast.error("Please connect your wallet.");
      setIsLoading(false);
      setTransactionStatus("idle");
      return;
    }
    try {
      if (!data || !data.merchant_wallet_address) {
        console.log("Merchant wallet address is missing");
        setIsLoading(false);
        setTransactionStatus("failed");
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

      const amountInSmallestUnit = Math.round(
        data.amount * Math.pow(10, decimals)
      );
      tx.add(
        createTransferCheckedInstruction(
          senderATA,
          tokenMint,
          toATA,
          wallet,
          amountInSmallestUnit,
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
      setTransactionStatus("success");
      toast.success(`Transaction successful! ID: ${signature}`);
      if (data?.reference) {
        await fetch(`/api/checkout/${data.reference}/status`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "success" }),
        });
      }
      setPaymentStatus(true);
      handleGiftbonus()
      return { success: true };

    } catch (err) {
      setPaymentStatus(false);
      setIsLoading(false);
      setTransactionStatus("failed");
      toast.error("USDC transfer failed. Please try again.");
      console.error("USDC transfer failed:", err);
      return { error: "Transaction failed." };
    }
  };

  const handleConnectWallet = async () => {
    open();
  };

  const handleGiftbonus  = async () => {
    try{
      if (!address || !wallet || !data?.merchant_wallet_address) {
        console.error("No wallet address or merchant data available");
        return;
      }
      const umi = createUmi(
        "https://devnet.helius-rpc.com/?api-key=c7e5b412-c980-4f46-8b06-2c85c0b4a08d"
      );

      const context = initializeVerxio(
        umi,
        publicKey(address ?? "11111111111111111111111111111111")
      );
      if (walletProvider) {
        context.umi.use(walletAdapterIdentity(walletProvider as any));
      }

      // Set the collection from database data
      if (data.collection) {
        context.collectionAddress = publicKey(data.collection);
        const secretKeyArray = Object.values(data.updateAuthority.secretKey);
      console.log("Secret key array length:", secretKeyArray.length);

      // Now convert to Uint8Array
      const rawSecretKey = new Uint8Array(secretKeyArray);
      console.log("Converted secret key length:", rawSecretKey.length);

      if (rawSecretKey.length !== 64) {
        console.error(
          `Invalid secret key length: ${rawSecretKey.length}, expected 64`
        );
        return;
      }

      const web3Keypair = Keypair.fromSecretKey(rawSecretKey);
      const umiKeypair = fromWeb3JsKeypair(web3Keypair);
      const signer = createSignerFromKeypair(context.umi, umiKeypair);
    
     const passes = await getWalletLoyaltyPasses(context, publicKey(address));
    if (passes.length > 0) {
      const pass = passes[0]; // or loop over all if needed
      const results = await giftLoyaltyPoints(context, {
        passAddress: publicKey(pass.publicKey),
        pointsToGift: 100,
        signer: signer, // Required: Program authority of the Loyalty Program
        action: 'bonus', // Reason for gifting points
      })
      console.log(results)
    
    }}
    
    }catch (err) {
      console.error("Claim error:", err);
    } finally {
    }
    
  };

  const handleClaimLoyaltyPass = async () => {
    try {
      if (!address || !wallet || !data?.merchant_wallet_address) {
        console.error("No wallet address or merchant data available");
        return;
      }
      const umi = createUmi(
        "https://devnet.helius-rpc.com/?api-key=c7e5b412-c980-4f46-8b06-2c85c0b4a08d"
      );

      const context = initializeVerxio(
        umi,
        publicKey(address ?? "11111111111111111111111111111111")
      );
      if (walletProvider) {
        context.umi.use(walletAdapterIdentity(walletProvider as any));
      }

      // Set the collection from database data
      if (data.collection) {
        context.collectionAddress = publicKey(data.collection);
      }

      const assetData = await getProgramDetails(context);
      console.log(assetData);

      if (!context.collectionAddress) {
        throw new Error("Collection address is missing");
      }

      const secretKeyArray = Object.values(data.updateAuthority.secretKey);
      console.log("Secret key array length:", secretKeyArray.length);

      // Now convert to Uint8Array
      const rawSecretKey = new Uint8Array(secretKeyArray);
      console.log("Converted secret key length:", rawSecretKey.length);

      if (rawSecretKey.length !== 64) {
        console.error(
          `Invalid secret key length: ${rawSecretKey.length}, expected 64`
        );
        return;
      }

      const web3Keypair = Keypair.fromSecretKey(rawSecretKey);
      const umiKeypair = fromWeb3JsKeypair(web3Keypair);
      const signer = createSignerFromKeypair(context.umi, umiKeypair);

      const result = await issueLoyaltyPass(context, {
        collectionAddress: context.collectionAddress,
        recipient: publicKey(address),
        passName: assetData?.name || "Coffee Rewards Pass",
        passMetadataUri: assetData?.uri || "https://arweave.net/...",
        assetSigner: generateSigner(context.umi),
        updateAuthority: signer,
      });

      console.log(result);
      console.log("Claiming loyalty pass for wallet:", address);
     
    } catch (err) {
      console.error("Claim error:", err);
    } finally {
    }
  };

  return (
    <main>
      <ToastContainer position="bottom-left" autoClose={4000} />
      <div className="flex justify-center items-center h-[80vh] flex-col px-[20px]">
        <div className="flex  flex-col items-start w-full max-w-[500px]  md:px-[0px]  rounded-3xl border-[#d9d6d6] py-[10px] font-bold text-[24px] ">
          {/* Status Banner */}
          {transactionStatus === "pending" && (
            <div className="w-full text-center py-2 rounded-2xl mb-2 font-medium">
              Payment Pending...
            </div>
          )}
          {transactionStatus === "success" && (
            <div className="w-full  text-center py-2 rounded-2xl mb-2 flex flex-col items-center gap-4 text-[30px]">
              Payment Successful!
              <span>
                <Image
                  src={checkLogo}
                  alt="logo"
                  width={50}
                  height={50}
                  className="mb-0.5"
                />
              </span>
            </div>
          )}
          {transactionStatus === "failed" && (
            <div className="w-full text-center py-2 rounded-2xl mb-2 font-medium">
              Payment Failed. Please try again.
            </div>
          )}
          <span className="text-[9px]   bg-[#F6F2EB] font-light opacity-55  ">
            Payment to
          </span>

          <h1 className="font-semibold text-[16px] opacity-75">
            {organisation}
          </h1>
          <span className="text-[12px] opacity-60">@{owner}</span>
        </div>
        <div className="max-w-[500px] mx-auto w-full  ">
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
              <h1 className="opacity-40 text-[14px]">
                REF# {data?.reference.slice(0, 9)}.....
              </h1>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center pt-[40px]">
              <span className="text-[14px] opacity-70">To</span>
              <span className="font-semibold">
                {data?.merchant_wallet_address.slice(0, 9)}.....
              </span>
            </div>
            <div className="flex justify-between items-center pt-[10px]">
              <span className="text-[14px] opacity-70">Tier </span>
              <span className="font-semibold">{tier}</span>
            </div>
            <div className="flex justify-between items-center pt-[10px]">
              <span className="text-[14px] opacity-70">Rewared </span>
              <span className="font-semibold">{rewards}</span>
            </div>
            <div className="flex justify-between items-center pt-[10px]">
              <span className="text-[14px] opacity-70">Points</span>
              <span className="font-semibold">{xp}</span>
            </div>
            <div className="flex justify-between items-center py-[10px]">
              <span className="text-[14px] opacity-70">Date</span>
              <span className="font-semibold">
                {new Date().toLocaleString("en-US", {
                  weekday: "short",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}
              </span>
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
              className={` underline rounded-[8px] justify-center border items-center flex text-[14px] text-[#222] font-medium py-[10px] w-full cursor-pointer hover:opacity-70 transition-opacity  gap-3 my-[20px] `}
              onClick={handleConnectWallet}
            >
              {!isConnected ? (
                "Connect Wallet"
              ) : (
                <span className="text-[#222]">
                  Disconnect{" "}
                  <span className="">
                    {/* {address?.slice(0, 6)}...{address?.slice(-4)} */}
                  </span>
                </span>
              )}
            </span>
            {transactionStatus !== "success" && (
              <span
                className={`font-light rounded-[8px] justify-center items-center flex text-[14px] text-[#fff] bg-[#7c0b0b] py-[10px] w-full cursor-pointer hover:opacity-70 transition-opacity gap-3 my-[20px]`}
                onClick={CreateTransfer}
              >
                Pay Now
              </span>
            )}
            {transactionStatus === "success" && (
              <span
                className={`font-light rounded-[8px] justify-center items-center flex text-[14px] text-[#fff] bg-gray-400 py-[10px] w-full cursor-not-allowed opacity-50 transition-opacity gap-3 my-[20px]`}
              >
                Pay Now
              </span>
            )}
          </button>
          {/* Show Claim Loyalty button after success (optional) */}
          {transactionStatus === "success" && (
            <button
              className="w-full mt-2 bg-[#7c0b0b] hover:opacity-80 text-white py-2 rounded-lg font-semibold cursor-pointer transition"
              onClick={handleClaimLoyaltyPass} // onClick={handleClaimLoyaltyPass} // Uncomment and implement if needed
            >
              Claim Loyalty Pass
            </button>
         )} 
        </div>
      </div>
    </main>
  );
};

export default Page;
