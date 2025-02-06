import { THexAddress } from "@/types/THexAddress";
import AddressUtils from "@/utils/AddressUtils";

export default class LocalStorageService {
    /**
   * Stores a wallet address in local storage.
   * @param address The wallet address to store
   * @throws Error if the address is invalid or if storage fails
   */
    storeWalletAddress(address : string) : void {
        try{
            if(!AddressUtils.isValidAddress(address)) throw new Error("Invalid address format.")
            localStorage.setItem("walletAddress", address)
        }catch(error){
            console.log("Failed to store the address in local storage : ", error)
        }
    }

    /**
   * Retrieves the wallet address from local storage.
   * @returns The stored wallet address or undefined if not found or invalid
   * @throws Error if retrieval from local storage fails
   */
    retrieveWalletAddress() : THexAddress | undefined {
        try{
            const address = localStorage.getItem("walletAddress")
            if(!address) return undefined
            return AddressUtils.isValidAddress(address) ? address : undefined
        }catch(error){
            console.log("Failed to retrieve the address from local storage : ", error)
            return undefined
        }
    }

    deleteWalletAddress() {
        localStorage.removeItem("walletAddress")
    }

    fullFlush() {
        localStorage.clear()
    }
}