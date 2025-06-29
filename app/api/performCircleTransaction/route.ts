import type { NextApiRequest, NextApiResponse } from 'next';
import { initiateDeveloperControlledWalletsClient } from '@circle-fin/developer-controlled-wallets';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest, res: NextApiResponse) {
  try {

    console.log("Helo")
    const circleApiKey = process.env.CIRCLE_API_KEY!;
    const circleEntitySecret = process.env.CIRCLE_ENTITY_SECRET!;

    const circleClient = initiateDeveloperControlledWalletsClient({
      apiKey: circleApiKey,
      entitySecret: circleEntitySecret,
    });

    const { callData, contractAddress } = await req.json();

    const txRes = await circleClient.createContractExecutionTransaction({
      walletId: "b318eed1-43f7-597c-95e0-293d28628cd1",
      fee: { type: 'level', config: { feeLevel: 'HIGH' } },
      callData: callData,
      contractAddress: contractAddress,
      amount: "0",
    })

    const txId = txRes.data?.id;
    if (!txId) {
      throw new Error("Transaction ID not found in response");
    }

    let txStatus = txRes.data?.state;
    let tx;
    do {
      const statusResponse = await circleClient.getTransaction({ id: txId });
      tx = statusResponse.data?.transaction;
      txStatus = statusResponse.data?.transaction?.state;
      if (txStatus === "FAILED") {
        throw new Error(`Transaction failed with state: ${txStatus}`);
      }
      if (txStatus !== "CONFIRMED") {
        console.log(`Transaction status: ${txStatus}. Waiting for confirmation...`);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 5 seconds before checking again
      }
    } while (txStatus !== "CONFIRMED");

    const txResult = {
      txId: txId,
      txHash: tx?.txHash || null,
      txStatus,
    }

    res.status(200).json({ wallet: txResult });
  } catch (error) {
    console.error(error.response)

    res.status(500).json({ error: 'Failed to create wallet', details: (error as Error).response });
  }

}