import metamask from '@/assets/images/metamask.svg'
import { useServices } from '@/hooks/useServices'
import { THexAddress } from '@/types/THexAddress'
import { router } from '@inertiajs/react'
import { useEffect, useState } from 'react'

export default function InfoPanel(){
    const { metamaskService } = useServices()

    const [walletAddress, setWalletAddress] = useState<THexAddress | null>(null) // !!! should be into context with walletclient too

    async function handleConnectToWallet(){
        try{
            const address = await metamaskService.getWalletAddress()
            setWalletAddress(address)
        }catch{
            setWalletAddress(null)
        }
    }

    useEffect(() => {
        handleConnectToWallet()
    }, [metamaskService])

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

    if(!walletAddress) return (
    <div className='p-3 text-[18px] font-semibold w-[100%] max-w-[320px] bg-component-white flex flex-row rounded-3xl text-[#FFFFFF] justify-center items-center' onClick={() => location.reload()}>
        <div className='w-[100%] h-[100%] bg-[#303030] rounded-[16px] flex flex-row justify-center items-center'>Connect your wallet.</div>
    </div>
    )

    return(
        <div onClick={() => location.reload()} className="flex flex-row gap-x-[10px] justify-center items-center h-20 bg-component-white rounded-3xl overflow-hidden p-3 pl-2 border border-solid border-dashcomponent-border">
            <div className='flex justify-center items-center bg-[#303030] border-[1px] border-solid border-[hsl(225,3%,20%)] w-[64px] h-[64px] rounded-[16px]'><img className='w-[42px]' src={metamask}/></div>
            {walletAddress}
        </div>
    )
}