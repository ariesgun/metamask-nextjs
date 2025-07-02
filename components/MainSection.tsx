'use client'

import { Label } from "@/components/ui/label"
import { useState } from "react";
import ConnectWalletStep from "./ConnectWalletStep";
import SignMessageStep from "./SignMessageStep";
import FinalStep from "./FinalStep";
import BridgeTokenStep from "./BridgeTokenStep";

export default function MainSection() {

  const [telegramUserName, setTelegramUserName] = useState<string>("");
  const [isSigned, setIsSigned] = useState<boolean>(false);
  const [isDeposited, setIsDeposit] = useState<boolean>(false);

  const ontelegramUserNameChanged = (value: string) => {
    setTelegramUserName(value);
    console.log("Updating ", telegramUserName)
  }

  const onSigned = (val: boolean) => {
    setIsSigned(val)
  }

  const onDespoit = (val: boolean) => {
    setIsDeposit(val)
  }

  return (
    <div className="w-full py-4 text-sm items-center text-muted-foreground">

      <Label className="block mb-6 text-lg">
        Follow these steps to set up your Circle-powered AI Agent Wallet using your Metamask account.
      </Label>

      <div className="flex flex-col gap-6">
        <ConnectWalletStep />
        <SignMessageStep onTelegramChanged={ontelegramUserNameChanged} onSigned={onSigned}/>
        <BridgeTokenStep telegramUserName={telegramUserName} signed={isSigned} onDeposit={onDespoit}/>
        <FinalStep done={isSigned && isDeposited}/>
      </div>
    </div>
  );
}
