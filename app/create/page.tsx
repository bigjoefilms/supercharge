"use client";
import React, { useState, ChangeEvent, useEffect } from "react";
import { PublicKey, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useAppKitProvider, useAppKitAccount ,useAppKit} from "@reown/appkit/react";
import type { Provider } from "@reown/appkit-adapter-solana/react";
import { quanta } from "@/app/fonts";
import { initializeVerxio,createLoyaltyProgram } from '@verxioprotocol/core'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import {  generateSigner } from '@metaplex-foundation/umi';
import { publicKey } from '@metaplex-foundation/umi'
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { cn } from "@/lib/utilis";
import Link from "next/link";
import { useDisconnect } from "@reown/appkit/react";
import { useRouter } from "next/navigation";





interface Tier {
  name: string;
  xpRequired: number;
  rewards: string[];
}

interface PointsPerAction {
  purchase: number;
  review: number;
  [key: string]: number;
}

interface FormData {
  loyaltyProgramName: string;
  organizationName: string;
  brandColor: string;
  description: string;
  tiers: Tier[];
  pointsPerAction: PointsPerAction;
}

const Create: React.FC = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const { disconnect } = useDisconnect();
  const [loading, setLoading] = useState<boolean>(false);
  const [checkingLoyalty, setCheckingLoyalty] = useState<boolean>(false);
  const [loyaltyData, setLoyaltyData] = useState<any>(null);
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider<Provider>("solana");
  const [formData, setFormData] = useState<FormData>({
    loyaltyProgramName: "",
    organizationName: "",
    brandColor: "#FF5733",
    description: "",
    tiers: [
      { name: "Bronze", xpRequired: 500, rewards: ["5% discount on purchases"] },
      { name: "Silver", xpRequired: 1000, rewards: ["10% discount on purchases"] }
    ],
    pointsPerAction: {
      purchase: 100,
      review: 50
    }
  });



  const wallet = address ? new PublicKey(address) : null;

  const checkLoyaltyProgram = async (walletAddress: string) => {
    setCheckingLoyalty(true);
    try {
      const response = await fetch(`/api/loyalty/${walletAddress}`);
      const data = await response.json();
      
      if (data.success) {
        setLoyaltyData(data.loyalty);
        console.log('✅ Found existing loyalty program:', data.loyalty);
      } else {
        setLoyaltyData(null);
        console.log('ℹ️ No existing loyalty program found');
      }
    } catch (error) {
      console.error('❌ Error checking loyalty program:', error);
      setLoyaltyData(null);
    }
    setCheckingLoyalty(false);
  };

  // Check for existing loyalty program when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      checkLoyaltyProgram(address);
    }
  }, [isConnected, address]);

  // Generate metadata automatically
  const generateMetadata = async (): Promise<string> => {


    try {
      return 'https://arweave.net/mock-metadata-uri';
    } catch (error) {
      console.error('Error generating metadata:', error);
      throw new Error('Failed to generate metadata');
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTierChange = (index: number, field: keyof Tier, value: string): void => {
    const updatedTiers = [...formData.tiers];
    if (field === 'rewards') {
      updatedTiers[index][field] = [value];
    } else if (field === 'xpRequired') {
      updatedTiers[index][field] = parseInt(value) || 0;
    } else {
      updatedTiers[index][field] = value;
    }
    setFormData(prev => ({
      ...prev,
      tiers: updatedTiers
    }));
  };

  const handlePointsChange = (action: string, value: string): void => {
    setFormData(prev => ({
      ...prev,
      pointsPerAction: {
        ...prev.pointsPerAction,
        [action]: parseInt(value) || 0
      }
    }));
  };

  const addTier = (): void => {
    setFormData(prev => ({
      ...prev,
      tiers: [...prev.tiers, { name: "", xpRequired: 0, rewards: [""] }]
    }));
  };

  const removeTier = (index: number): void => {
    if (formData.tiers.length > 1) {
      const updatedTiers = formData.tiers.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        tiers: updatedTiers
      }));
    }
  };

  const validateStep1 = (): boolean => {
    return formData.loyaltyProgramName.trim() !== "" && formData.organizationName.trim() !== "";
  };

  const handleNextStep = (): void => {
    if (validateStep1()) {
      setCurrentStep(2);
    } else {
      alert("Please fill in all required fields (Program Name and Organization Name)");
    }
  };

  const handleBackStep = (): void => {
    setCurrentStep(1);
  };

  const saveLoyaltyToAPI = async (walletAddress: string, collectionAddress: string, updateAuthority: object) => {
    try {
      const response = await fetch('/api/loyalty', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet_address: walletAddress,
          loyalty: {
            collection: collectionAddress,
            updateAuthority: updateAuthority,
          }
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Loyalty data saved to database:', data);
      } else {
        console.error('❌ Failed to save loyalty data:', data.message);
      }
    } catch (error) {
      console.error('❌ Error saving loyalty data:', error);
    }
  };

  const handleSubmit = async (): Promise<void> => {
    if (!isConnected || !wallet || !walletProvider) {
      alert("Please connect your wallet first");
      return;
    }

    // Check wallet balance
    const connection = new Connection('https://devnet.helius-rpc.com/?api-key=c7e5b412-c980-4f46-8b06-2c85c0b4a08d');
    const balance = await connection.getBalance(wallet);
    if (balance < LAMPORTS_PER_SOL * 0.1) {
      alert("Insufficient balance. Please ensure you have at least 0.1 SOL in your wallet.");
      return;
    }

    setLoading(true);

    try {
      const umi = createUmi('https://devnet.helius-rpc.com/?api-key=c7e5b412-c980-4f46-8b06-2c85c0b4a08d')

      const context = initializeVerxio(
        umi,
        address ? publicKey(address) : publicKey('11111111111111111111111111111111'),
      )

      // if (walletProvider) {
      //   // Patch the provider to ensure publicKey is never undefined
      //   const patchedProvider = {
      //     ...walletProvider,
      //     publicKey: walletProvider.publicKey ?? null,
      //   };
      //   context.umi.use(walletAdapterIdentity(patchedProvider));
      // }
      // Set Signer
      // if (walletProvider && walletProvider.publicKey !== undefined) {
      //   const compatibleAdapter: WalletAdapter = {
      //     ...walletProvider,
      //     publicKey: walletProvider.publicKey ?? null,
      //   };
      //   context.umi.use(walletAdapterIdentity(compatibleAdapter));
      // }
      if (walletProvider) {
        context.umi.use(walletAdapterIdentity(walletProvider as any));
      }

      console.log("Creating loyalty program with Verxio...");
      console.log("Generating metadata...");
      const metadataUri = await generateMetadata();
      console.log("Metadata URI created:", metadataUri);

      const result = await createLoyaltyProgram(context, {
        loyaltyProgramName: formData.loyaltyProgramName,
        metadataUri: metadataUri,
        programAuthority:context.programAuthority,
        updateAuthority: generateSigner(umi),
        metadata: {
          organizationName: formData.organizationName,
          brandColor: formData.brandColor,
          description: formData.description,
        },
        tiers: formData.tiers,
        pointsPerAction: formData.pointsPerAction,
      });

      // Save loyalty data to API
      if (address && result.collection && result.updateAuthority) {
        // Convert objects to string addresses safely
        const collectionAddress = String(result.collection.publicKey);
        const updateAuthority= result.updateAuthority;
        
        await saveLoyaltyToAPI(
          address,
          collectionAddress,
          updateAuthority
        );
      }


      console.log("🎉 Loyalty Program Created Successfully!");
      console.log("📊 Program Details:", {
        name: formData.loyaltyProgramName,
        organization: formData.organizationName,
        brandColor: formData.brandColor,
        tiersCount: formData.tiers.length,
        actionsConfigured: Object.keys(formData.pointsPerAction).length
      });
      console.log("🔗 Blockchain Result:", result);
      console.log("📋 Full Configuration:", formData);
      console.log("🔗 Metadata URI:", metadataUri);

      setCurrentStep(1);
      setLoading(false);
      
      // Reset form
      setFormData({
        loyaltyProgramName: "",
        organizationName: "",
        brandColor: "#FF5733",
        description: "",
        tiers: [
          { name: "Bronze", xpRequired: 500, rewards: ["5% discount on purchases"] },
          { name: "Silver", xpRequired: 1000, rewards: ["10% discount on purchases"] }
        ],
        pointsPerAction: {
          purchase: 100,
          review: 50
        }
      });
      disconnect()

    } catch (error) {
      console.error("Error creating loyalty program:", error);
      if (error instanceof Error) {
        if (error.message.includes("Simulation failed")) {
          alert("Transaction failed: Insufficient funds or invalid transaction. Please ensure you have enough SOL and try again.");
        } else {
          alert(`Failed to create loyalty program: ${error.message}`);
        }
      } else {
        alert("An unexpected error occurred. Please try again.");
      }
      setLoading(false);
    }
  };

  const handleConnectWallet = async () => {
   
    open();
   
  };
  const handleDisconnect = async () => {
    try {
      await disconnect(); // If disconnect is async, make sure to await
      router.push("/create");
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <div className="flex items-center">
          <div className="w-5 h-5 text-[11px] bg-[#7c0b0b] text-white rounded-full flex items-center justify-center  font-medium mr-3">
            1
          </div>
          <span className="text-sm font-medium text-gray-700">Basic Information</span>
        </div>
        <div className="flex-1 h-px bg-gray-200 mx-4"></div>
        <div className="flex items-center">
          <div className="w-5 h-5 bg-gray-200 text-[11px]  text-gray-500 rounded-full flex items-center justify-center text-sm font-medium mr-3">
            2
          </div>
          <span className="text-sm text-gray-500">Program Configuration</span>
        </div>
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Owner
          </label>
          <input
            type="text"
            name="loyaltyProgramName"
            value={formData.loyaltyProgramName}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[12px]"
            placeholder="e.g., Summer Rewards Program"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Organization Name
          </label>
          <input
            type="text"
            name="organizationName"
            value={formData.organizationName}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[12px]"
            placeholder="e.g., Coffee Brew"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Brand Color
          </label>
          <input
            type="color"
            name="brandColor"
            value={formData.brandColor}
            onChange={handleInputChange}
            className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description (Optional)
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[12px]"
            placeholder="Brief description of your loyalty program"
            rows={2}
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-end pt-6">
        <button
          type="button"
          onClick={handleNextStep}
          className="bg-[#7c0b0b] text-white px-6 py-3 rounded-lg font-medium hover:opacity-70 transition-colors text-[12px]"
        >
          Next
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <div className="flex items-center">
          <div className="w-5 h-5 text-[11px] bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
            ✓
          </div>
          <span className="text-sm font-medium text-green-600">Basic Information</span>
        </div>
        <div className="flex-1 h-px bg-gray-200 mx-4"></div>
        <div className="flex items-center">
          <div className="w-5 h-5 text-[11px] bg-[#7c0b0b] text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
            2
          </div>
          <span className="text-sm font-medium text-gray-700">Program Configuration</span>
        </div>
      </div>

      {/* Tiers Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-[14px] font-medium text-gray-800">Reward Tiers</h3>
          <button
            type="button"
            onClick={addTier}
            className="bg-[#000] text-white px-3 py-1 rounded-lg text-sm hover:bg-[#fff] hover:text-[#000] transition-colors text-[12px] cursor-pointer border border-black"
          >
            Add Tier
          </button>
        </div>
        
        <div className="space-y-4">
          {formData.tiers.map((tier, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-medium text-gray-700 text-[14px]">Tier {index + 1}</h4>
                {formData.tiers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTier(index)}
                    className="text-red-500 hover:text-red-700 text-sm cursor-pointer"
                  >
                    Remove
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Tier name (e.g., Bronze)"
                  value={tier.name}
                  onChange={(e) => handleTierChange(index, 'name', e.target.value)}
                  className="px-4 py-3 text-[12px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                
                <input
                  type="number"
                  placeholder="XP Required"
                  value={tier.xpRequired.toString()}
                  onChange={(e) => handleTierChange(index, 'xpRequired', e.target.value)}
                  className="px-4 py-3 text-[12px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                  required
                />
                
                <input
                  type="text"
                  placeholder="Rewards (e.g., 5% cashback)"
                  value={tier.rewards[0] || ''}
                  onChange={(e) => handleTierChange(index, 'rewards', e.target.value)}
                  className="px-4 py-3 text-[12px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Points Per Action */}
      <div>
        <h3 className="text-[14px] font-medium text-gray-800 mb-4">Points Per Action</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[14px] font-medium text-gray-700 mb-2">
              Purchase Points
            </label>
            <input
              type="number"
              value={formData.pointsPerAction.purchase.toString()}
              onChange={(e) => handlePointsChange('purchase', e.target.value)}
              className="w-full border px-4 py-3 text-[12px] border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Review Points
            </label>
            <input
              type="number"
              value={formData.pointsPerAction.review.toString()}
              onChange={(e) => handlePointsChange('review', e.target.value)}
              className="w-full px-4 py-3 text-[12px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
            />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <button
          type="button"
          onClick={handleBackStep}
          disabled={loading}
          className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-400 transition-colors disabled:opacity-50 text-[12px]"
        >
          Back
        </button>
        
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || !isConnected}
          className="bg-[#7c0b0b] text-white px-6 py-3 rounded-lg font-medium hover:opacity-70 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-[12px]"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              Creating Program...
            </>
          ) : (
            'Create Loyalty Program'
          )}
        </button>
      </div>
    </div>
  );

  // Show loading state while checking loyalty
  if (checkingLoyalty) {
    return (
      <div className="flex items-center justify-center pt-[40px] relative p-2 h-[80vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#7c0b0b] border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Checking loyalty program...</p>
        </div>
      </div>
    );
  }

  // Show existing loyalty program if found
  if (loyaltyData) {
    return (
      <div className="flex items-center justify-center pt-[10px] relative p-2 h-[80vh]">
        <div className="max-w-[500px] w-full text-center">
          <div className=" rounded-2xl  p-8 ">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Loyalty Program Found!</h2>
              <p className="text-gray-600 text-[12px]">You already have a loyalty program associated with this wallet.</p>
            </div>
            
            {/* <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-800 mb-2">Program Details:</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p><span className="font-medium">Collection Address:</span> {loyaltyData.collection}</p>
                <p><span className="font-medium">Update Authority:</span> {loyaltyData.updateAuthority}</p>
              </div>
            </div> */}

            <div className="flex gap-4 justify-center">
              <Link href="/scan">
                <button className="  bg-[#7c0b0b] text-[12px] px-6 py-3 rounded-lg font-medium hover:opacity-70 text-[#fff] transition-colors">
                  Create Payment
                </button>
              </Link>

              <button className="  underline text-[12px] px-6 py-3 rounded-lg font-medium hover:opacity-70 border transition-colors" onClick={handleDisconnect}>
                  Disconnect
                </button>
              {/* <button 
                onClick={() => {
                  setLoyaltyData(null);
                  setCurrentStep(1);
                }}
                className="bg-[#7c0b0b] text-white px-6 py-3 rounded-lg font-medium hover:opacity-70 transition-colors"
              >
                Create New Program
              </button> */}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show create loyalty program form if no existing program
  return (
    <div className="flex items-center justify-center pt-[40px] relative p-2 h-[80vh] overflow-scroll">
      <div
        className={cn(
          "absolute inset-0 -z-50 opacity-5",
          "[background-size:500px_500px]",
          "[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]",
          "dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]",
        )}
        style={{
          WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 60%, black 50%, transparent 100%)",
          maskImage: "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)"
        }}
      />
      <div className="flex flex-col gap-2 p-2 max-w-[500px] w-full h-[80vh]">
        <Link href="/">
          <span className="text-[14px] cursor-pointer underline">Back to Home</span>
        </Link>
        <div className={`text-2xl font-bold text-gray-800 ${quanta.className} pt-[20px]`}>
          Create Loyalty Program
        </div>
        
        <div className="rounded-2xl border-gray-200 pt-5">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[16px] font-semibold text-gray-800">
              {currentStep === 1 ? 'Step 1: Basic Information' : 'Step 2: Program Configuration'}
            </h2>
            <div className="text-xs text-gray-500">
              <span
                className="cursor-pointer bg-[#7c0b0b] text-[#fff] px-[12px] py-[12px] rounded-[8px] text-[11px]"
                onClick={handleConnectWallet}
              >
                {isConnected ? address?.slice(0,7) : "Connect wallet"}
              </span>
            </div>
          </div>

          {currentStep === 1 ? renderStep1() : renderStep2()}
        </div>

        
      </div>
    </div>
  );
};

export default Create;