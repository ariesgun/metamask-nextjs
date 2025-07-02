import { CHAIN_IDS_TO_USDC_ADDRESSES } from '@/lib/constants';
import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';
import { createPublicClient, erc20Abi, formatUnits, Hex, http } from 'viem'
import { lineaSepolia } from 'viem/chains'

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN // Add this to your .env.local
const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`

export async function POST() {

  // Check EOA wallet balances.
  const { data } = await supabase.from('check_balance')
    .select('*')

  console.log("Data", data);
  if (!data || data?.length == 0) {
    return NextResponse.json(
      JSON.stringify({ error: "No wallet to be checked" }),
      { status: 500 }
    )
  }

  try {
    const publicClient = createPublicClient({
      chain: lineaSepolia,
      transport: http(),
    })

    const usdcContract = {
      address: CHAIN_IDS_TO_USDC_ADDRESSES[lineaSepolia.id] as `0x${string}`,
      abi: erc20Abi
    }

    const payload: {
      address: `0x${string}`;
      abi: typeof erc20Abi;
      functionName: 'balanceOf';
      args: [Hex];
    }[] = [];

    data?.map((row) => {
      payload.push({
        ...usdcContract,
        functionName: 'balanceOf',
        args: [row.wallet_address as Hex]
      })
    })

    const balances = await publicClient.multicall({
      contracts: payload
    })

    const results = await Promise.all(
      balances.map(async (row, index) => {
        console.log(index, row)
        const usdcBalance = formatUnits(row.result!, 6)

        if (usdcBalance < data[index].minimum_balance) {
          const response = await fetch(telegramUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: data[index].telegram_chat_id,
              text: `Your Metamask-card account balance is ${usdcBalance}. It is below the threshold of ${data[index].minimum_balance} USDC`,
            }),
          })

          const respnse = await response.json();
          if (!respnse.ok) {
            console.error("Failed to notify Telegram user", response)
            return false;
          }
        }

        return true
      }
      )
    )

    const allOk = results.every(result => result === true);

    if (allOk) {
      return NextResponse.json(
        JSON.stringify({ message: 'OK' }),
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        JSON.stringify({ message: 'Failed' }),
        { status: 500 }
      )
    }


  } catch (error) {
    return NextResponse.json(
      JSON.stringify({ error: 'Failed to trigger check-balance', details: (error as Error).message }),
      { status: 500 }
    )
  }
}