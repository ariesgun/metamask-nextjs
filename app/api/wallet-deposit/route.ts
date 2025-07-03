import { CHAIN_IDS_TO_USDC_ADDRESSES } from '@/lib/constants';
import { supabase } from '@/lib/supabaseClient';
import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, erc20Abi, formatUnits, Hex, http } from 'viem'
import { baseSepolia } from 'viem/chains'

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN // Add this to your .env.local
const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`

export async function POST(req: NextRequest) {

  const payload = await req.json();
  console.log("payload", payload)

  // Check EOA wallet balances.
  const { data } = await supabase.from('user_wallets')
    .select('*')
    .eq('circle_wallet_address', payload.address)

  console.log("Data", data);
  if (!data || data?.length == 0) {
    return NextResponse.json(
      JSON.stringify({ error: "No wallet can be found" }),
      { status: 500 }
    )
  }

  try {
    const publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http(),
    })

    const balance = await publicClient.readContract({
      address: CHAIN_IDS_TO_USDC_ADDRESSES[publicClient.chain.id] as `0x${string}`,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [payload.address as Hex]
    })

    const usdcBalance = formatUnits(balance, 6)
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: data[0].chat_id,
        text: `You have succesfully deposited USDC to your saving account.\nYour saving address: ${data[0].circle_wallet_address}.\nYour balance: ${usdcBalance} USDC`,
      }),
    })

    const respnse = await response.json();
    if (!respnse.ok) {
      console.error("Failed to notify Telegram user", response)
      return NextResponse.json(
        JSON.stringify({ message: respnse }),
        { status: 500 }
      )
    }

    return NextResponse.json(
      JSON.stringify({ message: 'OK' }),
      { status: 200 }
    )

  } catch (error) {
    return NextResponse.json(
      JSON.stringify({ error: 'Failed to trigger wallet-deposit', details: (error as Error).message }),
      { status: 500 }
    )
  }
}