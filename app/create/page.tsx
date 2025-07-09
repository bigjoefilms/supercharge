"use client";
import React, { useState, ChangeEvent } from "react";
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
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
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
  // const [downloadData, setDownloadData] = useState<any | null>(null);

  const shortenAddress = (address: string | undefined) => {
    if (!address) return "";
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };
 
  const wallet = address ? new PublicKey(address) : null;

  // Generate metadata automatically
  const generateMetadata = async (): Promise<string> => {
    // const metadata = getMetadata();
    // // const metadata = {
    // //   name: data.loyaltyProgramName,
    // //   description: data.description || `${data.loyaltyProgramName} - A loyalty program by ${data.organizationName}`,
    // //   image: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.organizationName)}&background=${data.brandColor.replace('#', '')}&color=fff&size=400`,
    // //   attributes: [
    // //     {
    // //       trait_type: "Organization",
    // //       value: data.organizationName
    // //     },
    // //     {
    // //       trait_type: "Brand Color",
    // //       value: data.brandColor
    // //     },
    // //     {
    // //       trait_type: "Total Tiers",
    // //       value: data.tiers.length.toString()
    // //     },
    // //     {
    // //       trait_type: "Actions Available",
    // //       value: Object.keys(data.pointsPerAction).length.toString()
    // //     }
    // //   ],
    // //   properties: {
    // //     category: "loyalty_program",
    // //     creators: [
    // //       {
    // //         address: address,
    // //         verified: true,
    // //         share: 100
    // //       }
    // //     ]
    // //   },
    // //   tiers: data.tiers,
    // //   pointsPerAction: data.pointsPerAction
    // // };

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

      if (walletProvider) {
        // Patch the provider to ensure publicKey is never undefined
        const patchedProvider = {
          ...walletProvider,
          publicKey: walletProvider.publicKey ?? null,
        };
        context.umi.use(walletAdapterIdentity(patchedProvider));
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

      // setDownloadData({
      //   collection: result.collection,
      //   updateAuthority: result.updateAuthority,
      // });

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

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-[#7c0b0b] text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
            1
          </div>
          <span className="text-sm font-medium text-gray-700">Basic Information</span>
        </div>
        <div className="flex-1 h-px bg-gray-200 mx-4"></div>
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm font-medium mr-3">
            2
          </div>
          <span className="text-sm text-gray-500">Program Configuration</span>
        </div>
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Program Name*
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
            Organization Name*
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
          <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
            ✓
          </div>
          <span className="text-sm font-medium text-green-600">Basic Information</span>
        </div>
        <div className="flex-1 h-px bg-gray-200 mx-4"></div>
        <div className="flex items-center">
          <div className="w-8 h-8 bg-[#7c0b0b] text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
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

  return (
    <div className="flex items-center justify-center pt-[40px] relative">
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
      <div className="flex flex-col gap-2 p-2 max-w-[500px] w-full">
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
                {isConnected ? shortenAddress(address) : "Connect wallet"}
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