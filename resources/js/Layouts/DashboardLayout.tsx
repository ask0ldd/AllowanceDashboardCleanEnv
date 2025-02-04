import Header from "@/Components/Header/Header";
import ErrorAlert from "@/Components/Modale/ErrorAlert";
import InjectedComponent from "@/Components/Modale/InjectedComponent";
import Modal from "@/Components/Modale/Modal";
import SendingTransaction from "@/Components/Modale/SendingTransaction";
import Snackbar from "@/Components/Snackbar/Snackbar";
import { Head } from "@inertiajs/react";
import React, { ReactNode, useEffect } from "react";
import { PropsWithChildren } from "react";
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { useServices } from "@/hooks/useServices";
import { useEtherClientsContext } from "@/hooks/useEtherClientsContext";
import useSnackbar from "@/hooks/useSnackbar";
import Success from "@/Components/Modale/Success";
import WaitingConfirmation from "@/Components/Modale/WaitingConfirmation";
import IModalProps from "@/types/IModalProps";

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

/*const echo = new Echo({
    broadcaster: 'socket.io',
    host: window.location.hostname + ':6001',
    client: io,
});*/

export default function DashboardLayout({
    children,
    /*snackbarMessage,
    setSnackbarMessage,*/
    modal
}: PropsWithChildren<IProps>) {

    const { setSnackbarMessage } = useSnackbar()

    const { erc20TokenService } = useServices()
    const { publicClient } = useEtherClientsContext()

    // useEchoTransactionNotifier
    useEffect(() => {
        window.Echo.channel('transaction-results')
        .listen('.transaction.complete', async (event: any) => {
            try{
                console.log(event)
                if(!publicClient || !event.hash) {
                    setSnackbarMessage("missing hash") // !!! should be error
                    return console.log("error")
                }
                const receipt = await erc20TokenService.getReceipt(publicClient, event.hash)
                /*if(receipt?.status != 'success') {
                    modal.showError("Transaction receipt : The transaction has failed.")
                    return
                } else {
                    console.log("The transaction has been received by the network.")
                }*/
                // setSnackbarMessage(Date.now() + "::Received event : " + event.hash)
                if(receipt){
                    console.log(Date.now() + ' - ' + receipt.from)
                    console.log(receipt.gasUsed)
                    console.log(receipt.to)
                    console.log(receipt.status)
                    console.log(receipt.type)
                    console.log(receipt.contractAddress)
                
                    /*modal.showInjectionModal(
                        <div className="flex flex-col">
                            <p>Your transaction has been validated.</p>
                            <p>From : {receipt.from}</p>
                            <p>To : {receipt.to}</p>
                            <p>Gas Used : {receipt.gasUsed}</p>
                            <p>Status : {receipt.status}</p>
                            <p>Type : {receipt.type}</p>
                            <p>Contract : {receipt.contractAddress}</p>
                        </div>
                    )*/
                   modal.showSuccess("", event.hash)
                }
            }catch(error){
                console.error(error)
            }
        })

        return () => {
            window.Echo.leaveChannel('transaction-results')
        }
    }, [])

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
                        'success' : <Success successMessage={modal.successMessageRef.current} hash={modal.successHashRef.current} closeModal={modal.close}/>,
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
    /*snackbarMessage? : string
    setSnackbarMessage : React.Dispatch<React.SetStateAction<string | null>>*/
    modal : IModalProps
}