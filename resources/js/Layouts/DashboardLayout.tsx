import Header from "@/Components/Header/Header";
import ConfirmRevocation from "@/Components/Modale/ConfirmRevocation";
import ErrorAlert from "@/Components/Modale/ErrorAlert";
import Modal from "@/Components/Modale/Modal";
import SendingTransaction from "@/Components/Modale/SendingTransaction";
import Snackbar from "@/Components/Snackbar/Snackbar";
import useModalManager from "@/hooks/useModalManager";
import Dashboard from "@/Pages/Dashboard";
import { Head } from "@inertiajs/react";
import React from "react";
import { PropsWithChildren, ReactNode } from "react";

export default function DashboardLayout({
    mainStyle,
    children,
    snackbarMessage,
    modalVisibility,
    setModalStatus,
    errorMessageRef,
    modalContentId
}: PropsWithChildren<IProps>) {

    return(
        <div className='bg-dash-grey w-full h-full min-h-full flex flex-col font-jost'>
            <Snackbar message={snackbarMessage ? snackbarMessage : undefined}/>
            <Head title="Dashboard" />
            <Header/>
            <main className="flex flex-row justify-between gap-x-[30px]">
                {children}
            </main>
            {modalVisibility && 
                <Modal modalVisibility={modalVisibility} setModalStatus={setModalStatus} width="560px">
                    {{
                        'error' : <ErrorAlert errorMessage={errorMessageRef.current}/>,
                        'confirmRevocation' : <ConfirmRevocation/>,
                        'sending' : <SendingTransaction/>,
                    } [modalContentId]}
                </Modal>
            }
        </div>
    )
}

interface IProps{
    setModalStatus : ({ visibility, contentId } : {
        visibility: boolean
        contentId?: string
    }) => void
    mainStyle? : string
    snackbarMessage? : string
    modalVisibility : boolean
    errorMessageRef : React.RefObject<string>
    modalContentId : string
}