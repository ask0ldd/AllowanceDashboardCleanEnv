import Header from "@/Components/Header/Header";
import ErrorAlert from "@/Components/Modale/ErrorAlert";
import InjectedComponent from "@/Components/Modale/InjectedComponent";
import Modal from "@/Components/Modale/Modal";
import SendingTransaction from "@/Components/Modale/SendingTransaction";
import Snackbar from "@/Components/Snackbar/Snackbar";
import { Head, router } from "@inertiajs/react";
import { useEffect, useRef, useState } from "react";
import { useServices } from "@/hooks/useServices";
import { useEtherClientsContext } from "@/hooks/useEtherClientsContext";
import useSnackbar from "@/hooks/useSnackbar";
import WaitingConfirmation from "@/Components/Modale/WaitingConfirmation";
import TransactionSuccess from "@/Components/Modale/TransactionSuccess";
import TransactionFailure from "@/Components/Modale/TransactionFailure";
import useEcho from "@/hooks/useEcho";
import { THexAddress } from "@/types/THexAddress";
import { isHexAddress } from "@/types/typeguards";
import useModalManager from "@/hooks/useModalManager";
import React from "react";
import { ModalProvider } from "@/context/ModalContext";

export default function DashboardLayout({ children }: IProps) {

    useEcho()
    const { setSnackbarMessage } = useSnackbar()
    const modal = useModalManager({initialVisibility : false, initialModalContentId : 'error'})

    const { erc20TokenService, metamaskService, localStorageService } = useServices()
    const { walletClient, setWalletClient, publicClient, flushWClient : flushWalletClient, addressRef } = useEtherClientsContext()

    const [walletAddress, setWalletAddress] = useState<THexAddress | null>(walletClient?.account?.address ?? null /*(() => {
        const storageAddress = localStorageService.retrieveWalletAddress()
        return isHexAddress(storageAddress) ? storageAddress : null
    })*/)

    // sending the walletAddress with each router calls & close the waiting confirmation modal when switching pages
    const removeRouterEventListener = useRef<VoidFunction | null>(null)
    useEffect(() => {
        const callback = (event: { detail: { visit: { headers: Record<string, string | null> } } }) => {
            event.detail.visit.headers = {
                ...event.detail.visit.headers,
                'walletAddress': addressRef.current ?? null
            }
            if(modal.contentId == "waitingConfirmation") modal.close()
        }
    
        removeRouterEventListener.current = router.on('before', callback)
    
        return () => {
            if(removeRouterEventListener.current) removeRouterEventListener.current()
        }
    }, [addressRef.current, modal.contentId])
   
    // webSocket event listeners intercepting transaction resolution messages
    useEffect(() => {

        window.Echo.connector.pusher.connection.bind('error', (error : Error) => {
            console.error('Error connecting to Reverb:', error)
        })

        const channel = window.Echo.channel('transaction-results')

        channel.listen('.transaction.complete', async (event: any) => {
            try{
                if(!event.hash) {
                    throw new Error('The hash needed to retrieve a receipt for the transaction is missing.')
                }
                if(!publicClient) {
                    throw new Error('The public client is not initialized.')
                }

                const receipt = await erc20TokenService.getReceipt(publicClient, event.hash)
                if(receipt?.status != 'success'){
                    throw new Error("The transaction with the following hash failed : ", event.hash)
                } else{
                    modal.showTransactionSuccess("", event.hash)
                }
            }catch(error){
                if (error instanceof Error) {
                    modal.showError(error.message)
                } else {
                    console.error('Unknown error:', error)
                    modal.showError('An unknown error occurred.')
                }
            }
        }).error((error : Error) => {
            console.error('WebSocket error:', error);
            modal.showError("Connection error. Transaction notifications are unavailable and may be delayed until your next session.")
        })
        
        channel.listen('.transaction.failed', async (event: any) => {
            modal.showTransactionFailure("", event.hash)
        }).error((error : Error) => {
            console.error('WebSocket error:', error);
            modal.showError("Connection error. Transaction notifications are unavailable and may be delayed until your next session.")
        })

        return () => {
            channel.stopListening('.transaction.complete')
            channel.stopListening('.transaction.failed')
            window.Echo.leaveChannel('transaction-results')
        }
    }, [])

    // refresh the table when the successful / failure transaction modals pop
    useEffect(() => {
        if(modal.visibility==true && (modal.contentId == "transactionSuccess" || modal.contentId == "transactionFailure")) {
            router.reload({ 
                only: ['allowances', 'flash', 'success', 'resetFilters'],
                preserveUrl: true,
                replace: true,
                data: { 
                    showRevoked : false, 
                    searchValue: '', 
                    showUnlimitedOnly : false,
                    resetFilters : true
                } 
            })
        }
    }, [modal.visibility])

    // memorizing the listener for later removal
    const handleAccountsChangedCallback = useRef<((accounts: string[]) => void) | null>(null)

    // handling metamask account switching
    useEffect(() => {
        handleAccountsChangedCallback.current = async (accounts: string[]) => {
            if(accounts.length && isHexAddress(accounts[0])) {
                console.log("handleAccountsChangedCallback inside")
                const _walletClient = await metamaskService.getWalletClient()
                console.log(JSON.stringify(_walletClient))
                if(_walletClient) {
                    addressRef.current = accounts[0] ?? null
                    setWalletClient(_walletClient)
                }
                if(isHexAddress(_walletClient?.account?.address)) {
                    console.log(_walletClient?.account?.address)
                    setWalletAddress(_walletClient?.account?.address)
                    localStorageService.storeWalletAddress(_walletClient?.account?.address)
                    router.reload()
                }
                return
            }
            setWalletAddress(null)
            localStorageService.deleteWalletAddress()
            flushWalletClient()
        }

        if (window.ethereum) {
            window.ethereum.on('accountsChanged', handleAccountsChangedCallback.current)
            return () => {
                if (window.ethereum && handleAccountsChangedCallback.current) {
                    window.ethereum.removeListener('accountsChanged', handleAccountsChangedCallback.current)
                }
            }
        }
    }, [window.ethereum])

    return(
        <ModalProvider modal={modal}>
            <div className='bg-dash-grey w-full h-full min-h-full flex flex-col font-jost'>
                <Snackbar/>
                <Head title="Dashboard" />
                <Header key={'headerKey'} setSnackbarMessage={setSnackbarMessage} walletAddress={walletAddress} setWalletAddress={setWalletAddress}/>
                <main className="flex flex-row justify-between gap-x-[30px]">
                    {children}
                </main>
                {modal.visibility && 
                    <Modal modalVisibility={modal.visibility} setModalStatus={modal.setStatus} width={modal.contentId == "success" ? "560px" : "560px"}>
                        {{
                            'error' : <ErrorAlert errorMessage={modal.errorMessageRef.current} closeModal={modal.close}/>,
                            'transactionSuccess' : <TransactionSuccess successMessage={modal.successMessageRef.current} hash={modal.successHashRef.current} closeModal={modal.close}/>,
                            'transactionFailure' : <TransactionFailure failureMessage={modal.failureMessageRef.current} hash={modal.failureHashRef.current} closeModal={modal.close}/>,
                            'sending' : <SendingTransaction/>,
                            'injectedComponent' : <InjectedComponent child={modal.injectedComponentRef.current}/>,
                            'waitingConfirmation' : <WaitingConfirmation/>
                        } [modal.contentId]}
                    </Modal>
                }
            </div>
        </ModalProvider>
    )
}

interface IProps{
    children: React.ReactNode
    /*mainStyle? : string
    modal : IModalProps*/
}

/*
    {
    blobGasPrice?: quantity | undefined
    blobGasUsed?: quantity | undefined
    blockHash: Hash
    blockNumber: quantity
    contractAddress: Address | null | undefined
    cumulativeGasUsed: quantity
    effectiveGasPrice: quantity
    from: Address
    gasUsed: quantity
    logs: Log<quantity, index, false>[]
    logsBloom: Hex
    root?: Hash | undefined
    status: status
    to: Address | null
    transactionHash: Hash
    transactionIndex: index
    type: type
    }
*/