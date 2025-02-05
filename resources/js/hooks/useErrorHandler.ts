import { AccountNotFoundError } from "@/errors/AccountNotFoundError"
import { ContractFunctionExecutionError, InvalidAddressError, BaseError, EstimateGasExecutionError, HttpRequestError, TimeoutError, UserRejectedRequestError, TransactionExecutionError } from "viem"

export default function useErrorHandler(showErrorModal : (errorMessage: string) => void){
    
    function handleBalanceValidationErrors(e: unknown) {
        if (e instanceof ContractFunctionExecutionError) {
            console.log('Contract function execution: ', e.shortMessage)
            if(e.shortMessage == "HTTP request failed.") {
                showErrorModal('You must connect your wallet to initiate such a transaction.')
            } else {
                if(e.shortMessage == "An unknown RPC error occurred.") {
                    showErrorModal('RPC error : To proceed, you may need to connect your wallet.')
                }else{
                    showErrorModal(`${e.shortMessage} Verify the target address is a valid contract.`)
                }
            }
        } else if (e instanceof InvalidAddressError) {
            console.log('Invalid address:', e.shortMessage)
            showErrorModal(e.shortMessage)
        } else if (e instanceof TimeoutError) {
            console.log('The contract read operation timed out after 10 seconds')
            showErrorModal(e.shortMessage)
        } else {
            const error = e as Error
            console.log("Couldn't retrieve the contract balance : ", error)
            showErrorModal(error?.message ?? "Couldn't retrieve the contract balance.")
        }
    }

    function handleSetAllowanceErrors(e : unknown){
        if (e instanceof InvalidAddressError) {
            console.log('Invalid address : ', e.shortMessage)
            showErrorModal('Invalid address : ' + e.shortMessage)
        } else if (e instanceof EstimateGasExecutionError) {
            console.log('Gas estimation failed : ', e.shortMessage)
            showErrorModal(e.shortMessage == "HTTP request failed." ? "HTTP request failed : Can't access the network." : e.shortMessage)
        } else if (e instanceof AccountNotFoundError) {
            console.log('Invalid account : ', e.shortMessage)
            showErrorModal('Invalid account : ' + e.shortMessage)
        } else if (e instanceof HttpRequestError) {
            console.log(e.headers)
            console.log(e.status)
            showErrorModal(e.shortMessage)
        } else if (e instanceof TimeoutError) {
            console.log('The contract operation timed out after 10 seconds')
            showErrorModal(e.shortMessage)
        } else if (e instanceof UserRejectedRequestError) {
            console.log('The user rejected the transaction')
            showErrorModal(e.shortMessage)
        } else if (e instanceof TransactionExecutionError) {
            console.log('The user rejected the transaction.')
            showErrorModal('The user rejected the transaction.')
        } else {
            const error = e as Error
            console.log('Transaction failed:', e)
            showErrorModal(error?.message ?? 'Transaction failed.')
        }
    }

    return {handleBalanceValidationErrors, handleSetAllowanceErrors}
}