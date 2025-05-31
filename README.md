# Supercharge

A modern web application for loyalty-based checkout powered by the Verxio protocol. Supercharge allows users to make purchases with ease while earning rewards for their loyalty.

## Features

- 🔗 Wallet Integration: Connect your Solana wallet seamlessly
- 💳 Easy Checkout: Streamlined checkout process
- 🎁 Loyalty Rewards: Earn rewards for your purchases
- 🎨 Modern UI: Clean and intuitive user interface
- 🔒 Secure Transactions: Built on Solana blockchain

## Tech Stack

- **Framework**: Next.js
- **Language**: TypeScript
- **Blockchain**: Solana
- **Wallet Integration**: AppKit
- **Styling**: Tailwind CSS
- **Fonts**: 
  - Quanta Grotesk Pro (Bold)
  - Telegraf (Regular, Light, Bold)
  - Geist (Sans & Mono)

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
3. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

Make sure to set up the following environment variables:

- `NEXT_PUBLIC_RPC_URL`: Your Solana RPC URL
- `NEXT_PUBLIC_PROGRAM_AUTHORITY`: Your program authority address

## Project Structure

```
app/
├── page.tsx          # Main application page
├── layout.tsx        # Root layout component
├── globals.css       # Global styles
└── fonts/           # Custom fonts
    ├── QuantaGroteskProBold.otf
    ├── TelegrafBold.otf
    ├── Telegrafglight.otf
    └── TelegrafReguler.otf
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Powered by

- [Verxio Protocol](https://verxio.com)
