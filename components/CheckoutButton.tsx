"use client"
import React, { useState, useEffect } from 'react';
import { initializeVerxio, getWalletLoyaltyPasses, getProgramDetails, getAssetData } from '@verxioprotocol/core';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { publicKey } from '@metaplex-foundation/umi';
import { encodeURL, createQR } from '@solana/pay';
import { PublicKey} from '@solana/web3.js';
import UsdcLogo from '@/public/usdc.png'
import BigNumber from 'bignumber.js';
import Image from 'next/image';
import localFont from 'next/font/local'
import verxioLogo from "@/public/verxio-logo.jpg";
 
const quanta = localFont({
  src: '../app/QuantaGroteskProBold.otf',
})

interface LoyaltyPassDetails {
  name: string;
}

interface CheckoutDetails {
  originalAmount: number;
  newAmount: number;
  discountAmount: number;
  organisation: string;
  discountPercentage: number;
  organizationName: string;
  loyaltyPassFound: boolean;
  loyaltyPassDetails: LoyaltyPassDetails | null;
  canClaimPass: boolean;
  purchaseDescription: string;
}

interface SolanaPayUrlParams {
  recipient: PublicKey;
  amount: BigNumber;
  label: string;
  message: string;
  memo: string;
  'spl-token': string;
  reference?: PublicKey[];
}


interface CheckoutButtonProps {
  walletAddress?: string | undefined;
//   isConnected: boolean;
//   onConnect: () => void;
  originalAmount?: number;
  rpcUrl?: string;
  programAuthority?: string;
  merchantWallet: string;
  reference?: string;
  collectionAddress : string;
  mintAddress: string
  discountPercentage: number;
  purchaseDescription:string;
}

