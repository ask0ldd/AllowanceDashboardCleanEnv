import AllowanceService from "@/services/allowanceService";
import trashIcon from '@/assets/icons/trashicon.svg'
import editIcon from '@/assets/icons/editicon.svg'

export default function Table(){

    const allowancesMockArray = Array(10).fill(0)
    const allowanceService = new AllowanceService()

    return(
        <table className="text-left text-[14px] mt-[15px]">
            <thead>
                <tr>
                    <th className="pl-[10px]">ERC20 address</th><th className="w-[150px]">Token</th><th>Owner address</th><th>Spender address</th><th className="w-[150px]">Amount</th><th className="w-[180px]">Date</th><th className="w-[250px] text-center">Actions</th>
                </tr>
            </thead>
            <tbody>
            {allowancesMockArray.map((allowance, index) => (
                <tr key={"tableLine" + index}>
                    <td className="pl-[15px]">0x587...a20cb</td>
                    <td>USDC</td>
                    <td>0x587...a20cb</td>
                    <td>0x587...a20cb</td>
                    <td>127.00</td>
                    <td>12/10/2024</td>
                    <td className="flex flex-row gap-x-[10px] justify-center items-center h-[50px] px-[10px]">
                        <button className="flex flex-row justify-center items-center w-1/2 h-[38px] gap-x-[8px] font-semibold bg-tablebutton-bg rounded-full border-[2px] text-offblack border-offblack shadow-[0_2px_4px_#A8B0BD40,0_4px_5px_#5D81B960] hover:bg-slate-300 hover:shadow-[0_1px_0_#FFFFFF]">
                            {/*<img src={editIcon}/>*/}
                            Update
                        </button>
                        <button onClick={() => allowanceService.revokeAllowance()} className="flex flex-row justify-center items-center w-1/2 h-[38px] gap-x-[6px] font-semibold rounded-full bg-gradient-to-r from-[#6a6e73] to-[#8f969f] border-2 border-[#43484c] text-offwhite shadow-[0_2px_4px_#A8B0BD40,0_4px_5px_#5D81B960] textShadow hover:shadow-[0_1px_0_#FFFFFF]">
                            {/*<img src={trashIcon}/>*/}
                            Revoke
                        </button>
                    </td>
                </tr>
            ))}
            </tbody>

        </table>
    )
}