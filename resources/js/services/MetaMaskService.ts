import { THexAddress } from "@/types/THexAddress"
import { createPublicClient, createWalletClient, custom, WalletClient } from "viem"
import { privateKeyToAccount } from "viem/accounts"
import { hardhat, holesky } from "viem/chains"

export default class MetaMaskService{

    async getWalletClient(){
        try{
            if(!window.ethereum) throw new Error("No wallet extension active.")
            const [account] = await window.ethereum.request({ 
                method: 'eth_requestAccounts' 
            })
            return createWalletClient({
                account, // : address,
                chain: holesky,
                transport : custom(window.ethereum)
            })
        }catch(e){
            console.error(e)
        }
    }

    async getPublicClient(){
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

    /*walletClient : WalletClient | undefined = undefined

    async connectToWallet(){
        if (typeof window.ethereum !== 'undefined') {
            this.walletClient = createWalletClient({
                chain: hardhat,
                transport: custom(window.ethereum)
            })

        } else {
            console.error('MetaMask is inactive')
            throw new Error('MetaMask is inactive.')
        }      
    }

    isConnected(){
        return !!this.walletClient
    }

    async getWalletAddress(){
        try{
            if(!this.walletClient) {
                await this.connectToWallet()
                if(!this.walletClient) throw new Error("Can't connect to your wallet.")
            }
            const response = await this.walletClient.requestAddresses()
            // console.log('Connected address:', response[0])
            return response[0]
        }catch(error){
            console.error('Failed to connect:', error)
            throw error
        }
    }

    async getAccount(){
        try{
            if(!this.walletClient) {
                await this.connectToWallet()
                if(!this.walletClient) throw new Error("Can't connect to your wallet.")
            }
            return this.walletClient.account
        }catch(error){
            console.error('Failed to connect:', error)
            throw error
        }
    }*/

    /*async getWalletAddress(){
        if (typeof window.ethereum !== 'undefined') {
            const client = createWalletClient({
                chain: hardhat,
                transport: custom(window.ethereum) // see below
            })

            try {
                const response = await client.requestAddresses()
                console.log('Connected address:', response[0])
                return response[0]
            } catch (error) {
                console.error('Failed to connect:', error)
            }
        } else {
          console.error('MetaMask is not installed')
        }
    }*/
    
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