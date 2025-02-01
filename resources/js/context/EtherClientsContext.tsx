import React, { createContext, useContext, useState, ReactNode } from 'react';
import { createPublicClient, http, PublicClient, WalletClient } from 'viem';
import { holesky } from 'viem/chains';

interface EtherClientsContextType {
  publicClient: PublicClient | null
  walletClient: WalletClient | null
  setPublicClient: (client: PublicClient) => void
  setWalletClient: (client: WalletClient) => void
  flushWClient: () => void
}

export const EtherClientsContext = createContext<EtherClientsContextType | undefined>(undefined)

export const EtherClientsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [publicClient, setPublicClient] = useState<PublicClient | null>(getPublicClient ?? null)
    const [walletClient, setWalletClient] = useState<WalletClient | null>(null)

    function flushWClient(){
        setWalletClient(null)
    }

    function getPublicClient(){
        return createPublicClient({
            chain: holesky,
            transport: http('https://ethereum-holesky.publicnode.com')
        })
    }

    return (
        <EtherClientsContext.Provider value={{ publicClient, walletClient, setPublicClient, setWalletClient, flushWClient }}>
        {children}
        </EtherClientsContext.Provider>
    )
}