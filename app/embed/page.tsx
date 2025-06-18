"use client";
import React, { useState } from "react";
import padlockIcon from "@/public/padlock.png";
import Image from "next/image";
import solanapayIcon from "@/public/gradient.svg";
import checkIcon from "@/public/check.png";
import warningIcon from "@/public/warning.png";
import closeIcon from "@/public/close.png";
import usdcIcon from "@/public/usdc.png";

const Page = () => {
  const [price, setPrice] = useState<number | null>(null);
  const [organisation, setOrganisation] = useState<string | null>(null);
  const urlParams = new URLSearchParams(window.location.search);
  const transactionUuid = urlParams.get('transaction_uuid');

  console.log(urlParams)
  console.log(transactionUuid)

  return (
    <main className="flex items-center justify-center md:h-screen pt-[50px] md:pt-[0px]">
      <div className="flex-col">
        <h1 className="font-bold text-[14px]  to-blue-600 ">
          SUPERCHARGE CHECKOUT 
        </h1>
        <p className="font-light text-[14px] opacity-80 flex items-center gap-1">
          Use one of the payment methods below to pay
          <Image src={usdcIcon} width={15} height={15} alt="padlockicon" />
          {price ? `$${price}` : "$10"} to {organisation || "Merchant"}
        </p>
        <div>
          <section className="bg-[#cacaca33] px-[10px] py-[12px] cursor-pointer my-2 flex items-center gap-2">
            Pay with SolanaPay{" "}
            <Image
              src={solanapayIcon}
              width={40}
              height={40}
              alt="solanapayIcon"
            />{" "}
          </section>
        </div>

        {/* <Success price={price} organisation={organisation}/>
       <Error/> */}

<div className="flex items-center justify-center">
<button className="flex items-center  gap-1 py-[5px] text-[13px] justify-center bg-[#cacaca33]  rounded-[8px]  w-[140px] mt-[100px] font-light cursor-pointer "> <Image src={closeIcon} width={11} height={11} alt="padlockicon" /> Cancel Payment</button>

</div>
        <section className="flex items-center gap-2 font-light justify-center mt-[50px] text-[14px]">
          <Image src={padlockIcon} width={20} height={20} alt="padlockicon" />

          <div>
            secured by <span className="font-bold ">supercharge</span>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Page;

const Success = ({
  price,
  organisation,
}: {
  price: number | null;
  organisation: string | null;
}) => {
  return (
    <main className="flex flex-col items-center justify-center">
      <Image src={checkIcon} width={80} height={80} alt="padlockicon" />
      <h1 className="pt-[15px]  ">Payment Successful</h1>
      <p className="pt-[5px] font-light text-[14px]">
        You paid ${price} to {organisation}
      </p>
    </main>
  );
};

const Error = () => {
  return (
    <main className="flex flex-col items-center justify-center">
      <Image src={warningIcon} width={80} height={80} alt="padlockicon" />
      <h1 className="pt-[15px]  ">Payment failed</h1>
      <p className="py-[30px] font-light text-[14px]">User cancels the order</p>
      <div className="flex flex-col gap-3 w-full">
        <button className="bg-[#0077D4]  py-[6px] text-[#fff] rounded-[8px] cursor-pointer">
          Try Again
        </button>
        <button className="border-[#0077D4] border w-full py-[6px]  rounded-[8px] cursor-pointer">
          Cancel
        </button>
      </div>
    </main>
  );
};
