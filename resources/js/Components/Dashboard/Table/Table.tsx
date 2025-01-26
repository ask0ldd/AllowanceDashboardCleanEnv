// import trashIcon from '@/assets/icons/trashicon.svg'
// import editIcon from '@/assets/icons/editicon.svg'
import { useServices } from '@/hooks/useServices'
import { IAllowance } from '@/types/IAllowance'
import { THexAddress } from '@/types/THexAddress'
import AddressUtils from '@/utils/AddressUtils'
import ClipboardUtils from '@/utils/ClipboardUtils'
import { router } from '@inertiajs/react'

export default function Table({allowances} : {allowances : IAllowance[]}){

    const allowancesMockArray = Array(10).fill(0)

    const { erc20TokenService } = useServices()

    async function handleCopyToClipboard(text : string) : Promise<void> {
        await ClipboardUtils.copy(text)
        // !!! add snackbar : copied to clipboard
    }

    async function handleRevokeButtonClick(allowanceId : number, contractAddress : THexAddress, spenderAddress : THexAddress){
        // !!! show modale
        // erc20TokenService.revokeAllowance({contractAddress, spenderAddress})
        // router.delete(route('deleteallowance', allowanceId), { only: ['allowances'] })
        // !!! should be update to 0 instead
        router.put(`/allowance/revoke/${allowanceId}`, {_method: 'put',}, { // put throws this error : The PUT method is not supported for route dashboard. Supported methods: GET, HEAD.
            preserveState: true,
            preserveScroll: true,
            preserveUrl:true,
            only: ['success', 'allowances'],
            /*onSuccess: () => {
                router.visit(route('dashboard'))
            }*/
        })
        // router.visit(route('dashboard'))
    }

    // get allowances from DB
    // check if these allowances exists into the chain

    return(
        <>
        <table className="text-left text-[14px] mt-[15px]">
            <thead>
                <tr>
                    <th className="w-[80px]"></th><th className="w-[140px]">Token name</th><th className="w-[150px]">Token address</th><th className="w-[100px]">Symbol</th><th className="w-[150px]">Owner address</th><th className="w-[150px]">Spender address</th><th className="w-[150px]">Amount</th><th className="w-[110px]">Update</th><th className="w-[250px] text-center">Actions</th>
                </tr>
            </thead>
            <tbody>
            {allowances.map((allowance, index) => (
                <tr key={"tableLine" + index}>
                    <td><img className='w-[32px] mx-auto' src={`/coins/${allowance.tokenContractSymbol}.svg`}/></td>
                    <td>{allowance.tokenContractName}</td>
                    <td className='cursor-pointer' onClick={() => handleCopyToClipboard(allowance.tokenContractAddress)} title={allowance.tokenContractAddress}>{AddressUtils.maskAddress(allowance.tokenContractAddress)}</td>
                    <td>{allowance.tokenContractSymbol}</td>
                    <td className='cursor-pointer' onClick={() => handleCopyToClipboard(allowance.ownerAddress)} title={allowance.ownerAddress}>{AddressUtils.maskAddress(allowance.ownerAddress)}</td>
                    <td className='cursor-pointer' onClick={() => handleCopyToClipboard(allowance.spenderAddress)} title={allowance.spenderAddress}>{AddressUtils.maskAddress(allowance.spenderAddress)}</td>
                    <td>{allowance.amount}</td>
                    <td>12/10/2024{/* !!! updatedAt but format*/}</td>
                    <td className="flex flex-row gap-x-[10px] justify-center items-center h-[50px] px-[10px]">
                        <button onClick={() => router.visit('allowance/edit/'+allowance.id)} className="flex flex-row justify-center items-center w-1/2 h-[38px] gap-x-[8px] font-semibold bg-tablebutton-bg rounded-full border-[2px] text-offblack border-offblack shadow-[0_2px_4px_#A8B0BD40,0_4px_5px_#5D81B960] hover:bg-slate-300 hover:shadow-[0_1px_0_#FFFFFF]">
                            {/*<img src={editIcon}/>*/}
                            Edit
                        </button>
                        <button onClick={() => handleRevokeButtonClick(allowance.id, allowance.tokenContractAddress, allowance.spenderAddress)} className="flex flex-row justify-center items-center w-1/2 h-[38px] gap-x-[6px] font-semibold rounded-full bg-gradient-to-r from-[#6a6e73] to-[#8f969f] border-2 border-[#43484c] text-offwhite shadow-[0_2px_4px_#A8B0BD40,0_4px_5px_#5D81B960] textShadow hover:shadow-[0_1px_0_#FFFFFF]">
                            {/*<img src={trashIcon}/>*/}
                            Revoke
                        </button>
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
        <div className='ml-auto mt-[15px]'><button>1</button><button>2</button>...<button>9</button><button>10</button></div>
        </>
    )
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