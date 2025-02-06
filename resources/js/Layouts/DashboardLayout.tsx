import Header from "@/Components/Header/Header";
import ErrorAlert from "@/Components/Modale/ErrorAlert";
import InjectedComponent from "@/Components/Modale/InjectedComponent";
import Modal from "@/Components/Modale/Modal";
import SendingTransaction from "@/Components/Modale/SendingTransaction";
import Snackbar from "@/Components/Snackbar/Snackbar";
import { Head, router } from "@inertiajs/react";
import { useEffect } from "react";
import { PropsWithChildren } from "react";
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { useServices } from "@/hooks/useServices";
import { useEtherClientsContext } from "@/hooks/useEtherClientsContext";
import useSnackbar from "@/hooks/useSnackbar";
import WaitingConfirmation from "@/Components/Modale/WaitingConfirmation";
import IModalProps from "@/types/IModalProps";
import TransactionSuccess from "@/Components/Modale/TransactionSuccess";
import TransactionFailure from "@/Components/Modale/TransactionFailure";

window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: import.meta.env.VITE_REVERB_PORT ?? 80,
    wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
    enabledTransports: ['ws', 'wss'],
});

export default function DashboardLayout({
    children,
    modal
}: PropsWithChildren<IProps>) {

    const { setSnackbarMessage } = useSnackbar()

    const { erc20TokenService } = useServices()
    const { publicClient, walletClient } = useEtherClientsContext()

    // sending the walletAddress with each router calls
    useEffect(() => {
        const callback = (event: { detail: { visit: { headers: Record<string, string | null> } } }) => {
            event.detail.visit.headers = {
                ...event.detail.visit.headers,
                'walletAddress': walletClient?.account?.address ? walletClient?.account?.address as string : null
            }
        }
    
        const eventListener = router.on('before', callback)
    
        return () => {
            eventListener()
        }
    }, [walletClient?.account?.address])
   
    // webSocket event listeners for transaction resolution messages
    useEffect(() => {
        const channel = window.Echo.channel('transaction-results');

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
        })
        
        channel.listen('.transaction.failed', async (event: any) => {
            modal.showTransactionFailure("", event.hash)
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
                only: ['allowances', 'flash', 'success'],
                preserveUrl: true,
                replace: true,
                data: { 
                    showRevoked : false, 
                    searchValue: '', 
                    showUnlimitedOnly : false,
                } 
            })
        }
    }, [modal.visibility])

    return(
        <div className='bg-dash-grey w-full h-full min-h-full flex flex-col font-jost'>
            <Snackbar/>
            <Head title="Dashboard" />
            <Header modal={modal} setSnackbarMessage={setSnackbarMessage}/>
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
    )
}

interface IProps{
    mainStyle? : string
    modal : IModalProps
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