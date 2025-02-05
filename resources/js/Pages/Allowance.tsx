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
            const hash = !data.isUnlimited ? // error will be catched
                await erc20TokenService.setAllowance({walletClient, contractAddress : data.ERC20TokenAddress as THexAddress, spenderAddress : data.spenderAddress as THexAddress, amount : BigInt(data.amount)}) :
                    await erc20TokenService.setAllowanceToUnlimited({walletClient, contractAddress : data.ERC20TokenAddress as THexAddress, spenderAddress : data.spenderAddress as THexAddress})

            // transform : Ensures that the state transformation is fully resolved before proceeding with POST or PUT requests
            transform((data) => ({
                ...data,
                transactionHash: hash,
            }))

            // new allowance
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
            <TokenPanel accountAddress={localStorageService.retrieveWalletAddress() ? localStorageService.retrieveWalletAddress() : undefined} ownedTokens={ownedTokens} setSnackbarMessage={setSnackbarMessage}/>
            <div id="allowanceFormContainer" className='flex grow shrink flex-col bg-component-white rounded-3xl overflow-hidden p-[40px] pt-[30px] border border-solid border-dashcomponent-border'>
                <h1 className='mx-auto max-w-[580px] w-full text-[36px] leading-[34px] font-bold font-oswald' style={{color:'#474B55'}}>{!existingAllowance ? 'SET A NEW' : 'EDIT AN'} ALLOWANCE</h1>
                <p className="border-l border-[#303030] border-dashed bg-[#ECEFF1] p-3 italic mx-auto max-w-[580px] w-full mt-8 leading-snug text-[14px]">By setting this allowance, you will authorize a specific address (spender) to withdraw a fixed number of tokens from the selected ERC20 token contract. Exercise extreme caution and only grant allowances to entities you fully trust. Unlimited allowances should be avoided.</p>
                <form onSubmit={handleSubmitAllowanceForm} className="mx-auto flex flex-col max-w-[580px] w-full">
                    
                    <div className="flex flex-row justify-between gap-x-[15px]"><label id="contractAddressLabel" className={labelClasses}>Token Contract Address</label><span className="text-[#EC3453] mt-auto mr-[54px]">{errors['ERC20TokenAddress']}</span></div>
                    <div className="w-full flex flex-row gap-x-[10px] mt-[6px]">
                        <input aria-labelledby="contractAddressLabel" readOnly={mode.current == "edit"} onFocus={() => clearErrors('ERC20TokenAddress')} onBlur={handleContractAddressBlur} style={{marginTop:0}} id="contractInput" placeholder="0x20c...a20cb" type="text" value={data.ERC20TokenAddress} className={textinputClasses + ' flex-grow' + (errors['ERC20TokenAddress'] ? ' border-l-[6px] border-solid border-[#EC3453] pl-[12px]' : '')} onInput={(e) => handleSetInput(e)}/>
                        <div className="w-[44px] h-[44px] rounded-[4px] bg-[#ffffff] flex-shrink-0 flex justify-center items-center outline-1 outline outline-[#E1E3E6]">{(existingAllowance?.tokenContractSymbol || symbol) && <img src={symbol ? `/coins/${symbol}.svg` : `/coins/${existingAllowance?.tokenContractSymbol}.svg`} className="w-[34px]"/>}</div>
                    </div>
                    
                    <div className="flex flex-row justify-between gap-x-[15px]"><label id="ownerAddressLabel" className={labelClasses}>Owner Address</label><span className="text-[#EC3453] mt-auto">{errors['ownerAddress']}</span></div>
                    <div className="flex gap-x-[10px]">
                        <input readOnly={mode.current == "edit"} aria-labelledby="ownerAddressLabel" onFocus={() => clearErrors('ownerAddress')} id="ownerInput" placeholder="0x20c...a20cb" type="text" value={data.ownerAddress} className={textinputClasses + (errors['ownerAddress'] ? ' border-l-[6px] border-solid border-[#EC3453] pl-[12px]' : '')} onInput={(e) => handleSetInput(e)}/>
                        <div className="mt-auto w-[44px] h-[44px] rounded-[4px] bg-[#ffffff] flex-shrink-0 flex justify-center items-center outline-1 outline outline-[#E1E3E6]">
                            <svg width="24" height="24" viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 4.75H10.25V3.5C10.25 2.63805 9.90759 1.8114 9.2981 1.2019C8.6886 0.59241 7.86195 0.25 7 0.25C6.13805 0.25 5.3114 0.59241 4.7019 1.2019C4.09241 1.8114 3.75 2.63805 3.75 3.5V4.75H2C1.66848 4.75 1.35054 4.8817 1.11612 5.11612C0.881696 5.35054 0.75 5.66848 0.75 6V13C0.75 13.3315 0.881696 13.6495 1.11612 13.8839C1.35054 14.1183 1.66848 14.25 2 14.25H12C12.3315 14.25 12.6495 14.1183 12.8839 13.8839C13.1183 13.6495 13.25 13.3315 13.25 13V6C13.25 5.66848 13.1183 5.35054 12.8839 5.11612C12.6495 4.8817 12.3315 4.75 12 4.75ZM5.25 3.5C5.25 3.03587 5.43437 2.59075 5.76256 2.26256C6.09075 1.93437 6.53587 1.75 7 1.75C7.46413 1.75 7.90925 1.93437 8.23744 2.26256C8.56563 2.59075 8.75 3.03587 8.75 3.5V4.75H5.25V3.5ZM11.75 12.75H2.25V6.25H11.75V12.75ZM7 7C6.536 7.00017 6.08649 7.16167 5.72847 7.45684C5.37046 7.75201 5.12621 8.16248 5.03757 8.61794C4.94893 9.0734 5.02142 9.5455 5.2426 9.95339C5.46379 10.3613 5.81993 10.6796 6.25 10.8538V11.25C6.25 11.4489 6.32902 11.6397 6.46967 11.7803C6.61032 11.921 6.80109 12 7 12C7.19891 12 7.38968 11.921 7.53033 11.7803C7.67098 11.6397 7.75 11.4489 7.75 11.25V10.8538C8.18007 10.6796 8.53621 10.3613 8.75739 9.95339C8.97858 9.5455 9.05107 9.0734 8.96243 8.61794C8.87379 8.16248 8.62954 7.75201 8.27153 7.45684C7.91351 7.16167 7.464 7.00017 7 7ZM7 8.5C7.09889 8.5 7.19556 8.52932 7.27779 8.58426C7.36001 8.63921 7.4241 8.7173 7.46194 8.80866C7.49978 8.90002 7.50969 9.00056 7.49039 9.09755C7.4711 9.19454 7.42348 9.28363 7.35355 9.35355C7.28363 9.42348 7.19454 9.4711 7.09755 9.49039C7.00056 9.50969 6.90002 9.49978 6.80866 9.46194C6.7173 9.4241 6.63921 9.36001 6.58427 9.27779C6.52932 9.19556 6.5 9.09889 6.5 9C6.5 8.86739 6.55268 8.74021 6.64645 8.64645C6.74021 8.55268 6.86739 8.5 7 8.5Z" fill="black"/>
                            </svg>
                        </div>
                    </div>
                    
                    
                    <div className="flex flex-row justify-between"><label id="spenderAddressLabel" className={labelClasses}>Spender Address</label><span className="text-[#EC3453] mt-auto">{errors['spenderAddress']}</span></div>
                    <div className="flex gap-x-[10px]">
                        <input readOnly={mode.current == "edit"} aria-labelledby="spenderAddressLabel" onFocus={() => clearErrors('spenderAddress')} id="spenderInput" placeholder="0x20c...a20cb" type="text" value={data.spenderAddress} className={textinputClasses + (errors['spenderAddress'] ? ' border-l-[6px] border-solid border-[#EC3453] pl-[12px]' : '')} onInput={(e) => handleSetInput(e)}/>
                        <div className="mt-auto w-[44px] h-[44px] rounded-[4px] bg-[#ffffff] flex-shrink-0 flex justify-center items-center outline-1 outline outline-[#E1E3E6]">
                            <svg width="18" height="21" viewBox="0 0 18 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3 7V6C3 4.4087 3.63214 2.88258 4.75736 1.75736C5.88258 0.632141 7.4087 0 9 0C10.5913 0 12.1174 0.632141 13.2426 1.75736C14.3679 2.88258 15 4.4087 15 6V7H17C17.2652 7 17.5196 7.10536 17.7071 7.29289C17.8946 7.48043 18 7.73478 18 8V20C18 20.2652 17.8946 20.5196 17.7071 20.7071C17.5196 20.8946 17.2652 21 17 21H1C0.734784 21 0.48043 20.8946 0.292893 20.7071C0.105357 20.5196 0 20.2652 0 20V8C0 7.73478 0.105357 7.48043 0.292893 7.29289C0.48043 7.10536 0.734784 7 1 7H3ZM16 9H2V19H16V9ZM8 14.732C7.61874 14.5119 7.32077 14.1721 7.15231 13.7653C6.98384 13.3586 6.95429 12.9076 7.06824 12.4824C7.18219 12.0571 7.43326 11.6813 7.78253 11.4133C8.1318 11.1453 8.55975 11 9 11C9.44025 11 9.8682 11.1453 10.2175 11.4133C10.5667 11.6813 10.8178 12.0571 10.9318 12.4824C11.0457 12.9076 11.0162 13.3586 10.8477 13.7653C10.6792 14.1721 10.3813 14.5119 10 14.732V17H8V14.732ZM5 7H13V6C13 4.93913 12.5786 3.92172 11.8284 3.17157C11.0783 2.42143 10.0609 2 9 2C7.93913 2 6.92172 2.42143 6.17157 3.17157C5.42143 3.92172 5 4.93913 5 6V7Z" fill="black"/>
                            </svg>
                        </div>
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