const CheckoutButton: React.FC<CheckoutButtonProps> = ({ 
  walletAddress, 
  collectionAddress,
  mintAddress,
  originalAmount = 100,
  purchaseDescription,
  discountPercentage,
  rpcUrl ,
  programAuthority ,
  merchantWallet,
  reference
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutDetails, setCheckoutDetails] = useState<CheckoutDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [organisation, setOrganisation] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  // const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [showQrCode, setShowQrCode] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [animationKey, setAnimationKey] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'verified' | 'not-verified' | 'success'>('pending');
  const [showClaimOption, setShowClaimOption] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  // const [transactionSignature, setTransactionSignature] = useState<string | null>(null);

  // Handle initial load animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // useEffect(() => {
  //   let intervalId: NodeJS.Timeout;

  //   const verifyTransaction = async () => {
  //     if (!transactionSignature || !rpcUrl) return;

  //     try {
  //       const connection = new Connection(rpcUrl);
  //       const status = await connection.getSignatureStatus(transactionSignature);
        
  //       if (status?.value?.confirmationStatus === 'confirmed' || status?.value?.confirmationStatus === 'finalized') {
  //         setPaymentStatus('success');
  //         clearInterval(intervalId);
  //         setTimeout(() => {
  //           resetCheckout();
  //         }, 3000);
  //       }
  //     } catch (error) {
  //       console.error('Error verifying transaction:', error);
  //     }
  //   };

  //   if (transactionSignature) {
  //     intervalId = setInterval(verifyTransaction, 2000); // Check every 2 seconds
  //   }

  //   return () => {
  //     if (intervalId) {
  //       clearInterval(intervalId);
  //     }
  //   };
  // }, [transactionSignature, rpcUrl]);

  const handleCheckout = async () => {
    if (!walletAddress) {
     alert('No address found')
      return;
    }

    setIsLoading(true);
    setError(null);
    setShowClaimOption(false);
    setClaimSuccess(false);
    
    try {
      if (!rpcUrl) {
        throw new Error('RPC URL is required');
      }
      if (!programAuthority) {
        throw new Error('Program authority is required');
      }
      // Create UMI instance
      const umi = createUmi(rpcUrl);
      
      // Initialize program
      const context = initializeVerxio(
        umi,
        publicKey(programAuthority),
      );

      context.collectionAddress = publicKey(collectionAddress)

      console.log(context)
      
      const programDetails = await getProgramDetails(context)
      console.log(programDetails)
      setOrganisation(programDetails.metadata.organizationName)

      const assetData = await getAssetData(context, publicKey(mintAddress))
      console.log(assetData)

      // Get wallet loyalty passes
      const passes = await getWalletLoyaltyPasses(
        context, 
        walletAddress ? publicKey(walletAddress) : publicKey(programAuthority)
      );

      console.log('Loyalty passes found:', passes);

      // Calculate discount based on loyalty passes
     
      let loyaltyPass: LoyaltyPassDetails | null = null;
      let canClaimPass = false;
      
      if (passes && passes.length > 0) {
        // Use the first loyalty pass found
        loyaltyPass = { name: passes[0].name };
      } else {
        // No passes found, user can claim one
        canClaimPass = true;
      }

      const discountAmount = (originalAmount * discountPercentage) / 100;
      const newAmount = originalAmount - discountAmount;

      const details: CheckoutDetails = {
        originalAmount,
        newAmount,
        discountAmount,
        organisation: organisation || 'Merchant',
        discountPercentage,
        organizationName: organisation || 'Merchant',
        loyaltyPassFound: !!loyaltyPass,
        loyaltyPassDetails: loyaltyPass,
        canClaimPass,
        purchaseDescription,
      };

      setCheckoutDetails(details);
      
      // Show claim option if no passes found
      if (canClaimPass) {
        setShowClaimOption(true);
      }
      
      setAnimationKey(prev => prev + 1);
      
    } catch (err) {
      console.error('Checkout error:', err);
      setError('Failed to process checkout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimLoyaltyPass = async () => {
    setIsClaiming(true);
    setError(null);
    
    try {
      if (!rpcUrl) {
        throw new Error('RPC URL is required');
      }
      if (!programAuthority) {
        throw new Error('Program authority is required');
      }
      // Create UMI instance
      const umi = createUmi(rpcUrl);
      
      // Initialize program
      const context = initializeVerxio(
        umi,
        publicKey(programAuthority),
      );

      context.collectionAddress = publicKey("HDArn9La3DbPWaVPxAkyqyHfJ644wmgLUfPo132HBADd")

      // TODO: Add your actual claim loyalty pass function here
      // This would typically be a function from @verxioprotocol/core
      // Example: await claimLoyaltyPass(context, publicKey(walletAddress));
      
      // For now, we'll simulate the claim process
      console.log('Claiming loyalty pass for wallet:', walletAddress);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // After claiming, re-check for passes and update checkout details
      // const passes = await getWalletLoyaltyPasses(
      //   context, 
      //   walletAddress ? publicKey(walletAddress) : publicKey(programAuthority)
      // );

      // Simulate successful claim by updating state
      if (checkoutDetails) {
        const discountPercentage = 10; // 10% discount for new loyalty pass
        const discountAmount = (checkoutDetails.originalAmount * discountPercentage) / 100;
        const newAmount = checkoutDetails.originalAmount - discountAmount;

        const updatedDetails = {
          ...checkoutDetails,
          newAmount,
          discountAmount,
          discountPercentage,
          loyaltyPassFound: true,
          loyaltyPassDetails: { name: 'New Loyalty Pass' },
          canClaimPass: false
        };

        setCheckoutDetails(updatedDetails);
        setClaimSuccess(true);
        setShowClaimOption(false);
        setAnimationKey(prev => prev + 1);
      }
      
    } catch (err) {
      console.error('Claim error:', err);
      setError('Failed to claim loyalty pass. Please try again.');
    } finally {
      setIsClaiming(false);
    }
  };

 // Generate Solana Pay URL   
const generateUrl = async (
  recipient: PublicKey,
  amount: BigNumber,
  reference: PublicKey | undefined,
  label: string,
  message: string,
  memo: string
) => {
  console.log('1. Create a payment request link');
  
  const urlParams: SolanaPayUrlParams = {
    recipient,
    amount,
    label,
    message,
    memo,
    'spl-token': 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' // USDC token mint address
  };
       
  if (reference) {
    urlParams.reference = [reference];
  }
            
  const url: URL = encodeURL(urlParams);
  console.log('Payment request link:', url);
  return url;
};


 const generateSolanaPayQR = async (amount: number) => {
  try {
    const recipient = new PublicKey(merchantWallet);
    const amount_usdc = amount; // Amount is already in USDC
    const referenceKey = reference ? new PublicKey(reference) : undefined;
           
    const url = await generateUrl(
      recipient,
      new BigNumber(amount_usdc),
      referenceKey,
      organisation || 'Merchant',
      `Payment for ${purchaseDescription || 'Merchant'}`,
      `Order-${Date.now()}`
    );

    // setPaymentUrl(url.toString());
    const qr = createQR(url, 300, 'transparent');
    const qrBlob = await qr.getRawData('png');
           
    if (qrBlob) {
      const qrUrl = URL.createObjectURL(qrBlob);
      setQrCode(qrUrl);
      setShowQrCode(true);
      setPaymentStatus('pending');
      setAnimationKey(prev => prev + 1);
    }
  } catch (error) {
    console.error('Error generating QR code:', error);
    setError('Failed to generate payment QR code. Please try again.');
  }
};

const finalizeCheckout = async () => {
  if (checkoutDetails) {
    await generateSolanaPayQR(checkoutDetails.newAmount);
  }
};

  // const handleVerifyClick = async () => {
  //   const reference = "6p7UrAdysKfd65vSbKWRqANYcYEWckZM3Gn4ovwAhqUQ";
  //   const rpcUrl = "https://devnet.helius-rpc.com/?api-key=c7e5b412-c980-4f46-8b06-2c85c0b4a08d";
    
  //   if (!merchantWallet) {
  //     setError('Merchant wallet address is required');
  //     return;
  //   }

  //   setIsLoading(true);
  //   setError(null);
    
  //   try {
  //     const connection = new Connection(rpcUrl);
  //     const merchantPubkey = new PublicKey(merchantWallet);
      
  //     // Get initial balance
  //     const initialBalance = await connection.getBalance(merchantPubkey);
      
  //     // Check for balance changes
  //     const checkBalance = async () => {
  //       const currentBalance = await connection.getBalance(merchantPubkey);
  //       if (currentBalance > initialBalance) {
  //         setPaymentStatus('success');
  //         const transactionObject = {
  //           status: 'verified',
  //           merchantAddress: merchantWallet,
  //           amount: checkoutDetails?.newAmount,
  //           timestamp: new Date().toISOString(),
  //           balanceChange: currentBalance - initialBalance,
  //           organizationName: organisation,
  //           receipt: {
  //             transactionId: reference,
  //             amount: checkoutDetails?.newAmount,
  //             currency: 'USDC',
  //             date: new Date().toISOString(),
  //             merchant: organisation,
  //             loyaltyDiscount: checkoutDetails?.discountAmount || 0
  //           }
  //         };
          
  //         console.log('Payment Receipt:', transactionObject);
          
  //         setTimeout(() => {
  //           resetCheckout();
  //         }, 3000);
  //         return true;
  //       }
  //       return false;
  //     };

  //     // Check immediately
  //     if (await checkBalance()) {
  //       return;
  //     }

  //     // Set up polling
  //     const intervalId = setInterval(async () => {
  //       if (await checkBalance()) {
  //         clearInterval(intervalId);
  //       }
  //     }, 2000);

  //     // Clear interval after 2 minutes (timeout)
  //     setTimeout(() => {
  //       clearInterval(intervalId);
  //       if (paymentStatus !== 'success') {
  //         setPaymentStatus('not-verified');
  //         setTimeout(() => {
  //           setPaymentStatus('pending');
  //         }, 3000);
  //       }
  //     }, 120000);

  //   } catch (error) {
  //     console.error('Error verifying payment:', error);
  //     setError('Error verifying payment. Please try again.');
  //     setPaymentStatus('not-verified');
  //     setTimeout(() => {
  //       setPaymentStatus('pending');
  //     }, 3000);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const resetCheckout = () => {
    setCheckoutDetails(null);
    setError(null);
    setShowQrCode(false);
    setQrCode(null);
    // setPaymentUrl(null);
    setPaymentStatus('pending');
    setShowClaimOption(false);
    setClaimSuccess(false);
    setAnimationKey(prev => prev + 1);
  };

  const animationStyles = `
    @keyframes dropDown {
      0% {
        opacity: 0;
        transform: translateY(-20px);
      }
      100% {
        opacity: 1;
        transform: translateY(0);
      }
    }
    @keyframes fadeIn {
      0% {
        opacity: 0;
        transform: scale(0.95);
      }
      100% {
        opacity: 1;
        transform: scale(1);
      }
    }
    @keyframes slideIn {
      0% {
        opacity: 0;
        transform: translateX(-10px);
      }
      100% {
        opacity: 1;
        transform: translateX(0);
      }
    }
    @keyframes bounce {
      0%, 20%, 53%, 80%, 100% {
        transform: translate3d(0,0,0);
      }
      40%, 43% {
        transform: translate3d(0, -10px, 0);
      }
      70% {
        transform: translate3d(0, -5px, 0);
      }
    }
  `;

  const dropdownAnimation = `
    animate-[dropDown_0.6s_ease-out_forwards]
    opacity-0
    transform translate-y-[-20px]
  `;

  // Show QR Code view
  if (showQrCode && qrCode) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: animationStyles }} />
        <div 
          key={`qr-${animationKey}`}
          className={`w-full space-y-4 ${dropdownAnimation}`}
        >
          <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <h3 className="text-lg font-semibold mb-3">Scan to Pay or Click Pay Now</h3>
            
            <div className="flex justify-center mb-4">
              <Image 
                src={qrCode} 
                alt="Solana Pay QR Code" 
                className="w-64 h-64 border rounded-lg animate-[fadeIn_0.8s_ease-out_0.3s_both]"
              />
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="text-gray-600">
                Amount to Pay: <span className="font-semibold text-lg text-green-600">
                  ${checkoutDetails?.newAmount.toFixed(2)}
                </span>
              </div>
              <div className="text-gray-500">
                Scan QR code with your Solana wallet or click &quot;Pay Now&quot; to open in your wallet app
              </div>
            </div>

            {/* Payment Status Messages */}
            {paymentStatus === 'success' && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg animate-[slideIn_0.4s_ease-out]">
                <div className="flex items-center justify-center gap-2 text-green-700 font-medium">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Payment Successfully Verified!
                </div>
                <p className="text-green-600 text-sm mt-1">Transaction has been confirmed on the blockchain.</p>
              </div>
            )}

            {paymentStatus === 'not-verified' && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg animate-[slideIn_0.4s_ease-out]">
                <div className="flex items-center justify-center gap-2 text-red-700 font-medium">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Payment Not Verified
                </div>
                <p className="text-red-600 text-sm mt-1">Transaction not found. Please complete payment and try again.</p>
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <button
              // onClick={handleVerifyClick}
              disabled={isLoading || paymentStatus === 'success'}
              className="flex-1 bg-[#0077D4] text-white py-3 rounded-lg text-sm font-semibold hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Verifying...
                </>
              ) : paymentStatus === 'success' ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Verified
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Verify Payment
                </>
              )}
            </button>
            
            <button
              onClick={resetCheckout}
              disabled={paymentStatus === 'success'}
              className="px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.02]"
            >
              Cancel
            </button>
          </div>
        </div>
        <footer className={`flex items-center justify-center  ${quanta.className} `}>
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
      </>
    );
  }

  // Show checkout details view
  if (checkoutDetails) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: animationStyles }} />
        <div 
          key={`details-${animationKey}`}
          className={`w-full space-y-4 ${dropdownAnimation}`}
        >
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="text-[16px] font-semibold mb-3">Checkout Details</h3>
            
            <div className="space-y-2 text-[12px]">
              <div className="flex justify-between">
                <span className="text-gray-600">Organization:</span>
                <span className="font-medium">{organisation}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Original Amount:</span>
                <span className="font-medium">${checkoutDetails.originalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Purchase Description</span>
                <span className="font-medium">{checkoutDetails.purchaseDescription}</span>
              </div>
             
              
              {checkoutDetails.loyaltyPassFound && (
                <>
                  <div className="flex justify-between text-green-600">
                    <span>Loyalty Discount ({checkoutDetails.discountPercentage}%):</span>
                    <span>-${checkoutDetails.discountAmount.toFixed(2)}</span>
                  </div>
                  
                  <div className={`bg-green-50 p-2 rounded text-xs ${claimSuccess ? 'animate-[bounce_1s_ease-out]' : 'animate-[slideIn_0.5s_ease-out_0.4s_both]'}`}>
                    <div className="text-green-700 font-medium">
                      {claimSuccess ? 'Loyalty Pass Claimed Successfully!' : ' Loyalty Pass Applied!'}
                    </div>
                    <div className="text-green-600">
                      Pass: {checkoutDetails.loyaltyPassDetails?.name || 'Loyalty Pass'}
                    </div>
                  </div>
           
                </>
              )}

              {/* No Loyalty Pass Found - Show Claim Option */}
              {showClaimOption && checkoutDetails.canClaimPass && (
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg animate-[slideIn_0.5s_ease-out]">
                  <div className="flex items-center gap-2 text-blue-700 font-medium mb-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    No Loyalty Pass Found
                  </div>
                  <div className="text-blue-600 text-xs mb-3">
                    Claim your first loyalty pass to get 10% discount on this and future purchases!
                  </div>
                  <button
                    onClick={handleClaimLoyaltyPass}
                    disabled={isClaiming}
                    className="w-full bg-blue-600 text-white py-2 px-3 rounded text-xs font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    {isClaiming ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Claiming Pass...
                      </>
                    ) : (
                      <>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Claim Free Loyalty Pass
                      </>
                    )}
                  </button>
                </div>
              )}
              
              <hr className="my-2" />
              
              <div className="flex justify-between text-[16px] font-semibold">
                <span>Final Amount:</span>
                <span className={checkoutDetails.loyaltyPassFound ? 'text-green-600 flex items-center gap-1' : ''}>
                  ${checkoutDetails.newAmount.toFixed(2)}
                  <Image src={UsdcLogo} alt="usdc-logo" width={15} height={15}/>
                </span>
              </div>
              
              {checkoutDetails.loyaltyPassFound && (
                <div className="text-xs text-green-600">
                  You saved ${checkoutDetails.discountAmount.toFixed(2)}!
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={finalizeCheckout}
              disabled={isClaiming}
              className="flex-1 bg-[#0077D4] text-white py-3 rounded-lg text-sm font-semibold hover:bg-[#0066BB] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.02]"
            >
              Generate Payment QR
            </button>
            <button
              onClick={resetCheckout}
              disabled={isClaiming}
              className="px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.02]"
            >
              Back
            </button>
          </div>
        </div>
        <footer className={`flex items-center justify-center  ${quanta.className} `}>
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
      </>
    );
  }

  // Initial checkout button view
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: animationStyles }} />
      <div 
        className={`w-full ${isInitialLoad ? 'opacity-0 transform translate-y-[-20px]' : 'animate-[dropDown_0.6s_ease-out_forwards]'}`}
      >
        {error && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-2xl animate-[slideIn_0.4s_ease-out]">
            <p className="text-red-700 text-sm">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="text-red-600 text-xs underline mt-1 hover:text-red-800 transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}
        
        <button
          onClick={handleCheckout}
          disabled={isLoading}
          className="bg-[#0077D4] text-white w-full py-3 rounded-lg text-sm font-semibold hover:bg-[#0066BB] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.02] hover:shadow-lg"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Processing...
            </>
          ) : ' Checkout' }
        </button>
      </div>

      <footer className={`flex items-center justify-center  ${quanta.className} `}>
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
    </>
  );
};

export default CheckoutButton;