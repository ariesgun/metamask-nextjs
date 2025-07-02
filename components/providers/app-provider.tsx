'use client';

import type { ReactNode } from 'react';
import { createConfig, http, WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { baseSepolia, lineaSepolia } from "wagmi/chains";
import { metaMask } from "wagmi/connectors";

const client = new QueryClient();

export const config = createConfig({
  ssr: true, // Make sure to enable this for server-side rendering (SSR) applications.
  chains: [baseSepolia, lineaSepolia],
  connectors: [metaMask()],
  transports: {
    [baseSepolia.id]: http(),
    [lineaSepolia.id]: http(),
  },
});

export const AppProviders = ({ children }: { children: ReactNode }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={client}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
};