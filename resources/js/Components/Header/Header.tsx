import { ReactNode } from "react";
import InfoPanel from "./InfoPanel";
import Nav from "./Nav";

export default function Header({setSnackbarMessage, walletAddress, setWalletAddress} : IProps){
    return (
        <header className="flex flex-row justify-between py-5">
            <Nav />
            <InfoPanel setSnackbarMessage={setSnackbarMessage} walletAddress={walletAddress} setWalletAddress={setWalletAddress}/>
        </header>
    )
}

interface IProps{
    setSnackbarMessage : React.Dispatch<React.SetStateAction<string | null>>
    walletAddress : `0x${string}` | null
    setWalletAddress : React.Dispatch<React.SetStateAction<`0x${string}` | null>>
}