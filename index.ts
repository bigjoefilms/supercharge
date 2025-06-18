import { initializeLoyalty } from 'supercharge-core'
import { generateSigner, createUmi } from '@metaplex-foundation/umi'

const programAuthority = '6p7UrAdysKfd65vSbKWRqANYcYEWckZM3Gn4ovwAhqUQ'
const rpcUrl = 'https://devnet.helius-rpc.com/?api-key=c7e5b412-c980-4f46-8b06-2c85c0b4a08d'
const umi = createUmi()
const feePayer = generateSigner(umi)

const context = initializeLoyalty(rpcUrl, programAuthority, feePayer)

console.log(context)