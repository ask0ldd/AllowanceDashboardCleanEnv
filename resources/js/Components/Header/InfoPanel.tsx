import metamaskLogo from '@/assets/images/metamask.svg'
import walletIcon from '@/assets/icons/walleticon.png'
import { useServices } from '@/hooks/useServices'
import { THexAddress } from '@/types/THexAddress'
import { isHexAddress } from '@/types/typeguards'
import ClipboardUtils from '@/utils/ClipboardUtils'
import { useSDK } from '@metamask/sdk-react'
import { ReactNode, useEffect, useRef, useState } from 'react'
import { useEtherClientsContext } from '@/hooks/useEtherClientsContext'
import logoutIcon from '@/assets/icons/logout.svg'

export default function InfoPanel({modal, setSnackbarMessage} : IProps){
    const { sdk, connected, provider } = useSDK()
    
    const { metamaskService, localStorageService } = useServices()

    const { publicClient, walletClient, setWalletClient, flushWClient } = useEtherClientsContext()

    const [walletAddress, setWalletAddress] = useState<THexAddress | null>(() => {
        const storageAddress = localStorageService.retrieveWalletAddress()
        return isHexAddress(storageAddress) ? storageAddress : null
    }) // !!! keeping account active when switching pages // through backend instead?
    
    // update the wallet client and the local storage when the metamask active account changes
    useEffect(() => {
        async function setWClient(){
            const wClient = await metamaskService.getWalletClient()
            if(wClient) setWalletClient(wClient)
        }

        if (walletAddress) {
            localStorageService.storeWalletAddress(walletAddress)
            setWClient()
        } else {
            localStorageService.deleteWalletAddress()
            flushWClient()
        }
    }, [walletAddress])

    const handleAccountsChanged = useRef<((accounts: string[]) => void) | null>(null) // memorizing the listener for later disposal

    useEffect(() => {
        handleAccountsChanged.current = (accounts: string[]) => {
            if(accounts.length && typeof accounts[0] == 'string' && isHexAddress(accounts[0])) {
                setWalletAddress(accounts[0])
                localStorageService.storeWalletAddress(accounts[0])
                return
            }
            setWalletAddress(null)
            localStorageService.deleteWalletAddress()
            flushWClient()
        }

        if (window.ethereum) {
            window.ethereum.on('accountsChanged', handleAccountsChanged.current)
            return () => {
                if (window.ethereum && handleAccountsChanged.current) {
                    window.ethereum.removeListener('accountsChanged', handleAccountsChanged.current)
                }
            }
        }

        // if(!window.ethereum) handleDisconnect()
    }, [window.ethereum])

    async function handleCopyToClipboard(text : string) : Promise<void> {
        await ClipboardUtils.copy(text)
        setSnackbarMessage(Date.now() + "::Address copied to Clipboard.")
    }

    async function handleConnectToMetaMaskClick() {
        try {
            // modal.showError('Check if Metamask is not asking for your credentials.')
            const accounts = await sdk?.connect()
            if(accounts && accounts.length > 0 && isHexAddress(accounts[0])) {
                setWalletAddress(accounts[0])
                localStorageService.storeWalletAddress(accounts[0])
            }
        } catch (err) {
            modal.showError('Check if Metamask is not asking for your credentials.') // !!!
            console.error("Failed to connect", err)
        }
    }

    function handleDisconnect(){
        if(sdk) sdk?.terminate()
        localStorageService.fullFlush()
        localStorageService.deleteWalletAddress()
        flushWClient()
    }

    if(!connected || !walletAddress) return (
    <div className='p-3 text-[18px] font-semibold w-[100%] max-w-[320px] bg-component-white flex flex-row rounded-3xl text-[#FFFFFF] justify-center items-center' onClick={handleConnectToMetaMaskClick}>
        <div className='cursor-pointer gap-x-[15px] shadow-[0_2px_4px_#5B93EC40,0_4px_8px_#5B93EC40] w-[100%] h-[100%] bg-gradient-to-r from-[#303030] to-[#4C5054] rounded-[16px] flex flex-row justify-center items-center hover:shadow-none hover:bg-[#000000]'>
            <img src={walletIcon}/>
            <span>Connect your wallet.</span>
        </div>
    </div>
    )

    return(
        <div className="flex flex-row gap-x-[10px] justify-center items-center h-20 bg-component-white rounded-3xl overflow-hidden p-3 px-2 border border-solid border-dashcomponent-border">
            <div className='flex justify-center items-center bg-gradient-to-r from-[#303030] to-[#4C5054] border-[1px] shadow-[0_2px_4px_#5B93EC40,0_4px_8px_#5B93EC40] border-solid border-[hsl(225,3%,20%)] w-[64px] h-[64px] rounded-[16px]'><img className='w-[42px]' src={metamaskLogo}/></div>
            <div className='flex flex-col text-[14px] text-[#303030] gap-y-[5px]' onClick={() => handleCopyToClipboard(walletAddress)}>
                <div className='font-semibold text-[15px] font-oswald text-[#BCC2C8] flex items-center gap-x-[10px] my-[2px]'>
                    <div className='w-[11px] h-[11px] bg-green-400 rounded-full translate-y-[1px]'></div>
                    <span className='tracking-wide'>YOUR METAMASK WALLET IS ACTIVE.</span>
                </div>
                {/*<span className='text-[13px]'>Here is your current wallet address :</span>*/}
                <hr className='mb-[2px]'/>
                <span className='cursor-copy hover:bg-[#e8ebed]'>{walletAddress}</span>
            </div>
            <button className='flex justify-center items-center flex-shrink-0 flex-grow-0 bg-[#E8EBED] w-[64px] h-[64px] rounded-[16px]' onClick={handleDisconnect}>
                <img className='w-[32px] h-[32px]' src={logoutIcon}/>
            </button>
        </div>
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

    /*const requestMade = useRef(false)
    useEffect(() => {
        if(!connected && !requestMade.current) {
            requestMetamaskConnection()
            requestMade.current = true
        }
    }, [connected])*/


/*async function handleConnectToWallet(){
        try{
            const address = await metamaskService.getWalletAddress()
            setWalletAddress(address)
        }catch{
            setWalletAddress(null)
        }
    }

    useEffect(() => {
        handleConnectToWallet()
    }, [metamaskService])*/


    /*useEffect(() => {
        const handleEthereumInitialized = () => {
            if (window.ethereum && window.ethereum.isMetaMask) {
            console.log("MetaMask has been activated");
            // Add your logic here for when MetaMask is detected
            }
        };
        
        window.addEventListener('ethereum#initialized', handleEthereumInitialized);
        
        // Check if MetaMask is already available
        if (window.ethereum && window.ethereum.isMetaMask) {
            handleEthereumInitialized();
        }
        
        return () => {
            window.removeEventListener('ethereum#initialized', handleEthereumInitialized);
        };
    }, []);*/