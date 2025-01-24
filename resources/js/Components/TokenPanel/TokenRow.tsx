import { THexAddress } from "@/types/THexAddress"
import NumberUtils from "@/utils/NumberUtils"

export default function TokenRow({tokenName, tokenSymbol, amount, contractAddress, imgUrl, showSeparator = true} : IProps){

    function handleAddressClick(e : React.MouseEvent<HTMLSpanElement>){
        e.preventDefault()
    }

    return(
        <div className="w-full flex flex-col">
            <div className="flex flex-row h-[68px] w-full">
                <img src={imgUrl}/>
                <div className="flex flex-col ml-[14px] justify-center">
                    <span className="font-semibold translate-y-[0px] text-[#474b55]">{tokenName}</span>
                    <span onClick={handleAddressClick} className="cursor-pointer translate-y-[1px] text-[#92949C]">{contractAddress}</span>
                </div>
                <div className="flex flex-col text-right ml-auto justify-center">
                    <span className="font-semibold text-[16px] leading-[22px] font-oswald translate-y-[-2px] text-[#ADB5CEdd]">{tokenSymbol}</span>
                    <span className="translate-y-[2px] text-[#474b55] font-medium">{NumberUtils.addDecimals(amount)}</span>
                </div>
            </div>
            {showSeparator && <div className="h-[1px] w-full border-b-[1px] border-dashed border-[#93A9DF99]"></div>}
        </div>
    )
}

interface IProps{
    tokenName : string
    tokenSymbol : string
    amount : number
    contractAddress : string
    imgUrl : string
    showSeparator? : boolean
}