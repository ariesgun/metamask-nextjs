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

export const ConnectWalletButton = () => {
  // const { sdk, connected, connecting, account } = useSDK();
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
        connectors.map((connector) => (
          <Button disabled={isConnecting} key={connector.uid} onClick={() => connect({ connector })}>
            <WalletIcon className="mr-2 h-4 w-4" /> Connect Wallet
          </Button>
        ))
      )}
    </div>
  );
};

export const NavBar = () => {
  const host =
    typeof window !== "undefined" ? window.location.host : "defaultHost";

  const sdkOptions = {
    logging: { developerMode: false },
    checkInstallationImmediately: false,
    dappMetadata: {
      name: "Next-Metamask-Boilerplate",
      url: host, // using the host constant defined above
    },
  };

  return (
    <nav className="flex items-center justify-between max-w-screen-xl px-6 mx-auto py-7 rounded-xl w-full">
      <Link href="/" className="flex gap-1 px-6">
        <span className="hidden text-2xl font-bold sm:block">
          <span className="text-gray-900">Template</span>
        </span>
      </Link>
      <div className="flex gap-4 px-6">
        <ConnectWalletButton />
      </div>
    </nav>
  );
};

export default NavBar;
