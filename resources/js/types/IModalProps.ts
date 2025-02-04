import { ReactNode } from "react"

export default interface IModalProps{
    visibility: boolean
    setVisibility: React.Dispatch<React.SetStateAction<boolean>>
    close: () => void
    contentId : string
    setContentId : React.Dispatch<React.SetStateAction<string>>
    setStatus : ({ visibility, contentId }: { visibility: boolean, contentId?: string}) => void
    showError : (errorMessage: string) => void
    showInjectionModal : (injectedChild: ReactNode) => void
    showSuccess : (successMessage: string, hash : `0x${string}`) => void
    errorMessageRef : React.RefObject<string>
    successHashRef : React.RefObject<string>
    successMessageRef : React.RefObject<string>
    injectedComponentRef : React.RefObject<React.ReactNode>
}