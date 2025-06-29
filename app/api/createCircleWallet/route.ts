import type { NextApiRequest, NextApiResponse } from 'next';
import { initiateDeveloperControlledWalletsClient } from '@circle-fin/developer-controlled-wallets';

export async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {

    console.log("Helo")
    const circleApiKey = process.env.CIRCLE_API_KEY!;
    const circleEntitySecret = process.env.CIRCLE_ENTITY_SECRET!;

    const client = initiateDeveloperControlledWalletsClient({
      apiKey: circleApiKey,
      entitySecret: circleEntitySecret,
    });

    console.log("Helo there")

    const walletSetResponse = await client.createWalletSet({ name: 'Telegram User 1' });
    const walletsResponse = await client.createWallets({
      blockchains: ['EVM-TESTNET'],
      count: 1,
      walletSetId: walletSetResponse?.data?.walletSet.id!,
      accountType: 'EOA',
    });
    console.log(walletsResponse);

    res.status(200).json({ wallet: walletsResponse?.data?.wallets[0] });
  } catch (error) {
    console.error(error)

    res.status(500).json({ error: 'Failed to create wallet', details: (error as Error).message });
  }

}