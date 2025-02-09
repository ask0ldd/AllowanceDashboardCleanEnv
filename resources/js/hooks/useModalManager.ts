import React from "react"
import { useState, useEffect, useRef, ReactNode } from "react"

/* 
* Centralizes the core logic for modal functionality.
* Check DashboardLayout.tsx to know more about the component insertion
*/
function useModalManager({initialVisibility, initialModalContentId} : IModalObject) {

    const [modalVisibility, setModalVisibility] = useState<boolean>(initialVisibility)
    const [modalContentId, setModalContentId] = useState<string>(initialModalContentId)

    // show an error modal with errorMessageRef as a message
    const errorMessageRef = useRef("")
    function showErrorModal (errorMessage : string) {
        errorMessageRef.current = errorMessage
        setModalContentId("error")
        setModalVisibility(true)
    }

    const successHashRef = useRef<string>("")
    const successMessageRef = useRef("")
    function showTransactionSuccessModal (successMessage : string, hash : string) {
        successMessageRef.current = successMessage
        successHashRef.current = hash
        setModalContentId("transactionSuccess")
        setModalVisibility(true)
    }

    const failureHashRef = useRef<string>("")
    const failureMessageRef = useRef("")
    function showTransactionFailureModal (failureMessage : string, hash : string) {
        failureMessageRef.current = failureMessage
        failureHashRef.current = hash
        setModalContentId("transactionFailure")
        setModalVisibility(true)
    }

    const injectedComponentRef = useRef<ReactNode>(React.createElement('<div>'))
    function showInjectionModal (injectedChild : ReactNode) {
        injectedComponentRef.current = injectedChild
        setModalContentId("injectedComponent")
        setModalVisibility(true)
    }

    function setModalStatus({visibility, contentId} : {visibility : boolean, contentId? : string}) {
        setModalVisibility(visibility)
        if(contentId) setModalContentId(contentId)
    }

    function closeModal(){
        setModalVisibility(false)
    }

    useEffect(() => {
  
        function keyboardListener(e : KeyboardEvent){
            if(e.code == "Escape" && modalVisibility) {
                e.preventDefault(); 
                e.stopPropagation(); 
                setModalVisibility(false)
            }
            if (e.key === 'Enter' && modalVisibility) {
                e.preventDefault();
            }
        }

        window.addEventListener('keydown', keyboardListener)

        // clean up to avoid having two listeners active => since useEffect is triggered twice in strict mode
        return () => {
            window.removeEventListener('keydown', keyboardListener)
        }

    }, [modalVisibility, setModalVisibility])

    useEffect(() => {

        if(modalVisibility) {
            scrollLock(true)
        } else { 
            scrollLock(false)
        }

    }, [modalVisibility])

    return { visibility : modalVisibility, setVisibility : setModalVisibility, close : closeModal, contentId : modalContentId, setContentId : setModalContentId, setStatus : setModalStatus, showError : showErrorModal, showTransactionSuccess : showTransactionSuccessModal, showTransactionFailure : showTransactionFailureModal, successMessageRef, successHashRef, failureMessageRef, failureHashRef, showInjectionModal, errorMessageRef, injectedComponentRef }
}

export default useModalManager

interface IModalObject{
    initialVisibility : boolean
    initialModalContentId : string
}

function scrollLock(bool : boolean)
{
    if(bool === true)
    {
        const scrollTop = window.scrollY || document.documentElement.scrollTop
        const scrollLeft = window.scrollX || document.documentElement.scrollLeft
        window.onscroll = () => {
            window.scrollTo(scrollLeft, scrollTop)
        }
    }else{
        window.onscroll = () => {}
    }
}

export interface ModalProps 
{
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