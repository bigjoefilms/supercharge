// Updated Page component using the utilities
"use client";
import { quanta } from "@/app/fonts";
import Logo from "@/public/usdc.png";

import Image from "next/image";
import { cn } from "@/lib/utilis";
import React, { useState } from "react";

const Page = () => {
  const [email, setEmail] = useState("");

  return (
    <main className="flex items-center  flex-col h-screen">
     

      <div className="flex items-center justify-center h-[70vh]">
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

        <section className=" max-w-[600px]  items-start flex flex-col px-[20px] relative ">
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
          <form className="w-full  md:px-[0] py-[20px] px-[20px] z-40">
            <div className="relative w-full">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full pr-20 pl-4 py-3 border-2 border-gray-200 rounded-[12px] focus:outline-none focus:ring-2 text-[14px]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                // type="submit"
                className="absolute right-1 top-1 bottom-1 bg-[#7c0b0b] text-white px-5 py-3 text-[14px] rounded-[12px] cursor-pointer hover:opacity-80 transition"
              >
                Join Waitlist
              </button>
            </div>
          </form>
        </section>

        <div
          className="bg-gradient-to-r from-[#7c0b0b] to-pink-500 w-[1000px] h-[1000px] absolute opacity-5"
          style={{
            WebkitMaskImage:
              "radial-gradient(circle at center, black 10%, transparent 50%)",
            maskImage:
              "radial-gradient(circle at center, black 10%, transparent 70%)",
          }}
        ></div>
      </div>
    </main>
  );
};

export default Page;
