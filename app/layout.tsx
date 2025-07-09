import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ContextProvider from '@/context'
import WalletProvide from '@/context'
import localFont from 'next/font/local'
import Footer from "@/components/footer";
import Header from "@/components/header";


const telegraf = localFont({
  src: [
    {
      path: './fonts/TelegrafBold.otf',
      weight: '700',
      style: 'bold',
    },
    {
      path: './fonts/Telegrafglight.otf',
      weight: '300',
      style: 'thin',
    },
    {
      path: './fonts/TelegrafReguler.otf',
      weight: '400',
      style: 'normal',
    }
  ],
})

// export const quanta = localFont({
//   src: './fonts/QuantaGroteskProBold.otf',
// })




export const metadata: Metadata = {
  title: "useSupercharge",
  description: "Loyalty based checkout  ",
  icons: {
    icon: "/favicon.ico", // or "/favicon.png", etc.
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
          className={`${telegraf.className} tracking-[0.01em]`}
      >
        <Header/>
         <ContextProvider> 
          <WalletProvide>
            {children}
            </WalletProvide>
            </ContextProvider>
            <Footer/>
      </body>
    </html>
  );
}
