import { useAccount, useSignMessage } from "wagmi";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import React, { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { verifyMessage } from "viem";
import { supabase } from "@/lib/supabaseClient";

interface SignMessageStepProps {
  onTelegramChanged: (e: string) => void;
  onSigned: (val: boolean) => void;
}

export default function SignMessageStep({ onTelegramChanged, onSigned }: SignMessageStepProps) {

  const [signed, setSigned] = useState<boolean>(false);
  const { signMessageAsync } = useSignMessage()
  const [username, setUsername] = useState<string | null>(null);
  const { address } = useAccount();

  const retrieveEOA = async () => {
    console.log("Telegram user Id", username)
    const { data } = await supabase.from('user_wallets')
      .select('*')
      .eq('eoa_wallet_address', address)
      .eq('status', "SIGNED")

    console.log("Data", data);
    if (data && data?.length > 0) {
      setSigned(data[0].status === "SIGNED")
      setUsername(data[0].telegram_user_name)
      onTelegramChanged(data[0].telegram_user_name)
    }
  }

  const retrieveStatus = async () => {
    console.log("Telegram user Id", username)
    const { data } = await supabase.from('user_wallets')
      .select('*')
      .eq('telegram_user_name', username)

    console.log("Data", data);
    if (data && data?.length > 0) {
      setSigned(data[0].status === "SIGNED")
    }
  }

  useEffect(() => {
    retrieveEOA();
    retrieveStatus();
  });

  const updateEOA = async () => {
    // Update EOA status has been signed
    await supabase
      .from('user_wallets')
      .update({ eoa_wallet_address: address, status: 'SIGNED' })
      .eq('telegram_user_name', username)
  }

  const handleSignAgreement = async () => {
    try {
      const message = `
  By signing this message, I confirm that my Telegram username is ${username}. 

  I acknowledge and agree to the risks and the terms and conditions of using this application.
  I understand that blockchain transactions are irreversible and I am responsible for my actions.
      `.trim()

      const sig = await signMessageAsync({ message })

      if (!address) {
        console.error("Wallet address is not available.");
        return;
      }
      const isValid = await verifyMessage({
        address,
        message,
        signature: sig,
      })

      console.log('Signature valid?', isValid)
      if (isValid) {
        await updateEOA();
        onSigned(true);
        setSigned(true);
      }

    } catch (err: any) {
      console.error("Signing failed", err)
    }
  }

  return (
    <>
      <div className="flex gap-x-6">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-bold mt-2 ${signed ? "bg-green-500" : "bg-gray-400"
            }`}
        >2</div>
        <div className="flex flex-col gap-2">
          <Label className="text-lg">Please sign to prove ownership.</Label>
          <div className="flex flex-row gap-2 items-center ">
            <Label className="text-base">Telegram username:  </Label>
            <Input type="text" value={username ?? ""} placeholder="" onChange={(e: any) => { setUsername(e.target.value); onTelegramChanged(e.target.value); }} />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-base">By signing this message, I confirm my telegram username and acknowledge and agree to <br />the risks and the terms and conditions of using this application.<br />
              I understand that blockchain transactions are irreversible and I am responsible for my actions.</Label>
            <Button className={`text-sm max-w-32 ${signed ? "bg-gray-500" : "bg-primary"}`} disabled={signed} onClick={handleSignAgreement}>Sign</Button>
          </div>
        </div>
      </div>
    </>
  );
}