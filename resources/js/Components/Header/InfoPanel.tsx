import metamaskLogo from '@/assets/images/metamask.svg'
import { useServices } from '@/hooks/useServices'
import ClipboardUtils from '@/utils/ClipboardUtils'
import { useRemember } from '@inertiajs/react'
import { useSDK } from '@metamask/sdk-react'
import { useEffect, useState } from 'react'

export default function InfoPanel(){
    const { sdk, connected, connecting, provider, chainId } = useSDK()
    
    const { metamaskService, localStorageService, erc20TokenService } = useServices()

    const [walletAddress, setWalletAddress] = useState<string | null>(() => {
        return localStorageService.retrieveWalletAddress() as string
    })
      
    useEffect(() => {
        if (walletAddress) {
            localStorageService.storeWalletAddress(walletAddress)
            erc20TokenService.mountWalletClient()
        } else {
            localStorageService.deleteWalletAddress()
            erc20TokenService.unmountWalletClient()
        }
    }, [walletAddress])

    const connectToMetaMask = async () => {
        try {
        const accounts = await sdk?.connect()
          if(accounts && accounts.length > 0) setWalletAddress(accounts[0])
        } catch (err) {
          console.error("Failed to connect", err)
        }
    };

    async function getAccounts(){
        const accounts = await window.ethereum.request({method: 'eth_requestAccounts'})
        console.log(JSON.stringify(accounts))
    }

    useEffect(() => {
        if(connected) getAccounts()
    }, [connected])

    /*useEffect(() => {
        sdk?.getWalletStatus()
    }, [connected])*/

    async function handleCopyToClipboard(text : string) : Promise<void> {
        await ClipboardUtils.copy(text)
        // !!! setSnackbarMessage(Date.now() + "::Address copied to Clipboard.")
    }

    if(!connected || !walletAddress) return (
    <div className='p-3 text-[18px] font-semibold w-[100%] max-w-[320px] bg-component-white flex flex-row rounded-3xl text-[#FFFFFF] justify-center items-center' onClick={connectToMetaMask}>
        <div className='cursor-pointer w-[100%] h-[100%]  bg-gradient-to-r from-[#303030] to-[#4C5054] rounded-[16px] flex flex-row justify-center items-center'>Connect your wallet.</div>
    </div>
    )

    return(
        <div className="flex flex-row gap-x-[10px] justify-center items-center h-20 bg-component-white rounded-3xl overflow-hidden p-3 pl-2 border border-solid border-dashcomponent-border">
            <div className='flex justify-center items-center bg-[#303030] border-[1px] border-solid border-[hsl(225,3%,20%)] w-[64px] h-[64px] rounded-[16px]'><img className='w-[42px]' src={metamaskLogo}/></div>
            <span onClick={() => handleCopyToClipboard(walletAddress)}>{walletAddress}</span>
        </div>
    )
}

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