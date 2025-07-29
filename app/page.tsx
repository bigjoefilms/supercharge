// Updated Page component using the utilities
"use client";
import { quanta } from "@/app/fonts";
import Logo from "@/public/usdc.png";

import Image from "next/image";
import { cn } from "@/lib/utilis";
import React from "react";
import Link from "next/link";


const Page = () => {
 
  return (
    <main className="flex items-center  flex-col relative">
      <section className="flex items-center justify-center h-[70vh] flex-col">
     
        <div
          className={cn(
            "absolute inset-0 -z-50 opacity-5",
            "[background-size:400px_400px]",
            "[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]",
            "dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]"
          )}
          style={{
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0%, black 60%, black 50%, transparent 100%)",
            maskImage:
              "linear-gradient(to right, transparent 0%, black 60%, black 90%, transparent 100%)",
          }}
        />

        <section className=" max-w-[600px] w-full items-start flex flex-col px-[20px] ">
          <h1
            className={`text-[40px] md:text-[54px]   font-medium ${quanta.className} leading-tight z-50`}
          >
            Simple Checkout & loyalty for everyone
          </h1>
          <Image
            src={Logo}
            alt="logo"
            width={50}
            height={50}
            className="rounded-[8px] absolute right-[130] bottom-[-200] rotate-45 opacity-30 -z-10"
          />

          <div className="max-w-[500px] text-center mt-[20px]">
            <p className="text-[#7c0b0b] text-[12px] md:text-[14px] font-light text-start">
              Accept payments anywhere, reward your customers, and grow without
              the complexity.
            </p>
          </div>
{/* 
          // <Link href="/pos" className="w-full -z-40 ">
          //   <button className="w-full bg-[#7c0b0b] mt-[10px] text-white px-5 py-3 text-[14px] rounded-[12px] cursor-pointer hover:opacity-80 transition flex items-center justify-center">
          //     Test Demo
          //   </button>
          // </Link> */}
          <Link href="/pos" className="w-full">
  
  <button  className=" bg-[#7c0b0b] text-white px-5 py-3 text-[14px] rounded-[12px] cursor-pointer hover:opacity-80 transition flex items-center justify-center mr-[10px] mt-[10px] w-full">
                Generate Payment 
              </button>
              </Link>
           
          
         
        </section>
        
        

        <div
          className="bg-gradient-to-r from-[#7c0b0b] to-pink-500 w-full max-w-[1000px] h-full max-h-[1000px] absolute opacity-10 -z-50"
          style={{
            WebkitMaskImage:
              "radial-gradient(circle at center, black 10%, transparent 40%)",
            maskImage:
              "radial-gradient(circle at center, black 10%, transparent 70%)",
          }}
        ></div>
       
      </section>
      
    </main>
  );
};

export default Page;