import React, { createContext, useContext, useState, ReactNode, useRef } from 'react';
import { createPublicClient, http, PublicClient, WalletClient } from 'viem';
import { holesky } from 'viem/chains';

/*
* Stores the public and the wallet clients
*/
interface EtherClientsContextType {
  publicClient: PublicClient | null
  walletClient: WalletClient | null
  setPublicClient: (client: PublicClient) => void
  setWalletClient: (client: WalletClient) => void
  flushWClient: () => void
  addressRef : React.RefObject<`0x${string}` | null>
}

export const EtherClientsContext = createContext<EtherClientsContextType | undefined>(undefined)

export const EtherClientsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [publicClient, setPublicClient] = useState<PublicClient | null>(getPublicClient ?? null)
    const [walletClient, setWalletClient] = useState<WalletClient | null>(null)
    const addressRef = useRef<`0x${string}` | null>(walletClient?.account?.address ?? null)
    

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
        <EtherClientsContext.Provider value={{ publicClient, walletClient, setPublicClient, setWalletClient, flushWClient, addressRef }}>
        {children}
        </EtherClientsContext.Provider>
    )
}