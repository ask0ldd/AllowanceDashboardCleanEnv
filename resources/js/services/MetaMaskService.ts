import { createPublicClient, createWalletClient, custom, PublicClient, WalletClient } from "viem"
import { holesky } from "viem/chains"

export default class MetaMaskService{

    /**
     * Retrieves a wallet client using the connected Ethereum provider.
     * @async
     * @returns {Promise<WalletClient|undefined>} A Promise that resolves to a WalletClient instance or undefined if an error occurs.
     * @throws {Error} If no wallet extension is active.
     */
    async getWalletClient(): Promise<WalletClient|undefined>{
        try{
            if(!window.ethereum) throw new Error("No wallet extension active.")
            const [account] = await window.ethereum.request({ 
                method: 'eth_requestAccounts' 
            })
            return createWalletClient({
                account,
                chain: holesky,
                transport : custom(window.ethereum)
            })
        }catch(e){
            console.error(e)
        }
    }

    /**
     * Creates a public client using the connected Ethereum provider.
     * @async
     * @returns {Promise<PublicClient|undefined>} A Promise that resolves to a PublicClient instance or undefined if an error occurs.
     * @throws {Error} If no wallet extension is active.
     */
    async getPublicClient(): Promise<PublicClient|undefined>{
        try{
            if(!window.ethereum) throw new Error("No wallet extension active.")
            return createPublicClient({
                chain: holesky,
                transport : custom(window.ethereum)
            })
        }catch(e){
            console.error(e)
        }
    }
    
    /*
        NB : fix window.ethereum alert

        global.d.ts:
        import { EIP1193Provider } from 'viem'

        declare global {
            interface Window {
                ethereum?: EIP1193Provider
            }
        }

        tsconfig.json :
        {
            "include": ["src/**\/*", "global.d.ts"]
        }
    */
}