import { Keypair, PublicKey } from "@solana/web3.js";

export const MERCHANT_WALLET = new PublicKey(
  "HFUbHeTErgyumBSFNY25kCFv7WGGF7cfXcKCJ2hkfRpS"
);

// Keypair purely for testing purposes. Exists only on devnet
export const CUSTOMER_WALLET = Keypair.fromSecretKey(
  Uint8Array.from([
    121, 5, 69, 128, 188, 168, 88, 150, 167, 250, 193, 201, 96, 120, 75, 78, 182,
    202, 152, 121, 238, 181, 225, 95, 16, 153, 84, 181, 228, 232, 136, 162, 241,
    112, 81, 207, 40, 30, 104, 86, 172, 55, 223, 98, 131, 193, 196, 32, 138, 125,
    6, 80, 84, 205, 181, 27, 83, 160, 61, 115, 198, 75, 174, 127,
  ])
);


