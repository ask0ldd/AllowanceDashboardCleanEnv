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
    snackbarMessage,
    setSnackbarMessage,
    modal
}: PropsWithChildren<IProps>) {

    const { erc20TokenService } = useServices()
    const { publicClient } = useEtherClientsContext()

    useEffect(() => {
        window.Echo.channel('transaction-results')
        .listen('.transaction.complete', async (event: any) => {
            console.log(event)
            if(!publicClient || !event.hash) {
                setSnackbarMessage("missing hash") // !!! throw error?
                return console.log("error")
            }
            const receipt = await erc20TokenService.getReceipt(publicClient, event.hash)
            setSnackbarMessage(Date.now() + "::Received event : " + JSON.stringify(event.hash))
            console.log(receipt.from)
            console.log(receipt.gasUsed)
            console.log(receipt.to)
            console.log(receipt.status)
            console.log(receipt.type)
            console.log(receipt.contractAddress)
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
            <Snackbar message={snackbarMessage ? snackbarMessage : undefined}/>
            <Head title="Dashboard" />
            <Header modal={modal} setSnackbarMessage={setSnackbarMessage}/>
            <main className="flex flex-row justify-between gap-x-[30px]">
                {children}
            </main>
            {modal.visibility && 
                <Modal modalVisibility={modal.visibility} setModalStatus={modal.setStatus} width="560px">
                    {{
                        'error' : <ErrorAlert errorMessage={modal.errorMessageRef.current} closeModal={modal.close}/>,
                        'sending' : <SendingTransaction/>,
                        'injectedComponent' : <InjectedComponent child={modal.injectedComponentRef.current}/>
                    } [modal.contentId]}
                </Modal>
            }
        </div>
    )
}

interface IProps{
    mainStyle? : string
    snackbarMessage? : string
    setSnackbarMessage : React.Dispatch<React.SetStateAction<string | null>>
    modal : {
        visibility: boolean
        setVisibility: React.Dispatch<React.SetStateAction<boolean>>
        close: () => void
        contentId : string
        setContentId : React.Dispatch<React.SetStateAction<string>>
        setStatus : ({ visibility, contentId }: { visibility: boolean, contentId?: string}) => void
        showError : (errorMessage: string) => void
        showInjectionModal : (injectedChild: ReactNode) => void
        errorMessageRef : React.RefObject<string>
        injectedComponentRef : React.RefObject<React.ReactNode>
    }
}