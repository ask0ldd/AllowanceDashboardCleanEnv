import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { PublicClient } from 'viem'; // Assuming you're using viem for the public client

interface TransactionContextType {
  publicClient: PublicClient | null
  modal: {
    showTransactionSuccess: (message: string, hash: string) => void
    showTransactionFailure: (message: string, hash: string) => void
    showError: (message: string) => void
  }
  erc20TokenService: {
    getReceipt: (client: PublicClient, hash: string) => Promise<{ status: string }>
  }
}

const TransactionContext = createContext<TransactionContextType | null>(null)

export const useTransactionContext = () => {
  const context = useContext(TransactionContext)
  if (!context) {
    throw new Error('useTransactionContext must be used within a TransactionProvider')
  }
  return context
}

interface TransactionProviderProps {
  children: ReactNode
  publicClient: PublicClient | null
  modal: TransactionContextType['modal']
  erc20TokenService: TransactionContextType['erc20TokenService']
}

export function TransactionProvider({
  children,
  publicClient,
  modal,
  erc20TokenService,
} : TransactionProviderProps) {
  useEffect(() => {
    const channel = window.Echo.channel('transaction-results');

    channel.listen('.transaction.complete', async (event: { hash?: string }) => {
      try {
        if (!event.hash) {
          throw new Error('The hash needed to retrieve a receipt for the transaction is missing.')
        }
        if (!publicClient) {
          throw new Error('The public client is not initialized.')
        }

        const receipt = await erc20TokenService.getReceipt(publicClient, event.hash)
        if (receipt?.status !== 'success') {
          throw new Error(`The transaction with the following hash failed: ${event.hash}`)
        } else {
          modal.showTransactionSuccess('', event.hash)
        }
      } catch (error) {
        if (error instanceof Error) {
          modal.showError(error.message)
        } else {
          console.error('Unknown error:', error)
          modal.showError('An unknown error occurred.')
        }
      }
    })

    channel.listen('.transaction.failed', async (event: { hash: string }) => {
      modal.showTransactionFailure('', event.hash)
    })

    return () => {
      channel.stopListening('.transaction.complete')
      channel.stopListening('.transaction.failed')
      window.Echo.leaveChannel('transaction-results')
    }
  }, [publicClient, modal, erc20TokenService])

  return (
    <TransactionContext.Provider value={{ publicClient, modal, erc20TokenService }}>
      {children}
    </TransactionContext.Provider>
  )
}
