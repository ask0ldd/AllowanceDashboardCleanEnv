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
    const { sdk, connected } = useSDK()
    
    const { metamaskService, localStorageService } = useServices()

    const { walletClient, setWalletClient, flushWClient : flushWalletClient } = useEtherClientsContext()

    const [walletAddress, setWalletAddress] = useState<THexAddress | null>(() => {
        const storageAddress = localStorageService.retrieveWalletAddress()
        return isHexAddress(storageAddress) ? storageAddress : null
    })
    
    // update the wallet client and the local storage when the metamask active account changes
    useEffect(() => {
        async function _setWalletClient(){
            const _walletClient = await metamaskService.getWalletClient()
            if(_walletClient) setWalletClient(_walletClient)
        }

        if (walletAddress) {
            localStorageService.storeWalletAddress(walletAddress)
            _setWalletClient()
        } else {
            localStorageService.deleteWalletAddress()
            flushWalletClient()
        }
    }, [walletAddress])

     // memorizing the listener for later removal
    const handleAccountsChangedCallback = useRef<((accounts: string[]) => void) | null>(null)

    useEffect(() => {
        handleAccountsChangedCallback.current = (accounts: string[]) => {
            if(accounts.length && typeof accounts[0] == 'string' && isHexAddress(accounts[0])) {
                setWalletAddress(accounts[0])
                localStorageService.storeWalletAddress(accounts[0])
                return
            }
            setWalletAddress(null)
            localStorageService.deleteWalletAddress()
            flushWalletClient()
        }

        if (window.ethereum) {
            window.ethereum.on('accountsChanged', handleAccountsChangedCallback.current)
            return () => {
                if (window.ethereum && handleAccountsChangedCallback.current) {
                    window.ethereum.removeListener('accountsChanged', handleAccountsChangedCallback.current)
                }
            }
        }
    }, [window.ethereum])

    async function handleCopyToClipboard(text : string) : Promise<void> {
        await ClipboardUtils.copy(text)
        setSnackbarMessage(Date.now() + "::Address copied to Clipboard.")
    }

    async function handleConnectToMetaMaskClick() {
        try {
            const accounts = await sdk?.connect()
            if(accounts && accounts.length > 0 && isHexAddress(accounts[0])) {
                setWalletAddress(accounts[0])
                localStorageService.storeWalletAddress(accounts[0])
            }
        } catch (err) {
            modal.showError('Check if Metamask is not asking for your credentials.')
            console.error("Failed to connect", err)
        }
    }

    function handleDisconnect(){
        if(sdk) sdk?.terminate()
        localStorageService.fullFlush()
        localStorageService.deleteWalletAddress()
        flushWalletClient()
    }

    if(!walletClient?.account?.address) return (
        <div className='p-3 text-[18px] font-semibold w-[100%] h-[80px] max-w-[320px] bg-component-white flex flex-row rounded-3xl text-[#FFFFFF] justify-center items-center' onClick={handleConnectToMetaMaskClick}>
            <div className='cursor-pointer gap-x-[15px] shadow-[0_2px_4px_#5B93EC40,0_4px_8px_#5B93EC40] w-[100%] h-[100%] bg-gradient-to-r from-[#303030] to-[#4C5054] rounded-[16px] flex flex-row justify-center items-center hover:shadow-[inset_0_1px_2px_#000000aa,_inset_0_2px_4px_#000000aa] hover:from-[hsl(0,0%,30%)] hover:to-[hsl(210,5%,40%)] hover:border-solid hover:border-[3px] hover:border-[#303030]'>
                <img src={walletIcon} alt="Wallet Icon"/>
                <span>Connect your wallet.</span>
            </div>
        </div>
    )

    return(<div className='flex gap-x-[15px]'>
            <div className="flex flex-row gap-x-[10px] justify-center items-center h-20 bg-component-white rounded-3xl rounded-r-[16px] overflow-hidden p-3 px-2 border border-solid border-dashcomponent-border pr-[12px]">
                <div className='flex justify-center flex-grow-0 items-center bg-gradient-to-r from-[#303030] to-[#4C5054] border-[1px] shadow-[0_2px_4px_#5B93EC40,0_4px_8px_#5B93EC40] border-solid border-[hsl(225,3%,20%)] w-[64px] h-[64px] rounded-[16px]'>
                    <img key="metamask-logo" width='42px' src={metamaskLogo} alt="MetaMask Logo"/>
                </div>
                <div className='flex flex-col text-[14px] text-[#303030] gap-y-[5px]' onClick={() => handleCopyToClipboard(walletAddress ?? localStorageService.retrieveWalletAddress() ?? "")}>
                    <div className='font-semibold text-[15px] font-oswald text-[#BCC2C8] flex items-center gap-x-[10px] my-[2px]'>
                        <div className='w-[11px] h-[11px] bg-green-400 rounded-full translate-y-[1px]'></div>
                        <span className='tracking-wider'>YOUR METAMASK WALLET IS ACTIVE.</span>
                    </div>
                    <hr className='mb-[2px]'/>
                    <span className='cursor-copy hover:bg-[#e8ebed]'>{walletAddress ?? localStorageService.retrieveWalletAddress() ?? ""}</span>
                </div>
            </div>
            <button className='flex flex-col border-[3px] border-solid border-[#000000AA] gap-y-[3px] pt-[1px] justify-center items-center flex-shrink-0 flex-grow-0 bg-gradient-to-r from-[#303030] to-[#4C5054]  w-[80px] h-[80px] rounded-[16px] shadow-[0_2px_4px_#A8B0BD70,0_4px_8px_#A8B0BD60] hover:from-[hsl(0,0%,30%)] hover:to-[hsl(210,5%,40%)] hover:shadow-[inset_0_1px_2px_#000000,_inset_0_2px_4px_#000000,0_2px_0_#FFFFFF] hover:border-offblack hover:border-[2px]' onClick={handleDisconnect}>
                <svg width="32" height="32" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#clip0_265_1423)">
                    <path d="M1.5 11C1.5 6.522 1.5 4.282 2.891 2.891C4.282 1.5 6.521 1.5 11 1.5C15.478 1.5 17.718 1.5 19.109 2.891C20.5 4.282 20.5 6.521 20.5 11C20.5 15.478 20.5 17.718 19.109 19.109C17.718 20.5 15.479 20.5 11 20.5C6.522 20.5 4.282 20.5 2.891 19.109C1.5 17.718 1.5 15.479 1.5 11Z" stroke="#F6FAFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M6.03516 11.0281H13.0112M13.0112 11.0281C13.0112 11.5981 10.8562 13.5151 10.8562 13.5151M13.0112 11.0281C13.0112 10.4421 10.8562 8.56312 10.8562 8.56312M16.0362 6.99512V14.9951" stroke="#F6FAFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </g>
                    <defs>
                    <clipPath id="clip0_265_1423">
                    <rect width="22" height="22" fill="#F6FAFF"/>
                    </clipPath>
                    </defs>
                </svg>
                <span className='text-offwhite text-[14px] font-medium'>Logout</span>
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