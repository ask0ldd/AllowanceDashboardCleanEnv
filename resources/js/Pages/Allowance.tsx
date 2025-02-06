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
import IFormAllowance from "@/types/IFormAllowance";

export default function Allowance() {

    const { flash, existingAllowance, ownedTokens } = usePage<IPageProps>().props

    const [symbol, setSymbol] = useState<string | null>(null)

    const modal = useModalManager({initialVisibility : false, initialModalContentId : "error"})
    const { setSnackbarMessage } = useSnackbar()
    // centralizing viem errors management
    const { handleSetAllowanceErrors } = useErrorHandler(modal.showError)
    const { publicClient, walletClient } = useEtherClientsContext()

    const mode = useRef<string>(existingAllowance ? 'edit' : 'new')

    const { erc20TokenService } = useServices()

    const { data, setData, post, put, errors, setError, clearErrors, transform } = useForm<IFormAllowance & {[key: string]: string | boolean}>({
        ERC20TokenAddress: existingAllowance?.tokenContractAddress ?? '',
        ownerAddress: existingAllowance?.ownerAddress ?? walletClient?.account?.address ?? '',
        spenderAddress: existingAllowance?.spenderAddress ?? '',
        spenderName : existingAllowance?.spenderName ?? '',
        amount : `${existingAllowance?.amount ?? 0n}`,
        isUnlimited : existingAllowance?.isUnlimited ?? false,
        transactionHash : '',
    })

    // update the owner address when a wallet account is connected or disco
    useEffect(() => {
        if(walletClient?.account?.address && isHexAddress(walletClient?.account?.address)) return setData(form  => ({...form, ['ownerAddress'] : walletClient?.account?.address as THexAddress}))
        setData(form  => ({...form, ['ownerAddress'] : ""}))
    }, [walletClient?.account?.address])

    useEffect(() => {
        if(flash?.error) modal.showError(flash.error)
    }, [flash.error])

    // !!! should check if account address = metamask account address
    // if not, send new address
    // if disconnected flush session address

    // !!! should not be able to send an allowance if not connected
    async function handleSubmitAllowanceForm(e : FormEvent<HTMLFormElement>) : Promise<void> {
        e.preventDefault()
        clearErrors()
        if(!await isAllowanceFormValid()) return // no error modal displayed since all non thrown errors are displayed within the form itself
        await processAllowance()
    }

    async function processAllowance(){
        modal.setStatus({visibility: true, contentId: 'waitingConfirmation'})
        try{
            if(!publicClient || !walletClient) throw new EthereumClientNotFoundError()
            const hash = !data.isUnlimited ?
                await erc20TokenService.setAllowance({walletClient /* desaccord énoncé !!!*/ , contractAddress : data.ERC20TokenAddress as THexAddress, spenderAddress : data.spenderAddress as THexAddress, amount : BigInt(data.amount)}) :
                    await erc20TokenService.setAllowanceToUnlimited({walletClient /* desaccord énoncé !!!*/ , contractAddress : data.ERC20TokenAddress as THexAddress, spenderAddress : data.spenderAddress as THexAddress})

            // transform : Ensures that the state transformation is fully resolved before proceeding with POST or PUT requests
            transform((data) => ({
                ...data,
                transactionHash: hash,
            }))

            // create new allowance
            if(mode.current == 'new'){
                post('/allowance/queue', {
                    preserveScroll: true,
                    onSuccess: () => {
                        setSnackbarMessage(Date.now() + "::Transaction sent. Hash : " + hash)
                    },
                    onError: (e : Errors) => {
                        if(e?.error) modal.showError(e.error)
                }, 
                })
            }else{
                // update an existing allowance
                put('/allowance/queue/' + route().params.id, {
                    preserveScroll: true,
                    onSuccess: () => {
                        setSnackbarMessage(Date.now() + "::Transaction sent. Hash : " + hash)
                    },
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

    const textinputClasses = "px-[10px] mt-[6px] w-full h-[44px] rounded-[4px] bg-[#FDFDFE] outline-1 outline outline-[#E1E3E6] focus:outline-1 focus:outline-[#F86F4D]"
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
            <TokenPanel ownedTokens={ownedTokens} setSnackbarMessage={setSnackbarMessage}/>
            <div id="allowanceFormContainer" className='flex grow shrink flex-col bg-component-white rounded-3xl overflow-hidden p-[40px] pt-[30px] border border-solid border-dashcomponent-border'>
                <h1 className='mx-auto max-w-[580px] w-full text-[36px] leading-[34px] font-bold font-oswald' style={{color:'#474B55'}}>{!existingAllowance ? 'SET A NEW' : 'EDIT AN'} ALLOWANCE</h1>
                <p className="border-l border-[#303030] border-dashed bg-[#ECEFF1] p-3 italic mx-auto max-w-[580px] w-full mt-8 leading-snug text-[14px]">By setting this allowance, you will authorize a specific address (spender) to withdraw a fixed number of tokens from the selected ERC20 token contract. Exercise extreme caution and only grant allowances to entities you fully trust. Unlimited allowances should be avoided.</p>
                <form onSubmit={handleSubmitAllowanceForm} className="mx-auto flex flex-col max-w-[580px] w-full">
                    
                    <div className="flex flex-row justify-between gap-x-[15px]"><label id="contractAddressLabel" className={labelClasses}>Token Contract Address</label><span className="text-[#EC3453] mt-auto mr-[54px]">{errors['ERC20TokenAddress']}</span></div>
                    <div className="w-full flex flex-row gap-x-[10px] mt-[6px]">
                        <div className="full-w relative flex flex-grow">
                            <input aria-labelledby="contractAddressLabel" readOnly={mode.current == "edit"} onFocus={() => clearErrors('ERC20TokenAddress')} onBlur={handleContractAddressBlur} style={{marginTop:0}} id="contractInput" placeholder="0x20c...a20cb" type="text" value={data.ERC20TokenAddress} className={textinputClasses + ' flex-grow' + (errors['ERC20TokenAddress'] ? ' border-l-[6px] border-solid border-[#EC3453] pl-[12px]' : '')} onInput={(e) => handleSetInput(e)}/>
                            {mode.current == "edit" && <div className="opacity-80 absolute w-[44px] h-[44px] translate-x-[-100%] ml-[100%] flex-shrink-0 flex justify-center items-center">
                                <svg width="20" height="20" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M4 9V5C4 3.93913 4.42143 2.92172 5.17157 2.17157C5.92172 1.42143 6.93913 1 8 1C9.06087 1 10.0783 1.42143 10.8284 2.17157C11.5786 2.92172 12 3.93913 12 5V9M11 14H11.01M8.01 14H8.02M5.02 14H5.03M1 11C1 10.4696 1.21071 9.96086 1.58579 9.58579C1.96086 9.21071 2.46957 9 3 9H13C13.5304 9 14.0391 9.21071 14.4142 9.58579C14.7893 9.96086 15 10.4696 15 11V17C15 17.5304 14.7893 18.0391 14.4142 18.4142C14.0391 18.7893 13.5304 19 13 19H3C2.46957 19 1.96086 18.7893 1.58579 18.4142C1.21071 18.0391 1 17.5304 1 17V11Z" stroke="#303030" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </div>}
                        </div>
                        <div className="w-[44px] h-[44px] rounded-[4px] bg-[#ffffff] flex-shrink-0 flex justify-center items-center outline-1 outline outline-[#E1E3E6]">{(existingAllowance?.tokenContractSymbol || symbol) && <img src={symbol ? `/coins/${symbol}.svg` : `/coins/${existingAllowance?.tokenContractSymbol}.svg`} className="w-[34px]"/>}</div>
                    </div>
                    
                    <div className="flex flex-row justify-between gap-x-[15px]"><label id="ownerAddressLabel" className={labelClasses}>Owner Address</label><span className="text-[#EC3453] mt-auto">{errors['ownerAddress']}</span></div>
                    <div className="full-w relative">
                        <input readOnly={mode.current == "edit"} aria-labelledby="ownerAddressLabel" onFocus={() => clearErrors('ownerAddress')} id="ownerInput" placeholder="0x20c...a20cb" type="text" value={data.ownerAddress} className={textinputClasses + (errors['ownerAddress'] ? ' border-l-[6px] border-solid border-[#EC3453] pl-[12px]' : '')} onInput={(e) => handleSetInput(e)}/>
                        {mode.current == "edit" && <div className="opacity-80 absolute w-[44px] h-[44px] translate-x-[-100%] translate-y-[-100%] ml-[100%] flex-shrink-0 flex justify-center items-center">
                            <svg width="20" height="20" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4 9V5C4 3.93913 4.42143 2.92172 5.17157 2.17157C5.92172 1.42143 6.93913 1 8 1C9.06087 1 10.0783 1.42143 10.8284 2.17157C11.5786 2.92172 12 3.93913 12 5V9M11 14H11.01M8.01 14H8.02M5.02 14H5.03M1 11C1 10.4696 1.21071 9.96086 1.58579 9.58579C1.96086 9.21071 2.46957 9 3 9H13C13.5304 9 14.0391 9.21071 14.4142 9.58579C14.7893 9.96086 15 10.4696 15 11V17C15 17.5304 14.7893 18.0391 14.4142 18.4142C14.0391 18.7893 13.5304 19 13 19H3C2.46957 19 1.96086 18.7893 1.58579 18.4142C1.21071 18.0391 1 17.5304 1 17V11Z" stroke="#303030" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>}
                    </div>
                    
                    
                    <div className="flex flex-row justify-between"><label id="spenderAddressLabel" className={labelClasses}>Spender Address</label><span className="text-[#EC3453] mt-auto">{errors['spenderAddress']}</span></div>
                    <div className="full-w relative">
                        <input readOnly={mode.current == "edit"} aria-labelledby="spenderAddressLabel" onFocus={() => clearErrors('spenderAddress')} id="spenderInput" placeholder="0x20c...a20cb" type="text" value={data.spenderAddress} className={textinputClasses + (errors['spenderAddress'] ? ' border-l-[6px] border-solid border-[#EC3453] pl-[12px]' : '')} onInput={(e) => handleSetInput(e)}/>
                        {mode.current == "edit" && <div className="opacity-80 absolute w-[44px] h-[44px] translate-x-[-100%] translate-y-[-100%] ml-[100%] flex-shrink-0 flex justify-center items-center">
                            <svg width="20" height="20" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4 9V5C4 3.93913 4.42143 2.92172 5.17157 2.17157C5.92172 1.42143 6.93913 1 8 1C9.06087 1 10.0783 1.42143 10.8284 2.17157C11.5786 2.92172 12 3.93913 12 5V9M11 14H11.01M8.01 14H8.02M5.02 14H5.03M1 11C1 10.4696 1.21071 9.96086 1.58579 9.58579C1.96086 9.21071 2.46957 9 3 9H13C13.5304 9 14.0391 9.21071 14.4142 9.58579C14.7893 9.96086 15 10.4696 15 11V17C15 17.5304 14.7893 18.0391 14.4142 18.4142C14.0391 18.7893 13.5304 19 13 19H3C2.46957 19 1.96086 18.7893 1.58579 18.4142C1.21071 18.0391 1 17.5304 1 17V11Z" stroke="#303030" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>}
                    </div>
                    
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
                        <button type="submit" className="mt-[35px] font-semibold h-[44px] w-full bg-orange-gradient rounded-[4px] text-offwhite shadow-[0_4px_8px_#F7644140] hover:bg-orange-darker-gradient hover:hover:shadow-[0_2px_0px_#FFFFFF,inset_0_2px_4px_rgba(0,0,0,0.25)]">Set Allowance</button>
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