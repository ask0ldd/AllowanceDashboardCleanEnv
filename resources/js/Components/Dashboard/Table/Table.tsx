import { useServices } from '@/hooks/useServices'
import { IAllowance } from '@/types/IAllowance'
import { THexAddress } from '@/types/THexAddress'
import AddressUtils from '@/utils/AddressUtils'
import ClipboardUtils from '@/utils/ClipboardUtils'
import { router } from '@inertiajs/react'
import useErrorHandler from '@/hooks/useErrorHandler'
import { Errors } from '@inertiajs/core/types/types'
import NumberUtils from '@/utils/NumberUtils'
import { ReactNode } from 'react'
import DateUtils from '@/utils/DateUtils'
import { useEtherClientsContext } from '@/hooks/useEtherClientsContext'

export default function Table({allowances, setSnackbarMessage, modal} : IProps){

    const { erc20TokenService } = useServices()

    const {handleSetAllowanceErrors} = useErrorHandler(modal.showError)

    const { publicClient, walletClient } = useEtherClientsContext()

    async function handleCopyToClipboard(text : string) : Promise<void> {
        await ClipboardUtils.copy(text)
        setSnackbarMessage(Date.now() + "::Address copied to Clipboard.")
    }

    async function handleRevokeButtonClick(allowanceId : number, contractAddress : THexAddress, spenderAddress : THexAddress){
        try{
            if(!publicClient || !walletClient) throw new Error("You must connect your wallet to initiate such a transaction.")
            // !!! initiate connection
            modal.setStatus({visibility: true, contentId: 'sending'})
            const receipt =  await erc20TokenService.revokeAllowance({publicClient, walletClient, contractAddress, spenderAddress})
            console.log("revoke")

            if(receipt?.status != 'success') {
                modal.showError("Transaction receipt : The transaction has failed.")
                return
            }
            // !!! show modale success transaction
            // setModalStatus({visibility : true, contentId : 'confirmRevocation'})
            router.put(`/allowance/revoke/${allowanceId}`, {_method: 'put',}, { // put throws this error : The PUT method is not supported for route dashboard. Supported methods: GET, HEAD.
                preserveState: true,
                preserveScroll: true,
                preserveUrl:true,
                onSuccess : () => { 
                    console.log('Revocation successful')
                    // modal.setStatus({visibility: true, contentId: 'confirmRevocation'})
                }, // !!!
                onError: (e : Errors) => {
                    if(e?.error) modal.showError(e.error)
                }, 
            })
            modal.close()
        }catch(e){
            handleSetAllowanceErrors(e)
        }
    }

    function handleEditButtonClick(allowanceId : number){
        router.visit('allowance/edit/' + allowanceId)
        /*console.log("error")
        modal.showError("You must connect your wallet to access your allowances.")*/
    }

    // get allowances from DB
    // check if these allowances exists on the chain

    return(
        <>
        <table className="text-left text-[14px] mt-[15px]">
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
                    <td className='cursor-copy hover:underline' onClick={() => handleCopyToClipboard(allowance.ownerAddress)} title={allowance.ownerAddress}>{AddressUtils.maskAddress(allowance.ownerAddress)}</td>
                    <td className='cursor-copy hover:underline' onClick={() => handleCopyToClipboard(allowance.spenderAddress)} title={allowance.spenderAddress}>{AddressUtils.maskAddress(allowance.spenderAddress)}</td>
                    <td>{allowance.isUnlimited ? 'Unlimited' : allowance.amount == 0n ? "revoked" : NumberUtils.addThousandsSeparators(allowance.amount) /* !!! should be compared with devnet amount*/}</td>
                    <td>{DateUtils.toEUFormat(allowance.updatedAt)}{/* !!! updatedAt but format*/}</td>
                    <td className="flex flex-row gap-x-[10px] justify-center items-center h-[50px] px-[10px]">
                        <button onClick={() => handleEditButtonClick(allowance.id)} className="flex flex-row justify-center items-center w-1/2 h-[38px] gap-x-[8px] font-semibold bg-tablebutton-bg rounded-full border-[2px] text-offblack border-offblack shadow-[0_2px_4px_#A8B0BD40,0_4px_5px_#5D81B960] hover:bg-[#E8EBED] hover:shadow-[0_1px_0_#FFFFFF]">
                            Edit
                        </button>
                        {/* disabled={allowance.amount == 0n && !allowance.isUnlimited} */}<button onClick={() => handleRevokeButtonClick(allowance.id, allowance.tokenContractAddress, allowance.spenderAddress)} className={"flex flex-row justify-center items-center w-1/2 h-[38px] gap-x-[6px] font-semibold rounded-full bg-desat-orange-gradient border-2 border-[#43484c] text-[#ffffff] shadow-[0_2px_4px_#A8B0BD40,0_4px_5px_#5D81B960] textShadow" + (allowance.amount == 0n && !allowance.isUnlimited ? ' opacity-40 cursor-default' : ' hover:shadow-[0_1px_0_#FFFFFF] hover:bg-orange-gradient')}>
                            Revoke
                        </button>
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
        <div className='ml-auto mt-[15px] flex flex-row gap-x-[6px]'>
            <button className='flex text-[14px] justify-center items-center w-[32px] h-[32px] bg-[#ffffff] shadow-[0_1px_2px_#A8B0BD10,0_3px_6px_#5D81B930] rounded-[4px]'>1</button>
            <button className='flex text-[14px] justify-center items-center w-[32px] h-[32px] bg-[#ffffff] shadow-[0_1px_2px_#A8B0BD10,0_3px_6px_#5D81B930] rounded-[4px]'>2</button>
            ...
            <button className='flex text-[14px] justify-center items-center w-[32px] h-[32px] bg-[#ffffff] shadow-[0_1px_2px_#A8B0BD10,0_3px_6px_#5D81B930] rounded-[4px]'>9</button>
            <button className='flex text-[14px] justify-center items-center w-[32px] h-[32px] bg-[#ffffff] shadow-[0_1px_2px_#A8B0BD10,0_3px_6px_#5D81B930] rounded-[4px]'>10</button>
        </div>
        </>
    )
}

