"use client"
import { useEffect, useState } from "react";
import Image from "next/image";
import { quanta } from "@/app/fonts";
import useLogo from "@/public/usesupercharge.png";
import Link from "next/link";
import { Sun, Moon } from "lucide-react";

export default function Header() {
     const [dark, setDark] = useState(false);

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dark]);
    return (
        <section className="flex items-center justify-center">
        <header className="max-w-[700px] my-[30px] justify-between flex w-full  p-4 rounded-[18px]">
        <div className="flex items-center gap-4">
          {" "}
          <Link href='/' className="flex items-center gap-3">
          <Image
            src={useLogo}
            alt="logo"
            width={40}
            height={40}
            className="rounded-[8px]"
          />
          <h1 className={`${quanta.className} `}>Supercharge</h1></Link>
        </div>
        <button
      onClick={() => setDark((d) => !d)}
      className="p-2 rounded-full  cursor-pointer"
      aria-label="Toggle dark mode"
    >
      {dark ? (
        <Sun className="w-5 h-5 text-yellow-400 cursor-pointer" /> 
      ) : (
           <Moon className="w-5 h-5 text-gray-800 cursor-pointer" />
      )}
    </button>
      </header>
      </section>
    );
  }