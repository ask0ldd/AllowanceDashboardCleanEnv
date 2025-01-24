// import trashIcon from '@/assets/icons/trashicon.svg'
// import editIcon from '@/assets/icons/editicon.svg'
import { useServices } from '@/hooks/useServices'
import { THexAddress } from '@/types/THexAddress'
import { router } from '@inertiajs/react'

export default function Table(){

    const allowancesMockArray = Array(10).fill(0)

    const { erc20TokenService } = useServices()

    function handleRevokeButtonClick(contractAddress : THexAddress, spenderAddress : THexAddress){
        erc20TokenService.revokeAllowance({contractAddress, spenderAddress})
    }

    /* get rid of */
    const dummyContractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
    const dummyOwnerAddress = '0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097'
    const dummySpenderAddress =  '0x14dC79964da2C08b23698B3D3cc7Ca32193d9955'
    const dummyContractOwnerAddress = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'

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
            {allowancesMockArray.map((allowance, index) => (
                <tr key={"tableLine" + index}>
                    <td><img className='w-[32px] mx-auto' src={`/coins/coin${index % 9}.svg`}/></td>
                    <td>CrystalDrive</td>
                    <td>0x587...a20cb</td>
                    <td>CRD</td>
                    <td>0x587...a20cb</td>
                    <td>0x587...a20cb</td>
                    <td>12700.00</td>
                    <td>12/10/2024</td>
                    <td className="flex flex-row gap-x-[10px] justify-center items-center h-[50px] px-[10px]">
                        <button onClick={() => router.visit('editallowance/'+index)} className="flex flex-row justify-center items-center w-1/2 h-[38px] gap-x-[8px] font-semibold bg-tablebutton-bg rounded-full border-[2px] text-offblack border-offblack shadow-[0_2px_4px_#A8B0BD40,0_4px_5px_#5D81B960] hover:bg-slate-300 hover:shadow-[0_1px_0_#FFFFFF]">
                            {/*<img src={editIcon}/>*/}
                            Update
                        </button>
                        <button onClick={() => handleRevokeButtonClick(dummyContractAddress, dummySpenderAddress)} className="flex flex-row justify-center items-center w-1/2 h-[38px] gap-x-[6px] font-semibold rounded-full bg-gradient-to-r from-[#6a6e73] to-[#8f969f] border-2 border-[#43484c] text-offwhite shadow-[0_2px_4px_#A8B0BD40,0_4px_5px_#5D81B960] textShadow hover:shadow-[0_1px_0_#FFFFFF]">
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