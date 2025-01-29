// import trashIcon from '@/assets/icons/trashicon.svg'
// import editIcon from '@/assets/icons/editicon.svg'
import useModalManager from '@/hooks/useModalManager'
import { useServices } from '@/hooks/useServices'
import { IAllowance } from '@/types/IAllowance'
import { THexAddress } from '@/types/THexAddress'
import AddressUtils from '@/utils/AddressUtils'
import ClipboardUtils from '@/utils/ClipboardUtils'
import { router } from '@inertiajs/react'
import { BaseError, EstimateGasExecutionError, HttpRequestError, InvalidAddressError, PrivateKeyAccount } from 'viem'
import { AccountNotFoundError } from "@/errors/AccountNotFoundError";
import { privateKeyToAccount } from 'viem/accounts'
import useErrorHandler from '@/hooks/useErrorHandler'
import { Errors } from '@inertiajs/core/types/types'

export default function Table({accountAddress, allowances, setSnackbarMessage, showErrorModal, setModalStatus} : IProps){

    const { erc20TokenService } = useServices()
    const {handleBalanceValidationErrors, handleSetAllowanceErrors} = useErrorHandler(showErrorModal)

    const account: PrivateKeyAccount = privateKeyToAccount("0xc526ee95bf44d8fc405a158bb884d9d1238d99f0612e9f33d006bb0789009aaa") // !!! should use wallet instead

    async function handleCopyToClipboard(text : string) : Promise<void> {
        await ClipboardUtils.copy(text)
        setSnackbarMessage(Date.now() + "::Address copied to Clipboard.")
    }

    async function handleRevokeButtonClick(allowanceId : number, contractAddress : THexAddress, spenderAddress : THexAddress){
        // setModalStatus({visibility : true, contentId : 'sending'})
        try{
            const receipt =  await erc20TokenService.revokeAllowance({account, contractAddress, spenderAddress})

            if(receipt?.status != 'success') {
                showErrorModal("Transaction receipt : The transaction has failed.")
                return
            }
            // !!! show modale transaction
            // setModalStatus({visibility : true, contentId : 'confirmRevocation'})
            router.put(`/allowance/revoke/${allowanceId}`, {_method: 'put',}, { // put throws this error : The PUT method is not supported for route dashboard. Supported methods: GET, HEAD.
                preserveState: true,
                preserveScroll: true,
                preserveUrl:true,
                onSuccess : () => { }, // !!!
                onError: (e : Errors) => {
                    if(e?.error) showErrorModal(e.error)
                }, 
            })
        }catch(e){
            handleSetAllowanceErrors(e)
        }
    }

    // get allowances from DB
    // check if these allowances exists into the chain

    return(
        <>
        <table className="text-left text-[14px] mt-[28px]">
            <thead>
                <tr>
                    <th className="w-[80px]"></th><th className="w-[140px]">Token name</th><th className="w-[150px]">Token address</th><th className="w-[100px]">Symbol</th><th className="w-[150px]">Owner address</th><th className="w-[150px]">Spender address</th><th className="w-[150px]">Amount</th><th className="w-[110px]">Update</th><th className="w-[250px] text-center">Actions</th>
                </tr>
            </thead>
            <tbody>
            {allowances && allowances.map((allowance, index) => (
                <tr key={"tableLine" + index}>
                    <td><img className='w-[32px] mx-auto' src={`/coins/${allowance.tokenContractSymbol}.svg`}/></td>
                    <td>{allowance.tokenContractName}</td>
                    <td className='cursor-copy hover:underline' onClick={() => handleCopyToClipboard(allowance.tokenContractAddress)} title={allowance.tokenContractAddress}>{AddressUtils.maskAddress(allowance.tokenContractAddress)}</td>
                    <td>{allowance.tokenContractSymbol}</td>
                    <td className='cursor-copy hover:underline' onClick={() => handleCopyToClipboard(accountAddress)} title={accountAddress}>{AddressUtils.maskAddress(accountAddress)}</td>
                    <td className='cursor-copy hover:underline' onClick={() => handleCopyToClipboard(allowance.spenderAddress)} title={allowance.spenderAddress}>{AddressUtils.maskAddress(allowance.spenderAddress)}</td>
                    <td>{allowance.isUnlimited ? 'Unlimited' : allowance.amount /* !!! should be compared with devnet amount*/}</td>
                    <td>12/10/2024{/* !!! updatedAt but format*/}</td>
                    <td className="flex flex-row gap-x-[10px] justify-center items-center h-[50px] px-[10px]">
                        <button onClick={() => router.visit('allowance/edit/'+allowance.id)} className="flex flex-row justify-center items-center w-1/2 h-[38px] gap-x-[8px] font-semibold bg-tablebutton-bg rounded-full border-[2px] text-offblack border-offblack shadow-[0_2px_4px_#A8B0BD40,0_4px_5px_#5D81B960] hover:bg-[#E8EBED] hover:shadow-[0_1px_0_#FFFFFF]">
                            Edit
                        </button>
                        <button onClick={() => handleRevokeButtonClick(allowance.id, allowance.tokenContractAddress, allowance.spenderAddress)} className="flex flex-row justify-center items-center w-1/2 h-[38px] gap-x-[6px] font-semibold rounded-full bg-desat-orange-gradient border-2 border-[#43484c] text-[#ffffff] shadow-[0_2px_4px_#A8B0BD40,0_4px_5px_#5D81B960] textShadow hover:shadow-[0_1px_0_#FFFFFF] hover:bg-orange-gradient">
                            Revoke
                        </button>
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
        <div className='ml-auto mt-[15px] flex flex-row gap-x-[8px]'>
            <button className='flex justify-center items-center w-[32px] h-[32px] bg-[#ffffff] shadow-[0_2px_4px_#A8B0BD40,0_4px_5px_#5D81B960] rounded-[4px]'>1</button>
            <button className='flex justify-center items-center w-[32px] h-[32px] bg-[#ffffff] shadow-[0_2px_4px_#A8B0BD40,0_4px_5px_#5D81B960] rounded-[4px]'>2</button>
            ...
            <button className='flex justify-center items-center w-[32px] h-[32px] bg-[#ffffff] shadow-[0_2px_4px_#A8B0BD40,0_4px_5px_#5D81B960] rounded-[4px]'>9</button>
            <button className='flex justify-center items-center w-[32px] h-[32px] bg-[#ffffff] shadow-[0_2px_4px_#A8B0BD40,0_4px_5px_#5D81B960] rounded-[4px]'>10</button>
        </div>
        </>
    )
}

interface IProps{
    accountAddress: THexAddress
    allowances?: IAllowance[]
    setSnackbarMessage : (value: React.SetStateAction<string | null>) => void
    showErrorModal : (mess :string) => void 
    setModalStatus : ({ visibility, contentId } : {
        visibility: boolean
        contentId?: string
    }) => void
}

/*

!!!! remplace with link

<Link key={allowance.id} href={route('allowances.edit', allowance.id)}>
    Edit Allowance {allowance.id}
</Link>

<Link href={route('editallowance', { id: 0 })}>Edit Allowance</Link>

*/

    /* get rid of 
    const dummyContractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
    const dummyOwnerAddress = '0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097'
    const dummySpenderAddress =  '0x14dC79964da2C08b23698B3D3cc7Ca32193d9955'
    const dummyContractOwnerAddress = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
    */

            /*router.delete(`/allowance/delete/${allowanceId}`, {
            preserveState: true,
            preserveScroll: true,
        })*/