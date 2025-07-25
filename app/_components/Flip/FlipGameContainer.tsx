
"use client";

import FlipComponent from "@/app/_components/Flip/FlipComponent";
import FlipConfig from "@/app/_components/Flip/FlipConfig";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Flip a Coin | FakeStake",
  description: "Try your luck flipping a coin!",
};

export default function FlipPage() {
  return (
    <div className="min-h-screen w-full bg-[#0f1c24] text-white px-2">

<div className="flex h-screen gap-4">       
        <div className="w-full max-w-[340px] bg-[#14212e] rounded-xl p-4 shadow-inner flex flex-col gap-4">
          <FlipConfig />
        </div>

        <div className="flex-grow flex items-center justify-center bg-[#0f1c24] rounded-xl p-4">
          <FlipComponent />
        </div>
      </div>
    </div>
  );
}
