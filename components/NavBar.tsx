"use client";

import Link from "next/link";
import WalletIcon from "../public/icons/WalletIcon";
import { Button } from "@/components/ui/button";
import { formatAddress } from "../lib/utils";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Separator } from "@/components/ui/separator";

export const ConnectWalletButton = () => {
  const { isConnected, address, isConnecting } = useAccount();
  const { connectors, connect } = useConnect()
  const { disconnect } = useDisconnect();

  return (
    <div className="relative">
      {isConnected ? (
      <Popover>
        <PopoverTrigger asChild>
        <Button>{formatAddress(address)}</Button>
        </PopoverTrigger>
        <PopoverContent className="mt-2 w-44 bg-gray-100 border rounded-md shadow-lg right-0 z-10 top-10">
        <button
          onClick={() => disconnect()}
          className="block w-full pl-2 pr-4 py-2 text-left text-[#F05252] hover:bg-gray-200"
        >
          Disconnect
        </button>
        </PopoverContent>
      </Popover>
      ) : (
      connectors.map((connector) => {
        // Check if this is the MetaMask connector
        const isMetaMask =
        connector.id === "metaMask" ||
        connector.name.toLowerCase().includes("metamask");
        return (
        <Button
          disabled={isConnecting}
          key={connector.uid}
          onClick={() => connect({ connector })}
        >
          <WalletIcon className="mr-2 h-4 w-4" />
          {isMetaMask ? "Connect MetaMask" : "Connect Wallet"}
        </Button>
        );
      })
      )}
    </div>
  );
};

export const NavBar = () => {
  return (
    <nav className="flex flex-col items-center justify-between max-w-screen-xl px-6 mx-auto py-3 rounded-xl w-full">
      <div className="flex items-center justify-between max-w-screen-xl mx-auto px-6 py-7 rounded-xl w-full">
        <Link href="/" className="flex gap-1 px-6">
          <span className="hidden text-2xl font-bold sm:block">
            <span className="text-gray-900">YieldFi</span>
          </span>
        </Link>
        <div className="flex gap-4 px-6">
          <ConnectWalletButton />
        </div>
      </div>
      <Separator className="bg-gray-400" />
    </nav>
  );
};

export default NavBar;
