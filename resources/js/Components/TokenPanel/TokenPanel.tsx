import ERC20TokenService from "@/services/ERC20TokenService"
import TokenRow from "./TokenRow"
import AddressUtils from "@/utils/AddressUtils"
import { THexAddress } from "@/types/THexAddress"
import { useServices } from "@/hooks/useServices"
import { ITokenContract } from "@/types/ITokenContract"

function TokenPanel({tokenList} : {tokenList : ITokenContract}){

    const { erc20TokenService } = useServices()

    return( // gap-y-[10px] 
        <aside className="w-full max-w-[320px] flex flex-col bg-component-white rounded-3xl overflow-hidden p-[30px] pt-[35px] border border-solid border-dashcomponent-border shadow-component-grey">
            <h2 className='mx-auto mb-[15px] w-full text-[36px] leading-[34px] font-bold font-oswald' style={{color:'#474B55'}}>OWNED</h2>

            {erc20TokenService.getKnownDeployedTokens().slice(0, 9).map((token, id) => (
                <TokenRow key={'tokenRow' + id} tokenName={token.name} tokenSymbol={token.symbol} amount={10000} contractAddress={AddressUtils.maskAddress(token.contractAddress as THexAddress) ?? ''} imgUrl={`/coins/coin${id}.svg`} />
            ))}
            
            {/*<div className="flex flex-row h-[48px] w-full">
                <img src={'/coins/coin.svg'}/>
                <div className="flex flex-col ml-[16px] justify-center">
                    <span className="font-bold translate-y-[0px]">Token</span>
                    <span className="text-[14px] translate-y-[1px]">0x...ffca1</span>
                </div>
                <div className="flex flex-col text-right ml-auto justify-center">
                    <span className="font-bold text-[16px] leading-[22px] font-oswald translate-y-[-2px]">MTK</span>
                    <span className="text-[14px] translate-y-[2px]">1000</span>
                </div>
            </div>
            <div className="h-[1px] w-full border-b-[1px] border-dashed border-[#93A9DF]"></div>

            <div className="flex flex-row h-[48px] w-full">
                <img src={'/coins/coin1.svg'}/>
                <div className="flex flex-col ml-[16px] justify-center">
                    <span className="font-bold translate-y-[0px]">Token</span>
                    <span className="text-[14px] translate-y-[1px]">0x...ffca1</span>
                </div>
                <div className="flex flex-col text-right ml-auto justify-center">
                    <span className="font-bold text-[16px] leading-[22px] font-oswald translate-y-[-2px]">MTK</span>
                    <span className="text-[14px] translate-y-[2px]">1000</span>
                </div>
            </div>
            <div className="h-[1px] w-full border-b-[1px] border-dashed border-[#93A9DF]"></div>

            <div className="flex flex-row h-[48px] w-full">
                <img src={'/coins/coin2.svg'}/>
                <div className="flex flex-col ml-[16px] justify-center">
                    <span className="font-bold translate-y-[0px]">Token</span>
                    <span className=" translate-y-[1px]">0x...ffca1</span>
                </div>
                <div className="flex flex-col text-right ml-auto justify-center">
                    <span className="font-bold text-[16px] leading-[22px] font-oswald translate-y-[-2px]">MTK</span>
                    <span className=" translate-y-[2px]">1000</span>
                </div>
            </div>
            <div className="h-[1px] w-full border-b-[1px] border-dashed border-[#93A9DF]"></div>

            <div className="flex flex-row h-[48px] w-full">
                <img src={'/coins/coin3.svg'}/>
                <div className="flex flex-col ml-[16px] justify-center">
                    <span className="font-bold translate-y-[1px]">Token</span>
                    <span className=" translate-y-[1px]">0x...ffca1</span>
                </div>
                <div className="flex flex-col text-right ml-auto justify-center">
                    <span className="font-bold text-[16px] leading-[22px] font-oswald translate-y-[-1px]">MTK</span>
                    <span className=" translate-y-[2px]">1000</span>
                </div>
            </div>
            <div className="h-[1px] w-full border-b-[1px] border-dashed border-[#93A9DF]"></div>*/}

        </aside>
    )
}

export default TokenPanel