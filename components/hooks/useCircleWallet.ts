import { useEffect, useState } from "react";
import { useChainId } from "wagmi";
import { WalletsDataWalletsInner } from '@circle-fin/developer-controlled-wallets'

export function useCircleWallet() {
  const [circleWallet, setCircleWallet] = useState<WalletsDataWalletsInner>();
  const chainId = useChainId();

  const createWallet = async () => {
    const res = await fetch('/api/createCircleWallet', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await res.json();

    console.log("Data", data)
    setCircleWallet(data.wallet);

    return data.wallet;
  }

  const performTransaction = async (callData: any, contractAddress: any) => {
    const res = await fetch('/api/performCircleTransaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        callData,
        contractAddress
      })
    });
    const data = await res.json();

    console.log("Data", data)

    return data;
  }

  return { circleWallet, createWallet, performTransaction };
}
