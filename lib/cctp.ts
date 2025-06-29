import { Address, encodeFunctionData, erc20Abi, Hex } from "viem";
import { waitForTransactionReceipt } from "viem/actions";
import { CHAIN_IDS_TO_MESSAGE_TRANSMITTER, DESTINATION_DOMAINS } from "./constants";

export const encodeCCTPDepositForBurn = (destinationAddress: Address, assetAddress: Address, destinationChainId: number, amount: bigint) => {
  let supplyHookData: Hex = "0x0000000000000000000000000000000000000000000000000000000000000000";

  try {
    const finalityThreshold = 1000;
    const maxFee = BigInt(30);
    //destinationAddress
    const mintRecipient: Hex = `0x${destinationAddress
      .replace(/^0x/, "")
      .padStart(64, "0")}`;

    const encodedData = encodeFunctionData({
      abi: [
        {
          type: "function",
          name: "depositForBurn",
          stateMutability: "nonpayable",
          inputs: [
            { name: "amount", type: "uint256" },
            { name: "destinationDomain", type: "uint32" },
            { name: "mintRecipient", type: "bytes32" },
            { name: "burnToken", type: "address" },
            { name: "destinationCaller", type: "bytes32" },
            { name: "maxFee", type: "uint256" },
            { name: "finalityThreshold", type: "uint32" }
          ],
          outputs: [],
        },
      ],
      functionName: "depositForBurn",
      args: [
        amount,
        DESTINATION_DOMAINS[destinationChainId],
        mintRecipient,
        assetAddress,
        "0x0000000000000000000000000000000000000000000000000000000000000000",
        maxFee,
        finalityThreshold,
      ],
    });

    console.log(`Burn Tx: ${encodedData}`);
    return encodedData;
  } catch (err) {
    console.error("Burn failed");
    throw err;
  }
}

export const retrieveAttestation = async (sourceChainId: number, transactionHash: string) => {
  console.log("Retrieving attestation...", transactionHash);

  const url = `https://iris-api-sandbox.circle.com/v2/messages/${DESTINATION_DOMAINS[sourceChainId]}?transactionHash=${transactionHash}`;

  while (true) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data?.messages?.[0]?.status === "complete") {
        console.log("Attestation retrieved!");
        return data.messages[0];
      }
      console.log("Waiting for attestation...");
      await new Promise((resolve) => setTimeout(resolve, 3000));
    } catch (error: any) {
      console.error("Error retrieving attestation:", error?.message || error);
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }
};

export const encodeCCTPMint = (destinationChainId: number, attestation: any) => {
  const MAX_RETRIES = 3;
  let retries = 0;
  console.log("Minting USDC...");

  try {
    const contractConfig = {
      address: CHAIN_IDS_TO_MESSAGE_TRANSMITTER[
        destinationChainId
      ],
      abi: [
        {
          type: "function",
          name: "receiveMessage",
          stateMutability: "nonpayable",
          inputs: [
            { name: "message", type: "bytes" },
            { name: "attestation", type: "bytes" },
          ],
          outputs: [],
        },
      ],
    };

    const encodedData = encodeFunctionData({
      ...contractConfig,
      functionName: "receiveMessage",
      args: [attestation.message, attestation.attestation],
    });

    console.log(`Mint Tx: ${encodedData}`);
    return encodedData;

  } catch (err) {
    console.log("Error building mint call data:", err);
  }
}

export const encodeApproveERC20 = (spender: Address, token: Address, amount: bigint) => {
  // Approve USDC on Linea
  const approveUSDCCallData = encodeFunctionData({
    abi: erc20Abi,
    functionName: 'approve',
    args: [spender, amount],
  });
  
  return approveUSDCCallData;
}