import { useAccount, useConnect } from "wagmi";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { formatAddress } from "@/lib/utils";

export default function ConnectWalletStep() {

  const { isConnected, address } = useAccount();
  const { connectors, connect } = useConnect()

  const onConnectWallet = async () => {
    connectors.map((connector) => {
      // Check if this is the MetaMask connector
      const isMetaMask =
        connector.id === "metaMask" ||
        connector.name.toLowerCase().includes("metamask");
      if (isMetaMask) {
        connect({ connector })
      }
    })
  }

  return (
    <>
      <div className="flex gap-x-6">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-bold mt-2 ${isConnected ? "bg-green-500" : "bg-gray-400"
            }`}
        >1</div>
        <div className="flex flex-col gap-2">
          <Label className="text-lg">Please connect your wallet.</Label>
          <div className="flex flex-col">
            {isConnected ?
              <Button className="text-sm max-w-32 bg-gray-500" disabled={isConnected}>{formatAddress(address)}</Button>
              :
              <Button className="text-sm max-w-32" onClick={onConnectWallet}>Connect</Button>
            }
          </div>
        </div>
      </div>
    </>
  );
}


