'use client'

import React, { useState } from 'react'
import { quanta } from '../fonts'
import { cn } from "@/lib/utilis";
import {
    initializeVerxio,
    // getWalletLoyaltyPasses,
    // getProgramDetails,
    // getAssetData,
    createLoyaltyProgram,
    // issueLoyaltyPass,
  } from "@verxioprotocol/core";
  import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
  import { publicKey, generateSigner, signerIdentity } from "@metaplex-foundation/umi";

// TypeScript interfaces
interface Tier {
  id: string
  name: string
  xpRequired: number
  rewards: string[]
  benefits: string[]
  multiplier: number
}

interface PointsPerAction {
  purchase: number
  review: number
 
}

interface LoyaltyProgramMetadata {
  organizationName: string
  brandColor: string
  description: string
  logoUrl: string
  website: string
  contactEmail: string
  termsAndConditions: string
}

interface LoyaltyProgramFormData {
  loyaltyProgramName: string
  metadataUri: string
  rpcUrl: string
  programAuthority: string
  feePayerKeypair: string
  metadata: LoyaltyProgramMetadata
  tiers: Tier[]
  pointsPerAction: PointsPerAction
  expirationEnabled: boolean
  expirationDays: number
  maxPointsPerDay: number
  enableReferrals: boolean
  referralReward: number
}

