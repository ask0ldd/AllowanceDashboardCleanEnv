import metamaskLogo from '@/assets/images/metamask.svg'
import walletIcon from '@/assets/icons/walleticon.png'
import { useServices } from '@/hooks/useServices'
import { THexAddress } from '@/types/THexAddress'
import { isHexAddress } from '@/types/typeguards'
import ClipboardUtils from '@/utils/ClipboardUtils'
import { useSDK } from '@metamask/sdk-react'
import { useEffect, useState } from 'react'
import { useEtherClientsContext } from '@/hooks/useEtherClientsContext'

export default function InfoPanel(){
    const { sdk, connected, provider } = useSDK()
    
    const { metamaskService, localStorageService } = useServices()

    const { publicClient, walletClient, setWalletClient, flushWClient } = useEtherClientsContext()

    const [walletAddress, setWalletAddress] = useState<THexAddress | null>(() => {
        const storageAddress = localStorageService.retrieveWalletAddress()
        return isHexAddress(storageAddress) ? storageAddress : null
    }) // !!! keeping account active when switching pages // through backend instead?
     
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

    useEffect(() => {
        if (provider && connected) {
            provider.on('accountsChanged', (accounts : any) => {
                if(accounts.length && typeof accounts[0] == 'string' && isHexAddress(accounts[0])) {
                    setWalletAddress(accounts[0])
                    localStorageService.storeWalletAddress(accounts[0])
                    return
                }
                setWalletAddress(null)
                localStorageService.deleteWalletAddress()
                flushWClient()
            })
            // return () => {
            //     provider.removeListener('accountsChanged', () => {});
            //     window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
            // }; !!! avoid listener stackings
        }
    }, [provider])

    async function handleCopyToClipboard(text : string) : Promise<void> {
        await ClipboardUtils.copy(text)
        // !!! setSnackbarMessage(Date.now() + "::Address copied to Clipboard.")
    }

    async function handleConnectToMetaMaskClick() {
        try {
            const accounts = await sdk?.connect()
            if(accounts && accounts.length > 0 && isHexAddress(accounts[0])) {
                setWalletAddress(accounts[0])
                localStorageService.storeWalletAddress(accounts[0])
            }
        } catch (err) {
            console.error("Failed to connect", err)
        }
    }

    function handleDisconnect(){
        sdk?.disconnect()
        localStorageService.fullFlush()
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
                <span className='font-semibold text-[16px] text-[#BCC2C8] flex items-center gap-x-[10px]'><div className='w-[10px] h-[10px] bg-green-400 rounded-full'></div>YOUR METAMASK WALLET IS ACTIVE.</span>
                {/*<span className='text-[13px]'>Here is your current wallet address :</span>*/}
                <hr className='mb-[2px]'/>
                <span className='cursor-copy'>{walletAddress}</span>
            </div>
            <button className='flex justify-center items-center flex-shrink-0 flex-grow-0 bg-[#E8EBED] w-[64px] h-[64px] rounded-[16px]' onClick={handleDisconnect}>disco</button>
        </div>
    )
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