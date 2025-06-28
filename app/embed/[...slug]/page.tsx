"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import padlockIcon from "@/public/padlock.png";
import solanapayIcon from "@/public/solana.svg";
import checkIcon from "@/public/check.png";
// import warningIcon from "@/public/warning.png";
// import closeIcon from "@/public/close.png";
import usdcIcon from "@/public/usdc.png";
import logoIcon from "@/public/verxio-logo.jpg";
import { quanta } from "@/app/fonts";
import { ToastContainer, toast } from "react-toastify";
import {
  initializeVerxio,
  getWalletLoyaltyPasses,
  getProgramDetails,
  // getAssetData,
  issueLoyaltyPass,
} from "@verxioprotocol/core";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  publicKey,
  generateSigner,
  signerIdentity,
} from "@metaplex-foundation/umi";
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
import Link from "next/link";

interface Data {
  amount: number;
  label: string;
  memo: string;
  merchant_wallet_address: string;
  message: string;
  redirectUrl: string;
}

const Page = () => {
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const wallet = address ? new PublicKey(address) : null;
  // const router = useRouter();
  const params = useParams();
  const { walletProvider } = useAppKitProvider<Provider>("solana");
  const connection = new Connection(
    "https://mainnet.helius-rpc.com/?api-key=c7e5b412-c980-4f46-8b06-2c85c0b4a08d",
    "confirmed"
  );
  const commitment: Commitment = "processed";
  const [paymentStatus, setPaymentStatus] = useState(false);
  const [loyal, setLoyal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<Data | null>(null);
  const amount = 1;
  // const label = "Coffee Purchase ";
  // const message = "Thanks for the coffee!";
  // const memo = "Order #12345";
  // const reference = new Keypair().publicKey;

  // const originalAmount = 1;
  // const discountPercentage = 10;
  // const merchantWallet = "6p7UrAdysKfd65vSbKWRqANYcYEWckZM3Gn4ovwAhqUQ";
  // const purchaseDescription = "Solana mobile";
  const BASE_URL = typeof window !== "undefined" ? window.location.origin : "";
  const rpcUrl =
    "https://devnet.helius-rpc.com/?api-key=c7e5b412-c980-4f46-8b06-2c85c0b4a08d";
  const programAuthority = "CmMdpyDEuXbB9tbot1XaSNrvLq8q15HQGtbkBMMS65kc";
  const collectionAddress = "HDArn9La3DbPWaVPxAkyqyHfJ644wmgLUfPo132HBADd";
  // const mintAddress = "B9yLURHdYh8iv8GaPC4cd8NnXLGmCYXJstbRr1o9NXyr";

  const CreateTransfer = async () => {
    setIsLoading(true);
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
          amount,
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
      console.error("USDC transfer failed:", err);
      return { error: "Transaction failed." };
    }
  };

  const handleConnectWallet = async () => {
    open();
    const umi = createUmi(rpcUrl);
    // Initialize program
    const context = initializeVerxio(umi, publicKey(programAuthority));
    context.collectionAddress = publicKey(collectionAddress);
    console.log(context);

    if (!address) {
      console.error("No wallet address available");
      return;
    }
    // const passes = await getAssetData(context, publicKey(address));
    const passes = await getWalletLoyaltyPasses(context, publicKey(address));

    console.log(passes);

    setLoyal(Array.isArray(passes) && passes.length > 0);
    console.log("Loyalty passes found:", passes);
  };

  const handleClaimLoyaltyPass = async () => {
    try {
      if (!address || !wallet || !data?.merchant_wallet_address) {
        console.error("No wallet address or merchant data available");
        return;
      }

      // Create UMI instance
      const umi = createUmi(rpcUrl);
      console.log(umi);
      const updateAuthority = generateSigner(umi);

      // Set the signer identity on UMI
      umi.use(signerIdentity(updateAuthority));

      // Initialize program
      const context = initializeVerxio(umi, publicKey(programAuthority));
      context.collectionAddress = publicKey(collectionAddress);
      const assetData = await getProgramDetails(context);
      console.log(assetData);

      const result = await issueLoyaltyPass(context, {
        collectionAddress: context.collectionAddress,
        recipient: publicKey(address),
        passName: assetData?.name || "Coffee Rewards Pass",
        passMetadataUri: assetData?.uri || "https://arweave.net/...",
        updateAuthority: updateAuthority,
      });

      console.log(result);
      console.log("Claiming loyalty pass for wallet:", address);
    } catch (err) {
      console.error("Claim error:", err);
      //   setError('Failed to claim loyalty pass. Please try again.');
    } finally {
    }
  };

  const shortenAddress = (address: string | undefined) => {
    if (!address) return "";
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

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

  return (
    <div className="flex items-center justify-center mx-2">
      {isLoading && !data ? (
        <div className="flex items-center justify-center h-screen w-full">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-700"></div>
        </div>
      ) : (
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
              <div className={` ${quanta.className}flex items-center`}>
                {" "}
                Supercharge Checkout{" "}
                {loyal ? (
                  <span className="text-[8px] bg-green-400 text-[#fff] px-[4px] py-[1px] ml-[8px] rounded-[8px]">
                    LOYAL
                  </span>
                ) : (
                  <span className="text-[8px] bg-red-400 text-[#fff] px-[4px] py-[1px] ml-[8px] rounded-[8px]">
                    {" "}
                    NOT LOYAL{" "}
                  </span>
                )}
              </div>

              <span
                className="cursor-pointer bg-blue-700 text-[#fff] px-[12px] py-[5px] rounded-[8px] text-[11px] font-light"
                onClick={handleConnectWallet}
              >
                {isConnected ? shortenAddress(address) : "Connect wallet"}
              </span>
            </h1>
            <div className="flex items-start md:items-center font-light text-[12px] md:text-[12px] opacity-80 gap-1  py-[5px]">
              <p className=" flex items-center justify-center">
                Use the payment method to pay
              </p>
              <span className="flex items-center gap-1">
                {`$${data?.amount} USDC`}{" "}
                {/* <Image
                  src={usdcIcon}
                  width={15}
                  height={15}
                  alt="padlockicon"
                />{" "} */}
                to {data?.label}
              </span>
            </div>
            {!paymentStatus && (
              <div>
                <button
                  className="bg-[#cacaca33] px-[10px] py-[12px] cursor-pointer my-2 flex items-center gap-2 text-[#6f6e6e] hover:opacity-75 w-full text-[13px]"
                  onClick={() => CreateTransfer()}
                  disabled={isLoading}
                >
                  Pay with Solana wallet
                  <Image
                    src={solanapayIcon}
                    width={15}
                    height={15}
                    alt="solanapayIcon"
                  />
                </button>
              </div>
            )}

            <div className="flex items-center justify-center  "></div>

            <div className="py-7">
              {paymentStatus && (
                <Success
                  price={data?.amount ?? null}
                  organisation={data?.label ?? null}
                />
              )}
            </div>
            {/* <Error/> */}

            <div className="flex items-center justify-center gap-4">
              {paymentStatus && (
                <Link href={`${data?.redirectUrl}`}>
                  <button className="flex items-center  gap-1 py-[5px] text-[13px] justify-center bg-[#cacaca33]  rounded-[8px]  w-[140px] mt-[20px] font-light cursor-pointer ">
                    {" "}
                    Back to Merchant
                  </button>
                </Link>
              )}
              {paymentStatus && (
                <button
                  onClick={handleClaimLoyaltyPass}
                  className="flex items-center  gap-1 py-[5px] text-[13px] justify-center bg-[#cacaca33]  rounded-[8px]  w-[140px] mt-[20px] font-light cursor-pointer "
                >
                  {" "}
                  Claim loyalty pass
                </button>
              )}
            </div>
            <section className="flex items-center gap-3 font-light justify-center mt-[50px] text-[14px]">
              <Image
                src={padlockIcon}
                width={12}
                height={12}
                alt="padlockicon"
              />

              <div className="flex gap-1 items-center text-[11px]">
                secured by
                <span className="font-bold text-blue-700 flex items-center gap-1 ">
                  <Image src={logoIcon} width={50} height={50} alt="Logoicon" />
                </span>
              </div>
            </section>
          </div>
        </main>
      )}
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

// const Error = () => {
//   return (
//     <main className="flex flex-col items-center justify-center">
//       <Image src={warningIcon} width={80} height={80} alt="padlockicon" />
//       <h1 className="pt-[15px]  ">Payment failed</h1>
//       <p className="py-[30px] font-light text-[14px]">User cancels the order</p>
//       <div className="flex flex-col gap-3 w-full">
//         <button className="bg-[#0077D4]  py-[6px] text-[#fff] rounded-[8px] cursor-pointer">
//           Try Again
//         </button>
//         <button className="border-[#0077D4] border w-full py-[6px]  rounded-[8px] cursor-pointer">
//           Cancel
//         </button>
//       </div>
//     </main>
//   );
// };