const LoyaltyProgramForm: React.FC = () => {
  const [formData, setFormData] = useState<LoyaltyProgramFormData>({
    loyaltyProgramName: '',
    metadataUri: '',
    rpcUrl: 'https://api.mainnet-beta.solana.com',
    programAuthority: '',
    feePayerKeypair: '',
    metadata: {
      organizationName: '',
      brandColor: '#3B82F6',
      description: '',
      logoUrl: '',
      website: '',
      contactEmail: '',
      termsAndConditions: ''
    },
    tiers: [
      {
        id: '1',
        name: 'Bronze',
        xpRequired: 0,
        rewards: ['Welcome bonus'],
        benefits: ['Basic support'],
        multiplier: 1
      }
    ],
    pointsPerAction: {
      purchase: 100,
      review: 50,
     
    },
    expirationEnabled: false,
    expirationDays: 365,
    maxPointsPerDay: 1000,
    enableReferrals: true,
    referralReward: 200
  })

  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string>('')
  const programAuthority = "CmMdpyDEuXbB9tbot1XaSNrvLq8q15HQGtbkBMMS65kc";
  const collectionAddress = "HDArn9La3DbPWaVPxAkyqyHfJ644wmgLUfPo132HBADd";
//   const mintAddress = "B9yLURHdYh8iv8GaPC4cd8NnXLGmCYXJstbRr1o9NXyr";
  const rpcUrl ="https://devnet.helius-rpc.com/?api-key=c7e5b412-c980-4f46-8b06-2c85c0b4a08d";   
  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleMetadataChange = (field: keyof LoyaltyProgramMetadata, value: string) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [field]: value
      }
    }))
  }

  const handlePointsChange = (action: keyof PointsPerAction, value: number) => {
    setFormData(prev => ({
      ...prev,
      pointsPerAction: {
        ...prev.pointsPerAction,
        [action]: value
      }
    }))
  }

  const handleTierChange = (tierId: string, field: keyof Tier, value: string | number | string[]) => {
    setFormData(prev => ({
      ...prev,
      tiers: prev.tiers.map(tier => 
        tier.id === tierId ? { ...tier, [field]: value } : tier
      )
    }))
  }

  const addTier = () => {
    const newTier: Tier = {
      id: Date.now().toString(),
      name: '',
      xpRequired: 0,
      rewards: [''],
      benefits: [''],
      multiplier: 1
    }
    setFormData(prev => ({
      ...prev,
      tiers: [...prev.tiers, newTier]
    }))
  }

  const removeTier = (tierId: string) => {
    setFormData(prev => ({
      ...prev,
      tiers: prev.tiers.filter(tier => tier.id !== tierId)
    }))
  }

  const addRewardToTier = (tierId: string) => {
    setFormData(prev => ({
      ...prev,
      tiers: prev.tiers.map(tier => 
        tier.id === tierId 
          ? { ...tier, rewards: [...tier.rewards, ''] }
          : tier
      )
    }))
  }

  const updateTierReward = (tierId: string, rewardIndex: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      tiers: prev.tiers.map(tier => 
        tier.id === tierId 
          ? { 
              ...tier, 
              rewards: tier.rewards.map((reward, index) => 
                index === rewardIndex ? value : reward
              )
            }
          : tier
      )
    }))
  }

  const addBenefitToTier = (tierId: string) => {
    setFormData(prev => ({
      ...prev,
      tiers: prev.tiers.map(tier => 
        tier.id === tierId 
          ? { ...tier, benefits: [...tier.benefits, ''] }
          : tier
      )
    }))
  }

  const updateTierBenefit = (tierId: string, benefitIndex: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      tiers: prev.tiers.map(tier => 
        tier.id === tierId 
          ? { 
              ...tier, 
              benefits: tier.benefits.map((benefit, index) => 
                index === benefitIndex ? value : benefit
              )
            }
          : tier
      )
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    try {
    //   // Create UMI instance
    //   const umi = createUmi(formData.rpcUrl)
      
    //   // Initialize program
    //   const context = initializeVerxio(
    //     umi,
    //     publicKey(formData.programAuthority)
    //   )
      // Create UMI instance
      const umi = createUmi(rpcUrl);
      console.log(umi);
      const updateAuthority = generateSigner(umi);
      
      // Set the signer identity on UMI
      umi.use(signerIdentity(updateAuthority));

      // Initialize program
      const context = initializeVerxio(umi, publicKey(programAuthority));
      context.collectionAddress = publicKey(collectionAddress);
      
      // Set signer
    //   context.umi.use(keypairIdentity())
      
      
      // Clean up tiers data
      const cleanTiers = formData.tiers.map(tier => ({
        name: tier.name,
        xpRequired: tier.xpRequired,
        rewards: tier.rewards.filter(reward => reward.trim() !== '')
      }))
      
      // Create loyalty program
      const result = await createLoyaltyProgram(context, {
        loyaltyProgramName: formData.loyaltyProgramName,
        metadataUri: formData.metadataUri,
        programAuthority: context.programAuthority,
        updateAuthority: generateSigner(context.umi),
        metadata: {
          organizationName: formData.metadata.organizationName,
          brandColor: formData.metadata.brandColor,
          description: formData.metadata.description,
          logoUrl: formData.metadata.logoUrl,
          website: formData.metadata.website,
          contactEmail: formData.metadata.contactEmail,
          termsAndConditions: formData.metadata.termsAndConditions
        },
        tiers: cleanTiers,
        pointsPerAction: {
            purchase:   6,
            review: 50,
          },
        // pointsPerAction: formData.pointsPerAction,
        // expirationEnabled: formData.expirationEnabled,
        // expirationDays: formData.expirationDays,
        // maxPointsPerDay: formData.maxPointsPerDay,
        // enableReferrals: formData.enableReferrals,
        // referralReward: formData.referralReward
      })
      
      setResult(JSON.stringify(result))
      console.log('Loyalty Program Created:', result)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error creating loyalty program:', err)
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <div className="min-h-screen  py-8 relative">
          <div
        className={cn(
          "absolute inset-0 -z-50 opacity-5",
          "[background-size:40px_40px]",
          "[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]",
          "dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]",
        )}
        style={{
          WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 60%, black 50%, transparent 100%)",
          maskImage: "linear-gradient(to right, transparent 0%, black 60%, black 90%, transparent 100%)"
        }}
      />
      <div className="max-w-[1440px] mx-auto px-4">
        <div className=" overflow-hidden">
          <div className={`${quanta.className} px-8 py-6`}>
            <h1 className="text-3xl font-bold">Create Loyalty Program</h1>
            <p className="mt-2">Build your custom loyalty program powered Verxio Protocol</p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-8 space-y-8 bg-[#fff]">
            {/* Basic Information */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-blue-200 pb-2">
                Basic Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Program Name *
                  </label>
                  <input
                    type="text"
                    value={formData.loyaltyProgramName}
                    onChange={(e) => handleInputChange('loyaltyProgramName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Summer Rewards Program"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization Name *
                  </label>
                  <input
                    type="text"
                    value={formData.metadata.organizationName}
                    onChange={(e) => handleMetadataChange('organizationName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Coffee Brew Co."
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    RPC URL *
                  </label>
                  <input
                    type="url"
                    value={formData.rpcUrl}
                    onChange={(e) => handleInputChange('rpcUrl', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://api.mainnet-beta.solana.com"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Program Authority Public Key *
                  </label>
                  <input
                    type="text"
                    value={formData.programAuthority}
                    onChange={(e) => handleInputChange('programAuthority', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter program authority public key"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fee Payer Keypair *
                  </label>
                  <input
                    type="text"
                    value={formData.feePayerKeypair}
                    onChange={(e) => handleInputChange('feePayerKeypair', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter fee payer keypair"
                    required
                  />
                </div>
                
             
              </div>
            </div>

            {/* Organization Details */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-blue-200 pb-2">
                Organization Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brand Color
                  </label>
                  <input
                    type="color"
                    value={formData.metadata.brandColor}
                    onChange={(e) => handleMetadataChange('brandColor', e.target.value)}
                    className="w-full h-12 border border-gray-300 rounded-lg cursor-pointer"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logo URL
                  </label>
                  <input
                    type="url"
                    value={formData.metadata.logoUrl}
                    onChange={(e) => handleMetadataChange('logoUrl', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/logo.png"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    value={formData.metadata.website}
                    onChange={(e) => handleMetadataChange('website', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={formData.metadata.contactEmail}
                    onChange={(e) => handleMetadataChange('contactEmail', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="contact@example.com"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.metadata.description}
                  onChange={(e) => handleMetadataChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe your loyalty program..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Terms and Conditions
                </label>
                <textarea
                  value={formData.metadata.termsAndConditions}
                  onChange={(e) => handleMetadataChange('termsAndConditions', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter terms and conditions..."
                />
              </div>
            </div>

            {/* Points Configuration */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-blue-200 pb-2">
                Points Configuration
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(formData.pointsPerAction).map(([action, points]) => (
                  <div key={action}>
                    <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                      {action.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                    <input
                      type="number"
                      value={points}
                      onChange={(e) => handlePointsChange(action as keyof PointsPerAction, parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                    />
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Points Per Day
                  </label>
                  <input
                    type="number"
                    value={formData.maxPointsPerDay}
                    onChange={(e) => handleInputChange('maxPointsPerDay', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                  />
                </div>
                
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="enableReferrals"
                    checked={formData.enableReferrals}
                    onChange={(e) => handleInputChange('enableReferrals', e.target.checked)}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="enableReferrals" className="text-sm font-medium text-gray-700">
                    Enable Referrals
                  </label>
                </div>
                
                {formData.enableReferrals && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Referral Reward Points
                    </label>
                    <input
                      type="number"
                      value={formData.referralReward}
                      onChange={(e) => handleInputChange('referralReward', parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                    />
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="expirationEnabled"
                    checked={formData.expirationEnabled}
                    onChange={(e) => handleInputChange('expirationEnabled', e.target.checked)}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="expirationEnabled" className="text-sm font-medium text-gray-700">
                    Enable Points Expiration
                  </label>
                </div>
                
                {formData.expirationEnabled && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiration Days
                    </label>
                    <input
                      type="number"
                      value={formData.expirationDays}
                      onChange={(e) => handleInputChange('expirationDays', parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="1"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Tiers Configuration */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-blue-200 pb-2">
                  Loyalty Tiers
                </h2>
                <button
                  type="button"
                  onClick={addTier}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Tier
                </button>
              </div>
              
              <div className="space-y-6">
                {formData.tiers.map((tier, index) => (
                  <div key={tier.id} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Tier {index + 1}
                      </h3>
                      {formData.tiers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTier(tier.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tier Name
                        </label>
                        <input
                          type="text"
                          value={tier.name}
                          onChange={(e) => handleTierChange(tier.id, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., Gold"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          XP Required
                        </label>
                        <input
                          type="number"
                          value={tier.xpRequired}
                          onChange={(e) => handleTierChange(tier.id, 'xpRequired', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          min="0"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Points Multiplier
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={tier.multiplier}
                          onChange={(e) => handleTierChange(tier.id, 'multiplier', parseFloat(e.target.value) || 1)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          min="0.1"
                          max="10"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Rewards
                          </label>
                          <button
                            type="button"
                            onClick={() => addRewardToTier(tier.id)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Add Reward
                          </button>
                        </div>
                        {tier.rewards.map((reward, rewardIndex) => (
                          <input
                            key={rewardIndex}
                            type="text"
                            value={reward}
                            onChange={(e) => updateTierReward(tier.id, rewardIndex, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
                            placeholder="e.g., 5% cashback"
                          />
                        ))}
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Benefits
                          </label>
                          <button
                            type="button"
                            onClick={() => addBenefitToTier(tier.id)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Add Benefit
                          </button>
                        </div>
                        {tier.benefits.map((benefit, benefitIndex) => (
                          <input
                            key={benefitIndex}
                            type="text"
                            value={benefit}
                            onChange={(e) => updateTierBenefit(tier.id, benefitIndex, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
                            placeholder="e.g., Priority support"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {/* Result Display */}
            {result && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  Program Created Successfully!
                </h3>
                <pre className="text-sm text-green-700 bg-green-100 p-3 rounded overflow-auto">
                  {result}
                </pre>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
              >
                {isLoading ? 'Creating Program...' : 'Create Loyalty Program'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoyaltyProgramForm