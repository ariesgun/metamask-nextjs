import { useAccount, useConnect, useSignMessage } from "wagmi";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { formatAddress } from "@/lib/utils";
import { useState } from "react";
import { Input } from "./ui/input";

export default function FinalStep() {

  const [signature, setSignature] = useState<string | null>(null)

  return (
    <>
      <div className="flex gap-x-6">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-bold mt-2 ${signature ? "bg-green-500" : "bg-gray-400"
            }`}
        >4</div>
        <div className="flex flex-col gap-2">
          <Label className="text-lg">Congratulations! 🎉</Label>
          <div className="md:flex-row">
            <Label className="text-base">You can now interact with your AI-powered financial agent on Telegram.</Label>
          </div>
        </div>
      </div >
    </>
  );
}