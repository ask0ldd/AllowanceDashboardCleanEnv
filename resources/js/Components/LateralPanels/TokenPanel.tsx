import TokenRow from "./TokenRow"
import { THexAddress } from "@/types/THexAddress"
import { useServices } from "@/hooks/useServices"
import { ITokenContract } from "@/types/ITokenContract"
import { useEffect, useState } from "react"
import { useEtherClientsContext } from "@/hooks/useEtherClientsContext"

function TokenPanel({ownedTokens, setSnackbarMessage} : { ownedTokens : ITokenContract[], setSnackbarMessage : React.Dispatch<React.SetStateAction<string | null>>}){

    const { erc20TokenService } = useServices()
    const { publicClient, walletClient } = useEtherClientsContext()

    const [balances, setBalances] = useState<Record<THexAddress, bigint> | null>(null)

    useEffect(() => {
        async function getTokenBalances(tokenList : ITokenContract[]){ // try catch : not needed
            if(!walletClient) return
            const tokenAddress = tokenList.map(token => (token.address as THexAddress))
            if(publicClient && walletClient.account?.address) {
                const balances = await erc20TokenService.getAllBalances(publicClient, tokenAddress, walletClient.account.address)
                setBalances(balances)
            }
        }
        
        if(walletClient?.account?.address) {
            getTokenBalances(ownedTokens)
        }else{
            setBalances(null)
        }
    }, [walletClient])

    return(
        <aside className="w-full max-w-[320px] h-fit flex flex-col bg-component-white rounded-3xl overflow-hidden p-[30px] border border-solid border-dashcomponent-border">
            <h2 className='mx-auto mb-[18px] w-full text-[36px] leading-[34px] font-bold font-oswald' style={{color:'#474B55'}}>OWNED</h2>

            {ownedTokens.slice(0, 9).map((token, id) => (
                <TokenRow setSnackbarMessage={setSnackbarMessage} key={'tokenRow' + id} tokenName={token.name} tokenSymbol={token.symbol} amount={balances && typeof balances[token.address] == "bigint" ? balances[token.address] : 'n/a'} contractAddress={token.address ?? ''} imgUrl={`/coins/${token.symbol}.svg`} />
            ))}
        </aside>
    )
}

export default TokenPanel