import { useConfig, useWalletClient } from "wagmi";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Input } from "./ui/input";
import { CHAIN_IDS_TO_MESSAGE_TRANSMITTER, CHAIN_IDS_TO_TOKEN_MESSENGER, CHAIN_IDS_TO_USDC_ADDRESSES } from "@/lib/constants";
import { encodeApproveERC20, encodeCCTPDepositForBurn, encodeCCTPMint, retrieveAttestation } from "@/lib/cctp";
import { sendTransaction, waitForTransactionReceipt } from "@wagmi/core"
import { lineaSepolia, baseSepolia } from "viem/chains";
import { Hex } from "viem";
import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

interface BridgeTokenStepProps {
  telegramUserName: string;
  signed: boolean;
  onDeposit: (val: boolean) => void;
}

export default function BridgeTokenStep({ telegramUserName, signed, onDeposit }: BridgeTokenStepProps) {

  const { data: walletClient } = useWalletClient();
  const [address, setAddress] = useState<string>("");
  const [amount, setAmount] = useState<string | null>("0.1");
  const [successful, setSuccessful] = useState<boolean>(false);
  const config = useConfig()

  useEffect(() => {
    const retrieveWalletAddress = async () => {
      const { data } = await supabase.from('user_wallets')
        .select('*')
        .eq('telegram_user_name', telegramUserName)
        .eq('status', "SIGNED")

      console.log("Data", data);
      if (data && data?.length > 0) {
        setAddress(data[0].circle_wallet_address)
      }
    }

    if (telegramUserName === "") return

    retrieveWalletAddress();
  }, [telegramUserName, signed]);

  const checkTxCompleted = async (txHash: `0x${string}`) => {
    try {
      // This will resolve when the transaction is mined or throw on timeout/failure
      const receipt = await waitForTransactionReceipt(config, { hash: txHash })
      if (receipt.status === 'success') {
        console.log('Transaction confirmed!', receipt)
        return true
      } else {
        console.log('Transaction failed or reverted', receipt)
        return false
      }
    } catch (error) {
      console.error('Error waiting for transaction:', error)
      return false
    }
  }

  // Deposit using CCTPv2
  const depositUSDC = async () => {

    if (!walletClient) {
      throw new Error("Wallet client is not available");
    }

    try {
      await walletClient?.switchChain({ id: lineaSepolia.id }); // Linea sepolia
    } catch (error) {
      console.error(error);
    }

    const spender: Hex = CHAIN_IDS_TO_TOKEN_MESSENGER[lineaSepolia.id] as Hex
    const usdc: Hex = CHAIN_IDS_TO_USDC_ADDRESSES[lineaSepolia.id] as Hex
    const tokenAmount = BigInt(Number(amount) * 10 ** 6)
    const approveUSDCCallData = encodeApproveERC20(spender, usdc, tokenAmount)

    const approveTx = await sendTransaction(config, {
      to: usdc,
      data: approveUSDCCallData
    });
    console.log("approveTx:", approveTx);

    await checkTxCompleted(approveTx)

    // DepositForBurn on Linea
    const depositForBurnCallData = encodeCCTPDepositForBurn(walletClient?.account.address as Hex, usdc, baseSepolia.id, tokenAmount)
    const depositTx = await sendTransaction(config, {
      to: spender,
      data: depositForBurnCallData,
    });
    console.log("Response:", depositTx);
    await checkTxCompleted(depositTx)

    // Wait for attestation
    const attestation = await retrieveAttestation(lineaSepolia.id, depositTx);

    // Redeem USDC on Base
    try {
      await walletClient?.switchChain({ id: baseSepolia.id }); // Linea sepolia
    } catch (error) {
      console.error("...", error);
    }

    const trasmitterAddr = CHAIN_IDS_TO_MESSAGE_TRANSMITTER[baseSepolia.id] as Hex
    const redeemCallData = encodeCCTPMint(baseSepolia.id, attestation)

    const mintTx = await sendTransaction(config, {
      to: trasmitterAddr,
      data: redeemCallData,
    })

    await checkTxCompleted(mintTx)
    setSuccessful(true);
    onDeposit(true);
  }

  return (
    <>
      <div className="flex gap-x-6">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-bold mt-2 ${successful ? "bg-green-500" : "bg-gray-400"
            }`}
        >3</div>
        <div className="flex flex-col gap-2">
          <Label className="text-lg">Please transfer USDC to your saving accounts.</Label>
          <div className="flex flex-col md:flex-col gap-3">
            <Label className="text-base">Saving wallets are currently unavailable on the Linea chain.<br />To proceed, your funds will be bridged to the Base chain using CCTPv2.</Label>
            <div className="flex flex-row gap-4 items-center justify-between">
              <Label className="text-base">Amount</Label>
              <Input type="text" value={amount ?? ""} placeholder="USDC Amount" onChange={(e: any) => setAmount(e.target.value)} />
            </div>
            <div className="flex flex-row gap-4 items-center">
              <Label className="text-base">Address</Label>
              <Input type="text" readOnly className="font-bold" value={address} />
            </div>
            <div className="flex flex-row gap-4 items-center justify-between">
              <Label className="text-base">Network</Label>
              <Input type="text" className="font-bold" value="Linea Sepolia" readOnly />
            </div>
            <Button className="text-sm max-w-32" onClick={depositUSDC} disabled={address === ""}>Deposit</Button>
          </div>
        </div>
      </div>
    </>
  );
}