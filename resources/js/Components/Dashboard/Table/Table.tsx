import { useServices } from '@/hooks/useServices'
import { IAllowance } from '@/types/IAllowance'
import { THexAddress } from '@/types/THexAddress'
import AddressUtils from '@/utils/AddressUtils'
import ClipboardUtils from '@/utils/ClipboardUtils'
import { router, useForm } from '@inertiajs/react'
import useErrorHandler from '@/hooks/useErrorHandler'
import { Errors } from '@inertiajs/core/types/types'
import NumberUtils from '@/utils/NumberUtils'
import DateUtils from '@/utils/DateUtils'
import { useEtherClientsContext } from '@/hooks/useEtherClientsContext'
import { EthereumClientNotFoundError } from '@/errors/EthereumClientNotFoundError'
import IModalProps from '@/types/IModalProps'
import IFormAllowance from '@/types/IFormAllowance'

export default function Table({allowances, setSnackbarMessage, modal} : IProps){

    const { erc20TokenService } = useServices()

    const {handleSetAllowanceErrors} = useErrorHandler(modal.showError)

    const { publicClient, walletClient } = useEtherClientsContext()

    async function handleCopyToClipboard(text : string) : Promise<void> {
        await ClipboardUtils.copy(text)
        setSnackbarMessage(Date.now() + "::Address copied to Clipboard.")
    }

    const { data, put, transform } = useForm<IFormAllowance & {[key: string]: string | boolean}>({
            ERC20TokenAddress: '',
            ownerAddress: walletClient?.account?.address ?? '',
            spenderAddress: '',
            spenderName : '',
            amount : "0n",
            isUnlimited : false,
            transactionHash : '',
    })

    async function handleRevokeButtonClick(allowanceId : number, contractAddress : THexAddress, spenderAddress : THexAddress){
        try{
            if(!publicClient || !walletClient || !walletClient.account) throw new EthereumClientNotFoundError()
            // !!! initiate connection
            modal.setStatus({visibility: true, contentId: 'waitingConfirmation'})
            const hash =  await erc20TokenService.revokeAllowance({walletClient, contractAddress, spenderAddress})

            const walletAddress = walletClient.account.address

            // transform : Ensures that the state transformation is fully resolved before proceeding with POST or PUT requests
            transform((data) => ({
                ...data,
                ERC20TokenAddress: contractAddress.toLowerCase(),
                ownerAddress: walletAddress.toLowerCase(),
                spenderAddress: spenderAddress.toLowerCase(),
                spenderName : '',
                amount : 0, // !!!
                isUnlimited : false,
                transactionHash: hash,
            }))

            console.log(JSON.stringify(data))

            put('/allowance/queue/' + allowanceId /*route().params.id*/, {
                preserveScroll: true,
                onSuccess: () => {
                    setSnackbarMessage(Date.now() + "::Transaction sent. Hash : " + hash)
                },
                onError: (e : Errors) => {
                    if(e?.error) modal.showError(e.error)
                }, 
            })

            // !!! show modale success transaction // should pass isUnlimited, showRevoked, etc...
            /*data: {
                    showRevoked,
                    searchValue,
                    showUnlimitedOnly: newUnlimited
                }*/
            modal.close()
        }catch(e){
            handleSetAllowanceErrors(e)
        }
    }

    function handleEditButtonClick(allowanceId : number){
        router.visit('allowance/edit/' + allowanceId)
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
                    <td onClick={() => handleCopyToClipboard(allowance.tokenContractAddress)} title={allowance.tokenContractAddress}><span className='hover:bg-[hsl(204,12%,85%)] cursor-copy'>{AddressUtils.maskAddress(allowance.tokenContractAddress)}</span></td>
                    <td>{allowance.tokenContractSymbol}</td>
                    <td onClick={() => handleCopyToClipboard(allowance.ownerAddress)} title={allowance.ownerAddress}><span className='hover:bg-[hsl(204,12%,85%)] cursor-copy'>{AddressUtils.maskAddress(allowance.ownerAddress)}</span></td>
                    <td onClick={() => handleCopyToClipboard(allowance.spenderAddress)} title={allowance.spenderAddress}><span className='hover:bg-[hsl(204,12%,85%)] cursor-copy'>{AddressUtils.maskAddress(allowance.spenderAddress)}</span></td>
                    <td className={allowance.amount == 0n && allowance.isUnlimited ? 'text-[#D86055]' : ''}>
                        <div className='flex gap-x-[12px]'>
                            <span className='flex items-center'>{allowance.isUnlimited ? 'Unlimited' : allowance.amount == 0n ? "Revoked" : NumberUtils.addThousandsSeparators(allowance.amount) /* !!! should be compared with devnet amount*/}</span>
                            {allowance.pending ? <div title="being processed" className='items-center justify-center' role="status">
                                                    <svg aria-hidden="true" className="w-6 h-6 text-gray-200 animate-spin dark:text-gray-600 fill-[#30DFAB]" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                                                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                                                    </svg>
                                                    <span className="sr-only">Pending...</span>
                                                </div> : ''}
                        </div>
                    </td>
                    <td>{DateUtils.toEUFormat(allowance.updatedAt)}{/* !!! updatedAt but format*/}</td>
                    <td className="flex flex-row gap-x-[10px] justify-center items-center h-[50px] px-[10px]">
                        <button onClick={() => handleEditButtonClick(allowance.id)} className="flex flex-row justify-center items-center w-1/2 h-[38px] gap-x-[8px] font-semibold bg-tablebutton-bg rounded-full border-[2px] border-offblack text-offblack shadow-[0_2px_4px_#A8B0BD40,0_4px_5px_#5D81B960] hover:bg-[#E8EBED] hover:shadow-[0_1px_0_#FFFFFF]">
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
            <button title="inactive yet" className='flex text-[14px] justify-center items-center w-[56px] h-[32px] bg-[#ffffff] shadow-[0_1px_2px_#A8B0BD10,0_3px_6px_#5D81B930] rounded-[4px] hover:bg-orange-gradient hover:text-offwhite hover:font-semibold hover:shadow-[0_4px_8px_#F7644140]'>Prev</button>
            <button title="inactive yet" className='flex text-[14px] justify-center items-center w-[32px] h-[32px] bg-[#ffffff] shadow-[0_1px_2px_#A8B0BD10,0_3px_6px_#5D81B930] rounded-[4px] hover:bg-orange-gradient hover:text-offwhite hover:font-semibold hover:shadow-[0_4px_8px_#F7644140]'>1</button>
            <button title="inactive yet" className='flex text-[14px] justify-center items-center w-[32px] h-[32px] bg-[#ffffff] shadow-[0_1px_2px_#A8B0BD10,0_3px_6px_#5D81B930] rounded-[4px] hover:bg-orange-gradient hover:text-offwhite hover:font-semibold hover:shadow-[0_4px_8px_#F7644140]'>2</button>
            <button title="inactive yet" className='flex text-[14px] justify-center items-center w-[32px] h-[32px] bg-[#ffffff] shadow-[0_1px_2px_#A8B0BD10,0_3px_6px_#5D81B930] rounded-[4px] hover:bg-orange-gradient hover:text-offwhite hover:font-semibold hover:shadow-[0_4px_8px_#F7644140]'>3</button>
            <button title="inactive yet" className='flex text-[14px] justify-center items-center w-[56px] h-[32px] bg-[#ffffff] shadow-[0_1px_2px_#A8B0BD10,0_3px_6px_#5D81B930] rounded-[4px] hover:bg-orange-gradient hover:text-offwhite hover:font-semibold hover:shadow-[0_4px_8px_#F7644140]'>Next</button>
        </div>
        {/*allowances && <Pagination allowances={allowances}/>*/}
        </>
    )
}

interface IProps{
    /*accountAddress: THexAddress
    mockAccountPrivateKey?: string*/
    allowances?: IAllowance[]
    // allowances ?: IPaginatedResponse<IAllowance>
    setSnackbarMessage : (value: React.SetStateAction<string | null>) => void
    modal : IModalProps
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