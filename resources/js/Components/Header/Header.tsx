import { ReactNode } from "react";
import InfoPanel from "./InfoPanel";
import Nav from "./Nav";

export default function Header({modal, setSnackbarMessage} : IProps){
    return (
        <header className="flex flex-row justify-between py-5">
            <Nav />
            <InfoPanel modal={modal} setSnackbarMessage={setSnackbarMessage}/>
        </header>
    )
}

interface IProps{
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
        },
    setSnackbarMessage : React.Dispatch<React.SetStateAction<string | null>>
}