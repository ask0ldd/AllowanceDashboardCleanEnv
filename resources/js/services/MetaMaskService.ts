import { createWalletClient, custom } from "viem"
import { hardhat } from "viem/chains"

export default class MetaMaskService{
    async getWalletAddress(){
        if (typeof window.ethereum !== 'undefined') {
            const client = createWalletClient({
                chain: hardhat,
                transport: custom(window.ethereum) // see below
            })

            try {
                const [address] = await client.requestAddresses()
                console.log('Connected address:', address)
                return address
            } catch (error) {
                console.error('Failed to connect:', error)
            }
        } else {
          console.error('MetaMask is not installed')
        }
    }
    
    /*
        Fix window.ethereum alert

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