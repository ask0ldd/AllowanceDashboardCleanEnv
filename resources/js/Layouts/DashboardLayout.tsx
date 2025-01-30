import Header from "@/Components/Header/Header";
import ConfirmRevocation from "@/Components/Modale/ConfirmRevocation";
import ErrorAlert from "@/Components/Modale/ErrorAlert";
import InjectedComponent from "@/Components/Modale/InjectedComponent";
import Modal from "@/Components/Modale/Modal";
import SendingTransaction from "@/Components/Modale/SendingTransaction";
import Snackbar from "@/Components/Snackbar/Snackbar";
import { Head } from "@inertiajs/react";
import { useSDK } from "@metamask/sdk-react";
import React, { ReactNode } from "react";
import { PropsWithChildren } from "react";

export default function DashboardLayout({
    children,
    snackbarMessage,
    modal
}: PropsWithChildren<IProps>) {

    // const { sdk, connected, connecting, provider, chainId } = useSDK();
    // const metamask = useSDK();

    return(
        <div className='bg-dash-grey w-full h-full min-h-full flex flex-col font-jost'>
            <Snackbar message={snackbarMessage ? snackbarMessage : undefined}/>
            <Head title="Dashboard" />
            <Header/>
            <main className="flex flex-row justify-between gap-x-[30px]">
                {children}
            </main>
            {modal.visibility && 
                <Modal modalVisibility={modal.visibility} setModalStatus={modal.setStatus} width="560px">
                    {{
                        'error' : <ErrorAlert errorMessage={modal.errorMessageRef.current} closeModal={modal.close}/>,
                        'confirmRevocation' : <ConfirmRevocation/>,
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