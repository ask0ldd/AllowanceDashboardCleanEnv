import { THexAddress } from "@/types/THexAddress"
import AddressUtils from "@/utils/AddressUtils"
import ClipboardUtils from "@/utils/ClipboardUtils"

export default function SpenderRow({spenderName, spenderAddress, imgUrl, showSeparator = true, setSnackbarMessage} : IProps){

    async function handleCopyToClipboard(text : string) : Promise<void> {
        await ClipboardUtils.copy(text)
        setSnackbarMessage(Date.now() + "::Address copied to Clipboard.")
    }

    return(
        <div className="w-full flex flex-col">
            <div className="flex flex-row h-[68px] w-full">
                <img alt="spender icon" src={imgUrl} className="h-[42px] w-[42px] rounded-full self-center opacity-75"/>
                <div className="flex flex-col ml-[14px] justify-center">
                    <span className="font-semibold translate-y-[0px] text-[#474b55]">{spenderName}</span>
                    <span onClick={() => handleCopyToClipboard(spenderAddress)} title={spenderAddress} className="cursor-copy hover:underline hover:bg-[#e8ebed] translate-y-[1px] text-[#92949Cdd]">{AddressUtils.maskAddress(spenderAddress as THexAddress)}</span>
                </div>
                <div className="flex flex-col text-right ml-auto justify-center">
                    <span className="font-semibold text-[16px] leading-[22px] font-oswald translate-y-[-2px] text-[#BCC2C8]">---</span>
                    <span className="translate-y-[2px] text-[#474b55] font-medium">---</span>
                </div>
            </div>
            {showSeparator && <div className="h-[1px] w-full border-b-[1px] border-dashed border-[#BCBEBEDD]"></div>}
        </div>
    )
}

interface IProps{
    spenderName : string
    spenderAddress : THexAddress
    imgUrl : string
    showSeparator? : boolean
    setSnackbarMessage : React.Dispatch<React.SetStateAction<string | null>>
}