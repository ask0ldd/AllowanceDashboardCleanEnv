import ERC20TokenService from "@/services/ERC20TokenService"
import TokenRow from "./TokenRow"
import AddressUtils from "@/utils/AddressUtils"
import { THexAddress } from "@/types/THexAddress"
import { useServices } from "@/hooks/useServices"
import { ITokenContract } from "@/types/ITokenContract"
import { useEffect, useState } from "react"

function TokenPanel({ownedTokens} : {ownedTokens : ITokenContract[]}){

    const { erc20TokenService } = useServices()

    const ownerAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" // !!! get rid

    const [balances, setBalances] = useState<Record<THexAddress, bigint> | null>(null)

    async function getTokenBalances(tokenList : ITokenContract[]){
        const tokenAddress = tokenList.map(token => (token.address as THexAddress))
        const balances = await erc20TokenService.getAllBalances(tokenAddress, ownerAddress)
        setBalances(balances)
    }

    useEffect(() => {
        getTokenBalances(ownedTokens)
    }, [])

    return( // gap-y-[10px] 
        <aside className="w-full max-w-[320px] flex flex-col bg-component-white rounded-3xl overflow-hidden p-[30px] pt-[35px] border border-solid border-dashcomponent-border">
            <h2 className='mx-auto mb-[15px] w-full text-[36px] leading-[34px] font-bold font-oswald' style={{color:'#474B55'}}>OWNED</h2>

            {ownedTokens.slice(0, 9).map((token, id) => (
                <TokenRow key={'tokenRow' + id} tokenName={token.name} tokenSymbol={token.symbol} amount={balances && balances[token.address] ? balances[token.address] : 0n} contractAddress={token.address ?? ''} imgUrl={`/coins/${token.symbol}.svg`} />
            ))}
        </aside>
    )
}

export default TokenPanel