interface IProps{
    /*accountAddress: THexAddress
    mockAccountPrivateKey?: string*/
    allowances?: IAllowance[]
    setSnackbarMessage : (value: React.SetStateAction<string | null>) => void
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
    }
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


                /*async function showConfirmationModale(allowanceId : number, contractAddress : THexAddress, spenderAddress : THexAddress){ // should pass edit or create
        // !!! add unlimited alert for user if needed
        modal.showInjectionModal(
            <div className="flex flex-col w-full gap-y-[20px]">
                <div className="flex flex-shrink-0 justify-center items-center self-center w-[52px] h-[52px] bg-[#d0fae7] rounded-full">
                    <div className="flex flex-grow-0 justify-center items-center w-[36px] h-[36px] bg-[#40CBADBB] rounded-full">
                    </div>
                </div>
                <h3 className="w-full text-center font-bold text-[24px]">Confirm the following revocation</h3>
                <p className="flex flex-col w-full text-[14px] italic bg-[#ECEFF1] p-[12px] border-l border-[#303030] border-dashed">Revoking won't</p>
                <div className="flex flex-row gap-x-[10px]">
                    <button className="font-semibold flex-auto h-[44px] w-full border-[3px] border-solid border-offblack rounded-[4px] text-offblack">
                        Cancel
                    </button>
                    <button onClick={() => processConfirmedRevocation(allowanceId, contractAddress, spenderAddress)} className="font-semibold flex-auto h-[44px] w-full bg-gradient-to-r from-[#2A9F8C] to-[#4DB85A] rounded-[4px] text-offwhite shadow-[0_4px_8px_#4DB85A40]">
                        Confirm
                    </button>
                </div>
            </div>
        )
    }*/