import { THexAddress } from "@/types/THexAddress"
import AddressUtils from "@/utils/AddressUtils"
import ClipboardUtils from "@/utils/ClipboardUtils"
import NumberUtils from "@/utils/NumberUtils"

export default function TokenRow({tokenName, tokenSymbol, amount, contractAddress, imgUrl, showSeparator = true} : IProps){

    async function handleCopyToClipboard(text : string) : Promise<void> {
        await ClipboardUtils.copy(text)
    }

    return(
        <div className="w-full flex flex-col">
            <div className="flex flex-row h-[68px] w-full">
                <img src={imgUrl}/>
                <div className="flex flex-col ml-[14px] justify-center">
                    <span className="font-semibold translate-y-[0px] text-[#474b55]">{tokenName}</span>
                    <span onClick={() => handleCopyToClipboard(contractAddress)} title={contractAddress} className="cursor-pointer translate-y-[1px] text-[#92949C]">{AddressUtils.maskAddress(contractAddress as THexAddress)}</span>
                </div>
                <div className="flex flex-col text-right ml-auto justify-center">
                    <span className="font-semibold text-[16px] leading-[22px] font-oswald translate-y-[-2px] text-[#ADB5CEdd]">{tokenSymbol}</span>
                    <span className="translate-y-[2px] text-[#474b55] font-medium">{amount /* !!! NumberUtils.addDecimals(amount)*/}</span>
                </div>
            </div>
            {showSeparator && <div className="h-[1px] w-full border-b-[1px] border-dashed border-[#93A9DF99]"></div>}
        </div>
    )
}

interface IProps{
    tokenName : string
    tokenSymbol : string
    amount : bigint // number
    contractAddress : string
    imgUrl : string
    showSeparator? : boolean
}