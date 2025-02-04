import { useServices } from "@/hooks/useServices"

export default function BlankTable(){

    const blankAllowances = new Array(10).fill(0)

    const { erc20TokenService } = useServices()
    const symbolsList = erc20TokenService.getSymbols()

    return(
        <>
        <table className="text-left text-[14px] mt-[15px]">
            <thead>
                <tr>
                    <th className="w-[80px]"></th><th className="w-[140px]">Token name</th><th className="w-[150px]">Token address</th><th className="w-[100px]">Symbol</th><th className="w-[150px]">Owner address</th><th className="w-[150px]">Spender address</th><th className="w-[150px]">Amount</th><th className="w-[110px]">Update</th><th className="w-[250px] text-center">Actions</th>
                </tr>
            </thead>
            <tbody>
            {blankAllowances.map((_, index) => (
                <tr key={"tableLine" + index}>
                    <td><img className='w-[32px] mx-auto' src={`/coins/${symbolsList[index] ?? 'SFL'}.svg`}/></td>
                    <td>- - -</td>
                    <td>- - -</td>
                    <td>- - -</td>
                    <td>- - -</td>
                    <td>- - -</td>
                    <td>- - -</td>
                    <td>- - -</td>
                    <td className="flex flex-row gap-x-[10px] justify-center items-center h-[50px] px-[10px]">
                        <button disabled className="flex flex-row justify-center items-center w-1/2 h-[38px] gap-x-[8px] font-semibold bg-tablebutton-bg rounded-full border-[2px] text-offblack border-offblack shadow-[0_2px_4px_#A8B0BD40,0_4px_5px_#5D81B960] opacity-40 cursor-default">
                            Edit
                        </button>
                        <button disabled className="flex flex-row justify-center items-center w-1/2 h-[38px] gap-x-[6px] font-semibold rounded-full bg-desat-orange-gradient border-2 border-[#43484c] text-[#ffffff] shadow-[0_2px_4px_#A8B0BD40,0_4px_5px_#5D81B960] textShadow opacity-40 cursor-default">
                            Revoke
                        </button>
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
        <div className='ml-auto mt-[15px] flex flex-row gap-x-[8px]'>
            <button disabled className='flex text-[14px] justify-center items-center w-[32px] h-[32px] bg-[#ffffff] shadow-[0_1px_2px_#A8B0BD10,0_3px_6px_#5D81B930] rounded-[4px]'>1</button>
            <button disabled className='flex text-[14px] justify-center items-center w-[32px] h-[32px] bg-[#ffffff] shadow-[0_1px_2px_#A8B0BD10,0_3px_6px_#5D81B930] rounded-[4px]'>2</button>
            ...
            <button disabled className='flex text-[14px] justify-center items-center w-[32px] h-[32px] bg-[#ffffff] shadow-[0_1px_2px_#A8B0BD10,0_3px_6px_#5D81B930] rounded-[4px]'>9</button>
            <button disabled className='flex text-[14px] justify-center items-center w-[32px] h-[32px] bg-[#ffffff] shadow-[0_1px_2px_#A8B0BD10,0_3px_6px_#5D81B930] rounded-[4px]'>10</button>
        </div>
        </>
    )
}