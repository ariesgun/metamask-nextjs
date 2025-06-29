'use client'

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Address, createWalletClient, encodeFunctionData, erc20Abi, Hex, http, parseEther, zeroAddress } from "viem";
import { lineaSepolia, mainnet, sepolia } from "viem/chains";
import { useCapabilities, usePublicClient, useSendCalls, useWalletClient, useSendTransaction } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { useCircleWallet } from "./hooks/useCircleWallet";
import useMetamaskSmartAccount from "./hooks/useMetamaskSmartAccount";
import { useState } from "react";
import { BATCH_DEFAULT_MODE, DelegationFramework, ExecutionStruct, getDeleGatorEnvironment, signDelegation } from "@metamask/delegation-toolkit";
import { erc7715ProviderActions } from "@metamask/delegation-toolkit/experimental";
import AccountAbi from "@/components/abi/accountAbi"
import { createBundlerClient } from "viem/account-abstraction";
import { sendCalls, sendTransaction, waitForTransactionReceipt, switchChain } from "@wagmi/core"
import { config } from "./providers/app-provider";
import { Input } from "./ui/input";
import ConnectWalletStep from "./ConnectWalletStep";
import SignMessageStep from "./SignMessageStep";
import FinalStep from "./FinalStep";
import BridgeTokenStep from "./BridgeTokenStep";

export default function MainSection() {

  const { data: walletClient } = useWalletClient();
  const { createWallet, performTransaction } = useCircleWallet();
  const [telegramUserId, setTelegramUserId] = useState<string>("");
  const [isSigned, setIsSigned] = useState<boolean>(false);

  const onTelegramUserIdChanged = (value: string) => {
    setTelegramUserId(value);
    console.log("Updating ", telegramUserId)
  }

  const onSigned = (val: boolean) => {
    setIsSigned(val)
  }

  const { smartAccount, delegateTo } = useMetamaskSmartAccount();
  const publicClient = usePublicClient({
    chainId: baseSepolia.id
  });

  const result = useCapabilities()

  const [circleWallet, setCircleWallet,] = useState<Address>();

  const upgradeEIP7702 = async () => {
    // Call this to trigger EIP-7702 smart account upgrade.
    await sendCalls(config, {
      calls: [
        {
          to: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
          data: '0x095ea7b30000000000000000000000003d3d74ca043372101ff75ce41fb5c80862a7b9a7ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
        },
        {
          data: '0xdeadbeef',
          to: zeroAddress,
          value: BigInt(1),
        },
      ]
    })
  }

  const deployCircleWallet = async () => {
    const walletAddress = await createWallet();
    setCircleWallet(walletAddress)
  }

  const delegateToAIWallet = async () => {
    if (!smartAccount || !walletClient) {
      console.error("Smart Account error")
      return;
    }
    console.log("Smart account", smartAccount);

    const bundlerClient = createBundlerClient({
      client: publicClient,
      transport: http(`https://public.pimlico.io/v2/${baseSepolia.id}/rpc`),
    });

    const userOpHash = await bundlerClient.sendUserOperation({
      account: smartAccount,
      calls: [
        {
          to: zeroAddress,
          value: BigInt(4),
        },
        {
          to: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
          data: "0xdeadbeef",
        },
      ],
    });
    console.log(`User operation sent ${userOpHash}`);

    return

    const delegation = await delegateTo("0x48b585b77b7e5b9e62c7bd24ffc27d43b199e7bb");

    console.log("Delegation", delegation);
    console.log("Capabilities", result)

    const delegationManager = getDeleGatorEnvironment(
      baseSepolia.id
    ).DelegationManager;

    const extendedWalletClient = walletClient?.extend(erc7715ProviderActions());

    // const expiry = Math.floor(Date.now() / 1000 + 604_800); // 1 week from now.
    // const currentTime = Math.floor(Date.now() / 1000); // now
    // const grantedPermissions = await extendedWalletClient.grantPermissions([{
    //   chainId: baseSepolia.id,
    //   expiry,
    //   signer: {
    //     type: "account",
    //     data: {
    //       address: "0x48b585b77b7e5b9e62c7bd24ffc27d43b199e7bb",
    //     },
    //   },
    //   permission: {
    //     type: "native-token-stream",
    //     data: {
    //       initialAmount: BigInt(1), // 1 wei
    //       amountPerSecond: BigInt(1), // 1 wei per second
    //       maxAmount: BigInt(10), // 10 wei
    //       startTime: currentTime,
    //       justification: "Payment for a week long subscription",
    //     },
    //   },
    // }]);


    const signature = await smartAccount.signDelegation({ delegation, chainId: 0x0 });

    const signedDelegation = {
      ...delegation,
      signature,
    }
    // const transferCallData = encodeTransferERC20("0x036CbD53842c5426634e7929541eC2318f3dCF7e", "0xa6525f92d9be3f4067bea30d47d1137194d3aa90", 11000);
    // const transferCallData2 = encodeTransferERC20("0x036CbD53842c5426634e7929541eC2318f3dCF7e", "0xa6525f92d9be3f4067bea30d47d1137194d3aa90", 22000);

    const executions: ExecutionStruct[] = [{
      target: "0xa6525f92d9be3f4067bea30d47d1137194d3aa90",
      value: BigInt(Number('0.0003') * 10 ** 18),
      callData: "0xbeef" as Hex
    }, {
      target: "0xa6525f92d9be3f4067bea30d47d1137194d3aa90",
      value: BigInt(Number('0.0002') * 10 ** 18),
      callData: "0xdead" as Hex
    }];

    const delegations = [signedDelegation];
    const mode = BATCH_DEFAULT_MODE;

    const redeemDelegationCalldata = DelegationFramework.encode.redeemDelegations({
      delegations: [delegations],
      modes: [mode],
      executions: [executions]
    });

    const contractAddress = getDeleGatorEnvironment(baseSepolia.id).DelegationManager;

    const tx = await performTransaction(redeemDelegationCalldata, contractAddress)
    console.log("Tx: ", tx);

    console.log("Signed ", signedDelegation)
  }

  return (
    <div className="w-full py-4 text-sm items-center text-muted-foreground">

      <Label className="block mb-6 text-lg">
        Follow these steps to set up your Circle-powered AI Agent Wallet using your Metamask account.
      </Label>

      <div className="flex flex-col gap-6">
        <ConnectWalletStep />
        <SignMessageStep onTelegramChanged={onTelegramUserIdChanged} onSigned={onSigned}/>
        <BridgeTokenStep telegramUserId={telegramUserId} signed={isSigned}/>
        <FinalStep />
      </div>
    </div>
  );
}
