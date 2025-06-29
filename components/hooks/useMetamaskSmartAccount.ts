"use client";

import {
  createDelegation,
  Implementation,
  MetaMaskSmartAccount,
  toMetaMaskSmartAccount,
} from "@metamask/delegation-toolkit";
import { useEffect, useState } from "react";
import { Address, Hex } from "viem";
import { useAccount, usePublicClient, useSignMessage, useSignTypedData, useWalletClient } from "wagmi";
import { baseSepolia } from "viem/chains";

export default function useMetamaskSmartAccount(): {
  smartAccount: MetaMaskSmartAccount | null;
  delegateTo: (delegateAddress: Address) => Promise<ReturnType<typeof createDelegation>>;
} {
  const { address } = useAccount();
  const publicClient = usePublicClient({
    chainId: baseSepolia.id
  });
  const { data: walletClient } = useWalletClient();
  const [smartAccount, setSmartAccount] = useState<MetaMaskSmartAccount | null>(
    null
  );

  
  const { signMessageAsync } = useSignMessage();
  const { signTypedDataAsync } = useSignTypedData();

  useEffect(() => {
    console.log("Metamask... ", walletClient?.chain.id)
    if (!address || !walletClient || !publicClient) return;

    // console.log("Creating smart account", walletClient);
    const connectedAccount = {
      address,
      type: 'json-rpc' as const,
      async signMessage({ message }: { message: any }) {
        return await signMessageAsync({ message });
      },
      async signTypedData(typedData: any) {
        return await signTypedDataAsync(typedData);
      },
    };

    toMetaMaskSmartAccount({
      client: publicClient,
      implementation: Implementation.Hybrid,
      deployParams: [walletClient.account.address, [], [], []],
      deploySalt: "0x",
      signatory: { walletClient },
    }).then((smartAccount) => {
      console.log("Done", smartAccount)
      setSmartAccount(smartAccount);
    });
  }, [address, walletClient, publicClient]);

  const delegateTo = async (delegateAddress: Address) => {
    const delegation = createDelegation({
      to: delegateAddress as Hex,
      from: smartAccount?.address as Hex,
      caveats: []
    })

    return delegation
  }

  return { smartAccount, delegateTo };
}
