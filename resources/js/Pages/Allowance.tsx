import TokenPanel from "@/Components/LateralPanels/TokenPanel";
import { useServices } from "@/hooks/useServices";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { IAllowance } from "@/types/IAllowance";
import { ITokenContract } from "@/types/ITokenContract";
import { THexAddress } from "@/types/THexAddress";
import { isHexAddress } from "@/types/typeguards";
import AddressUtils from "@/utils/AddressUtils";
import NumberUtils from "@/utils/NumberUtils";
import { router, useForm, usePage } from "@inertiajs/react";
import { FormEvent, useEffect, useRef, useState } from "react";
import type { Errors, PageProps } from "@inertiajs/core";
import SpenderPanel from "@/Components/LateralPanels/SpenderPanel";
import useModalManager from "@/hooks/useModalManager";
import useErrorHandler from "@/hooks/useErrorHandler";
import { useEtherClientsContext } from "@/hooks/useEtherClientsContext";
import { EthereumClientNotFoundError } from "@/errors/EthereumClientNotFoundError";
import useSnackbar from "@/hooks/useSnackbar";

export default function Allowance() {

    const { flash, success, errors: errorsProp, existingAllowance, ownedTokens } = usePage<IPageProps>().props

    const [symbol, setSymbol] = useState<string | null>(null)

    const modal = useModalManager({initialVisibility : false, initialModalContentId : "error"})
    const { snackbarMessage, setSnackbarMessage } = useSnackbar()
    // centralizing viem errors management
    const { handleSetAllowanceErrors } = useErrorHandler(modal.showError)
    const { publicClient, walletClient } = useEtherClientsContext()

    const mode = useRef<string>(existingAllowance ? 'edit' : 'new')

    const { metamaskService, erc20TokenService, localStorageService } = useServices()

    const { data, setData, post, put, processing, errors, setError, clearErrors, transform } = useForm<IFormAllowance & {[key: string]: string | boolean}>({
        ERC20TokenAddress: existingAllowance?.tokenContractAddress ?? '',
        ownerAddress: existingAllowance?.ownerAddress ?? walletClient?.account?.address/*localStorageService.retrieveWalletAddress()*/ ?? '',
        spenderAddress: existingAllowance?.spenderAddress ?? '',
        spenderName : existingAllowance?.spenderName ?? '',
        amount : `${existingAllowance?.amount ?? 0n}`,
        isUnlimited : existingAllowance?.isUnlimited ?? false,
        transactionHash : '',
    })

    useEffect(() => {
        if(walletClient?.account?.address && isHexAddress(walletClient?.account?.address)) setData(form  => ({...form, ['ownerAddress'] : walletClient?.account?.address as THexAddress}))
    }, [walletClient?.account?.address])

    useEffect(() => {
        if(flash?.error) modal.showError(flash.error)
    }, [flash.error])

    // !!! should check if account address = metamask account address
    // if not, send new address
    // if disconnected flush session address

    // !!! should not be able to send an allowance if not connected
    async function handleSubmitAllowanceForm(e : React.MouseEvent<HTMLButtonElement>) : Promise<void> {
        e.preventDefault()
        clearErrors()
        if(!await isAllowanceFormValid()) return // no error modal shown before returning since all non thrown errors are displayed within the form itself
        await processAllowance()
    }

    async function processAllowance(){
        modal.setStatus({visibility: true, contentId: 'waitingConfirmation'})
        // !!! backend side : should check if trio not already existing
        try{
            if(!publicClient || !walletClient) throw new EthereumClientNotFoundError()
            const hash = !data.isUnlimited ? // error will be catched
                await erc20TokenService.setAllowance({walletClient, contractAddress : data.ERC20TokenAddress as THexAddress, spenderAddress : data.spenderAddress as THexAddress, amount : BigInt(data.amount)}) :
                    await erc20TokenService.setAllowanceToUnlimited({walletClient, contractAddress : data.ERC20TokenAddress as THexAddress, spenderAddress : data.spenderAddress as THexAddress})

            // transform : wait for the update to be resolved when setData is async
            transform((data) => ({
                ...data,
                transactionHash: hash, // receipt.transactionHash,
            }))

            if(mode.current == 'new'){
                post('/allowance', {
                    preserveScroll: true,
                    onSuccess: () => {
                        setSnackbarMessage(Date.now() + "::Transaction sent. Hash : " + hash)
                    }, // !!! show success transaction send snackbar ?
                    onError: (e : Errors) => {
                        if(e?.error) modal.showError(e.error)
                }, 
                })
            }else{
                put('/allowance/' + route().params.id, {
                    preserveScroll: true,
                    onSuccess: () => {
                        setSnackbarMessage(Date.now() + "::Transaction sent. Hash : " + hash)
                    }, // !!! show success transaction send snackbar ?
                    onError: (e : Errors) => {
                        if(e?.error) modal.showError(e.error)
                    }, 
                })
            }
        }catch(e){
            handleSetAllowanceErrors(e)
        }
    }

    async function isAllowanceFormValid(){
        // !!!! can't check if address exists through viem since balances may be 0 so only check contract address supply
        // !!!! check contract supply / check invalid contract
        let errors = validateHexAddresses()

        // amount must be number when unlimited is off
        if (!data.isUnlimited && !validateAmount()) errors++

        // !! should tell if amount > balance ?

        if(data.ERC20TokenAddress == data.spenderAddress) {
            setError("spenderAddress", "Spender and Token addresses must be distinct.")
            errors++
        }
        if(data.ERC20TokenAddress == data.ownerAddress) {
            setError("ownerAddress", "Owner and Token addresses must be distinct.")
            errors++
        }

        if(errors > 0) return false

       return true
    }

    function validateHexAddresses() {
        let errorCount = 0;
        const addressFields = [
            { field: 'ERC20TokenAddress', label: 'ERC20 Token Address' },
            { field: 'spenderAddress', label: 'Spender Address' },
            { field: 'ownerAddress', label: 'Owner Address' }
        ];
    
        addressFields.forEach(({ field, label }) => {
            if(!isHexAddress(data[field]) || data[field].length != 42) {
                setError(field, `Invalid ${label}.`)
                errorCount++
            }
        })
    
        return errorCount
    }

    function validateAmount(): boolean {
        if (!NumberUtils.isNumber(data.amount)) {
            setError('amount', 'Invalid Amount.')
            return false
        }
        return true
    }

    const textinputClasses = "px-[10px] mt-[6px] fill-w h-[44px] rounded-[4px] bg-[#FDFDFE] outline-1 outline outline-[#E1E3E6] focus:outline-1 focus:outline-[#F86F4D]"
    const labelClasses = "mt-[25px] font-medium text-[#474B55]"

    const inputsPropsMap : Record<string, string> = {
        'amountInput' : 'amount', 
        'contractInput' : 'ERC20TokenAddress',
        'ownerInput' : 'ownerAddress',
        'spenderInput' : 'spenderAddress',
        'spenderNameInput' : 'spenderName',
    }

    function handleSetInput(e: FormEvent<HTMLInputElement>): void {
        e.preventDefault()
        const input = (e.target as HTMLInputElement)
        if(input.id == "amountInput" && !NumberUtils.isNumber(input.value[input.value.length-1])) return
        setData(form  => ({...form, [inputsPropsMap[input.id]] : input.value}))
    }

    async function handleContractAddressBlur(e: FormEvent<HTMLInputElement>){
        const address = (e.target as HTMLInputElement).value as string;
        if(!AddressUtils.isValidAddress(address)) return setSymbol(null)
        router.get('/token/symbol', { address }, {
            preserveState: true,
            preserveScroll: true,
            preserveUrl: true,
            only: ['symbol'],
            onSuccess : (page) => {
                setSymbol(page.props.symbol ? page.props.symbol as string : null)
            },
        })
    }

    // !!! modal with token name, symbol
    // !!! modal contract doesn't not exist
    return(
        <DashboardLayout modal={modal}>
            <TokenPanel accountAddress={localStorageService.retrieveWalletAddress() ? localStorageService.retrieveWalletAddress() : undefined} ownedTokens={ownedTokens} setSnackbarMessage={setSnackbarMessage}/>
            <div id="allowanceFormContainer" className='flex grow shrink flex-col bg-component-white rounded-3xl overflow-hidden p-[40px] pt-[30px] border border-solid border-dashcomponent-border'>
                <h1 className='mx-auto max-w-[580px] w-full text-[36px] leading-[34px] font-bold font-oswald' style={{color:'#474B55'}}>{!existingAllowance ? 'SET A NEW' : 'EDIT AN'} ALLOWANCE</h1>
                <p className="border-l border-[#303030] border-dashed bg-[#ECEFF1] p-3 italic mx-auto max-w-[580px] w-full mt-8 leading-snug text-[14px]">By setting this allowance, you will authorize a specific address (spender) to withdraw a fixed number of tokens from the selected ERC20 token contract. Exercise extreme caution and only grant allowances to entities you fully trust. Unlimited allowances should be avoided.</p>
                <form className="mx-auto flex flex-col max-w-[580px] w-full">
                    
                    <div className="flex flex-row justify-between gap-x-[15px]"><label id="contractAddressLabel" className={labelClasses}>Token Contract Address</label><span className="text-[#EC3453] mt-auto mr-[54px]">{errors['ERC20TokenAddress']}</span></div>
                    <div className="w-full flex flex-row gap-x-[10px] mt-[6px]">
                        <input aria-labelledby="contractAddressLabel" readOnly={mode.current == "edit"} onFocus={() => clearErrors('ERC20TokenAddress')} onBlur={handleContractAddressBlur} style={{marginTop:0}} id="contractInput" placeholder="0x20c...a20cb" type="text" value={data.ERC20TokenAddress} className={textinputClasses + ' flex-grow' + (errors['ERC20TokenAddress'] ? ' border-l-[6px] border-solid border-[#EC3453] pl-[12px]' : '')} onInput={(e) => handleSetInput(e)}/>
                        <div className="w-[44px] h-[44px] rounded-[4px] bg-[#ffffff] flex-shrink-0 flex justify-center items-center outline-1 outline outline-[#E1E3E6]">{(existingAllowance?.tokenContractSymbol || symbol) && <img src={symbol ? `/coins/${symbol}.svg` : `/coins/${existingAllowance?.tokenContractSymbol}.svg`} className="w-[34px]"/>}</div>
                    </div>
                    
                    <div className="flex flex-row justify-between gap-x-[15px]"><label id="ownerAddressLabel" className={labelClasses}>Owner Address</label><span className="text-[#EC3453] mt-auto">{errors['ownerAddress']}</span></div>
                    <input readOnly={mode.current == "edit"} aria-labelledby="ownerAddressLabel" onFocus={() => clearErrors('ownerAddress')} id="ownerInput" placeholder="0x20c...a20cb" type="text" value={data.ownerAddress} className={textinputClasses + (errors['ownerAddress'] ? ' border-l-[6px] border-solid border-[#EC3453] pl-[12px]' : '')} onInput={(e) => handleSetInput(e)}/>
                    
                    <div className="flex flex-row justify-between"><label id="spenderAddressLabel" className={labelClasses}>Spender Address</label><span className="text-[#EC3453] mt-auto">{errors['spenderAddress']}</span></div>
                    <input readOnly={mode.current == "edit"} aria-labelledby="spenderAddressLabel" onFocus={() => clearErrors('spenderAddress')} id="spenderInput" placeholder="0x20c...a20cb" type="text" value={data.spenderAddress} className={textinputClasses + (errors['spenderAddress'] ? ' border-l-[6px] border-solid border-[#EC3453] pl-[12px]' : '')} onInput={(e) => handleSetInput(e)}/>
                    
                    <label id="spenderNameLabel" className={labelClasses}>Spender Name (optional)</label>
                    <input id="spenderNameInput" aria-labelledby="spenderNameLabel" placeholder="Ex : PancakeSwap, Axie Infinity, Magic Eden, ..." type="text" value={data.spenderName} className={textinputClasses} onInput={(e) => handleSetInput(e)}/>
                    
                    <div className="flex flex-row justify-between gap-x-[15px]"><div className="flex flex-row justify-between w-full"><label id="amountLabel" className={labelClasses}>Amount</label><span className="text-[#EC3453] mt-auto">{errors['amount']}</span></div><label id="unlimitedLabel" className={labelClasses + 'flex flex-shrink-0 w-[80px] text-center'}>Unlimited</label></div>
                    <div className="flex flex-row mt-[6px] gap-x-[15px]">
                        <input aria-labelledby="amountLabel" disabled={data.isUnlimited} readOnly={data.isUnlimited} id="amountInput" inputMode={data.isUnlimited ? "text" : "numeric"} step={data.isUnlimited ? undefined : "0.000000000000001"} pattern={data.isUnlimited ? ".*" : "[0-9]*"} type="text" style={{marginTop:0}} min={0} className={textinputClasses + ' w-full' + (data.isUnlimited ? ' disabled:bg-[#EDEFF0] disabled:outline-[#D0D4D8] disabled:text-[#303030]' : '')} value={data.isUnlimited ? "Unlimited" : data.amount} onInput={(e) => handleSetInput(e)}/>
                        <div aria-labelledby="unlimitedLabel" role="button" onClick={() => setData('isUnlimited', !data.isUnlimited)} className="cursor-pointer flex flex-row flex-shrink-0 items-center bg-[#EDEFF0] p-1 w-[80px] h-[44px] rounded-full shadow-[inset_0_1px_3px_#BBC7D3,0_2px_0_#ffffff]">
                            <div className={`w-[36px] h-[36px] rounded-full transition-all ease-in duration-150 shadow-[0_2px_4px_-2px_#555566] ${data.isUnlimited ? 'ml-[36px] bg-orange-gradient' : 'ml-0 bg-[#FFFFFF] shadow-slate-400'}`}></div>
                        </div>
                    </div>

                    <div className="flex gap-x-[15px]">
                        {/*<button className="flex font-semibold bg-gradient-to-r from-[#303030] to-[#4C5054] text-offwhite w-[140px] h-[44px] mt-auto justify-center items-center rounded-[4px]">Revoke</button>*/}
                        <button onClick={handleSubmitAllowanceForm} className="mt-[35px] font-semibold h-[44px] w-full bg-orange-gradient rounded-[4px] text-offwhite shadow-[0_4px_8px_#F7644140] hover:bg-orange-darker-gradient hover:hover:shadow-[0_2px_0px_#FFFFFF,inset_0_2px_4px_rgba(0,0,0,0.25)]">Set Allowance</button>
                    </div>
                </form>
            </div>
            <SpenderPanel setSnackbarMessage={setSnackbarMessage}/>
        </DashboardLayout>
    )
}

interface IPageProps extends PageProps {
    flash: {
      success?: string;
      message? : string
      error?: string
    };

    success?: string
    existingAllowance?: IAllowance,
    ownedTokens: ITokenContract[]
}

interface IFormAllowance{
    ERC20TokenAddress : string
    ownerAddress : string
    spenderAddress : string
    spenderName : string
    amount : string
    isUnlimited : boolean
}