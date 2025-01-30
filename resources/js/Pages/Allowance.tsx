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

export default function Allowance() {

    const { flash, success, errors: errorsProp, accountAddress, mockAccountPrivateKey, existingAllowance, ownedTokens } = usePage<IPageProps>().props

    const [symbol, setSymbol] = useState<string | null>(null)

    // const account: PrivateKeyAccount = privateKeyToAccount(mockAccountPrivateKey as THexAddress)

    const modal = useModalManager({initialVisibility : false, initialModalContentId : "error"})
    // centralizing viem errors management
    const {handleBalanceValidationErrors, handleSetAllowanceErrors} = useErrorHandler(modal.showError)

    const mode = useRef<string>(existingAllowance ? 'edit' : 'new')

    const { metamaskService, erc20TokenService } = useServices()

    const { data, setData, post, put, processing, errors, setError, clearErrors, transform } = useForm<IFormAllowance & {[key: string]: string | boolean}>({
        ERC20TokenAddress: existingAllowance?.tokenContractAddress ?? '',
        ownerAddress: existingAllowance?.ownerAddress ?? accountAddress ?? '', // !!! should be wallet address
        spenderAddress: existingAllowance?.spenderAddress ?? '',
        spenderName : existingAllowance?.spenderName ?? '',
        amount : `${existingAllowance?.amount ?? 0}`, // !!! should i really be converting bigint to number
        isUnlimited : existingAllowance?.isUnlimited ?? false,
        transactionHash : '',
    })

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
        modal.close()
        // !!! backend side : should check if trio not already existing
        try{
            const receipt = !data.isUnlimited ?
                await erc20TokenService.setAllowance({/*account, */contractAddress : data.ERC20TokenAddress as THexAddress, spenderAddress : data.spenderAddress as THexAddress, amount : BigInt(data.amount)}) : // !!! bigint
                    await erc20TokenService.setAllowanceToUnlimited({/*account, */contractAddress : data.ERC20TokenAddress as THexAddress, spenderAddress : data.spenderAddress as THexAddress})

            if(receipt?.status != 'success') {
                modal.showError("Transaction receipt : The transaction has failed.")
                return
            }

            // transform : wait for the update to be resolved vs setData : async
            transform((data) => ({
                ...data,
                transactionHash: receipt.transactionHash,
            }))

            if(mode.current == 'new'){
                post('/allowance', {
                    preserveScroll: true,
                    onSuccess: () => {}, // !!! show success modale ?
                    onError: (e : Errors) => {
                        if(e?.error) modal.showError(e.error)
                }, 
                })
            }else{
                put('/allowance/' + route().params.id, {
                    preserveScroll: true,
                    onSuccess: () => {}, // !!! show success modale ?
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
        // can't check if address exists through viem since balances may be 0 so only check contract address supply
        console.log("validation")

        const errors = validateHexAddresses()
        if (!data.isUnlimited && !validateAmount()) return false
        if(errors > 0) return false

        // !!!! check contract supply / check invalid contract
        try{
            const balance = await erc20TokenService.getBalance(data.ERC20TokenAddress as THexAddress, data.ownerAddress as THexAddress)
            if(!balance || BigInt(data.amount) > balance) { // !!! fix bigint / owner address replace with wallet address
                setError('amount', `This amount exceeds your balance (${balance ?? 'unknown'}).`)
                return false
            }
            return true
        }catch(e){
            handleBalanceValidationErrors(e)
            return false
        }
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

    /*async function isBalanceGreaterThanAmount(ERC20TokenAddress : THexAddress, ownerAddress : THexAddress, amount : bigint){ // !!! fix bigint / owner address replace with wallet address
        try{
            const balance = await erc20TokenService.getBalance(ERC20TokenAddress, ownerAddress)
            if(!balance || (amount > balance)) return false // !!!! fix biginit
            return true
        }catch(error){
            throw error
        }
    }*/

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

    const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null)

    // !!! modal with token name, symbol
    // !!! modal contract doesn't not exist

    return(
        <DashboardLayout snackbarMessage={snackbarMessage ?? ""} modal={modal}>
            <TokenPanel accountAddress={accountAddress ? accountAddress as THexAddress : undefined} ownedTokens={ownedTokens} setSnackbarMessage={setSnackbarMessage}/>
            <div id="allowanceFormContainer" className='flex grow shrink flex-col bg-component-white rounded-3xl overflow-hidden p-[40px] pt-[30px] border border-solid border-dashcomponent-border'>
                <h1 className='mx-auto max-w-[580px] w-full text-[36px] leading-[34px] font-bold font-oswald' style={{color:'#474B55'}}>{!existingAllowance ? 'SET A NEW' : 'EDIT AN'} ALLOWANCE</h1>
                <p className="border-l border-[#303030] border-dashed bg-[#ECEFF1] p-3 italic mx-auto max-w-[580px] w-full mt-8 leading-snug text-[14px]">By setting this allowance, you will authorize a specific address (spender) to withdraw a fixed number of tokens from the selected ERC20 token contract. Exercise extreme caution and only grant allowances to entities you fully trust. Unlimited allowances should be avoided.</p>
                <form className="mx-auto flex flex-col max-w-[580px] w-full">
                    
                    <div className="flex flex-row justify-between gap-x-[15px]"><label id="contractAddressLabel" className={labelClasses}>Token Contract Address</label><span className="text-[#D86055] mt-auto mr-[54px]">{errors['ERC20TokenAddress']}</span></div>
                    <div className="w-full flex flex-row gap-x-[10px] mt-[6px]">
                        <input aria-labelledby="contractAddressLabel" readOnly={mode.current == "edit"} onBlur={handleContractAddressBlur} style={{marginTop:0}} id="contractInput" placeholder="0x20c...a20cb" type="text" value={data.ERC20TokenAddress} className={textinputClasses + ' flex-grow'} onInput={(e) => handleSetInput(e)}/>
                        <div className="w-[44px] h-[44px] rounded-[4px] bg-[#ffffff] flex-shrink-0 flex justify-center items-center outline-1 outline outline-[#E1E3E6]">{(existingAllowance?.tokenContractSymbol || symbol) && <img src={symbol ? `/coins/${symbol}.svg` : `/coins/${existingAllowance?.tokenContractSymbol}.svg`} className="w-[34px]"/>}</div>
                    </div>
                    
                    <div className="flex flex-row justify-between gap-x-[15px]"><label id="ownerAddressLabel" className={labelClasses}>Owner Address</label><span className="text-[#D86055] mt-auto">{errors['ownerAddress']}</span></div>
                    <input aria-labelledby="ownerAddressLabel" id="ownerInput" placeholder="0x20c...a20cb" type="text" value={data.ownerAddress} className={textinputClasses} onInput={(e) => handleSetInput(e)}/>
                    
                    <div className="flex flex-row justify-between"><label id="spenderAddressLabel" className={labelClasses}>Spender Address</label><span className="text-[#D86055] mt-auto">{errors['spenderAddress']}</span></div>
                    <input aria-labelledby="spenderAddressLabel" id="spenderInput" placeholder="0x20c...a20cb" type="text" value={data.spenderAddress} className={textinputClasses} onInput={(e) => handleSetInput(e)}/>
                    
                    <label id="spenderNameLabel" className={labelClasses}>Spender Name (optional)</label>
                    <input id="spenderNameInput" aria-labelledby="spenderNameLabel" placeholder="Ex : PancakeSwap, Axie Infinity, Magic Eden, ..." type="text" value={data.spenderName} className={textinputClasses} onInput={(e) => handleSetInput(e)}/>
                    
                    <div className="flex flex-row justify-between gap-x-[15px]"><div className="flex flex-row justify-between w-full"><label id="amountLabel" className={labelClasses}>Amount</label><span className="text-[#D86055] mt-auto">{errors['amount']}</span></div><label id="unlimitedLabel" className={labelClasses + 'flex flex-shrink-0 w-[80px] text-center'}>Unlimited</label></div>
                    <div className="flex flex-row mt-[6px] gap-x-[15px]">
                        <input aria-labelledby="amountLabel" disabled={data.isUnlimited} readOnly={data.isUnlimited} id="amountInput" inputMode={data.isUnlimited ? "text" : "numeric"} pattern={data.isUnlimited ? ".*" : "[0-9]*"} type="text" style={{marginTop:0}} min={0} className={textinputClasses + ' w-full' + (data.isUnlimited ? ' disabled:bg-[#EDEFF0] disabled:outline-[#D0D4D8] disabled:text-[#303030]' : '')} value={data.isUnlimited ? "Unlimited" : data.amount} onInput={(e) => handleSetInput(e)}/>
                        <div aria-labelledby="unlimitedLabel" role="button" onClick={() => setData('isUnlimited', !data.isUnlimited)} className="cursor-pointer flex flex-row flex-shrink-0 items-center bg-[#EDEFF0] p-1 w-[80px] h-[44px] rounded-full shadow-[inset_0_1px_3px_#BBC7D3,0_2px_0_#ffffff]">
                            <div className={`w-[36px] h-[36px] rounded-full transition-all ease-in duration-150 shadow-[0_2px_4px_-2px_#555566] ${data.isUnlimited ? 'ml-[36px] bg-orange-gradient' : 'ml-0 bg-[#FFFFFF] shadow-slate-400'}`}></div>
                        </div>
                    </div>

                    <button onClick={handleSubmitAllowanceForm} className="mt-[35px] font-semibold h-[44px] w-full bg-orange-gradient rounded-[4px] text-offwhite shadow-[0_4px_8px_#F7644140]">Set Allowance</button>
                </form>
                { /* <p className="mx-auto my-[20px]">{supply}</p> */ }
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
    accountAddress?: string
    mockAccountPrivateKey?: string
    existingAllowance?: IAllowance,
    ownedTokens: ITokenContract[]
}

interface IFormAllowance{
    ERC20TokenAddress : string
    ownerAddress : string
    spenderAddress : string
    spenderName : string
    amount : string // | "unlimited" // biginit
    isUnlimited : boolean
}

/*async function read(){
        try{
            const metamaskAddress = await metamaskService.getWalletAddress()
            if(metamaskAddress) {
                setWalletAddress(metamaskAddress)
                console.log("metamask address : ", metamaskAddress)
            }

            const readSupply = await erc20TokenService.getTotalSupply("0x5FbDB2315678afecb367f032d93F642f64180aa3")
            if(readSupply) setSupply(readSupply)
            
            const receipt = await erc20TokenService.setAllowance({
                contractAddress : "0x5FbDB2315678afecb367f032d93F642f64180aa3", 
                spenderAddress : "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199", 
                amount: BigInt(20000)
            })
            if(receipt) console.log("Receipt : ", receipt)
            
            const allowance = await erc20TokenService.readAllowance({
                contractAddress : "0x5FbDB2315678afecb367f032d93F642f64180aa3", 
                ownerAddress : "0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097", 
                spenderAddress : "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199"
            })
            if(allowance) console.log("Allowance : ", allowance)

            const tokenInfos = await erc20TokenService.getTokenNSymbol("0x5FbDB2315678afecb367f032d93F642f64180aa3")
            if(tokenInfos) console.log(JSON.stringify(tokenInfos))
        }
        catch(error){
            setSupply("error")
        }
    }

    useEffect(() => {
        read()
    }, [])*/

    /*
  import { useState } from 'react';
import { useForm } from '@inertiajs/react';

function YourComponent() {
  const [firstFieldValue, setFirstFieldValue] = useState('');
  const { data, setData, get } = useForm({
    searchTerm: '',
    relatedData: null
  });

  const handleFirstFieldChange = (e) => {
    const value = e.target.value;
    setFirstFieldValue(value);

    // Trigger real-time search/update
    get(route('your.search.route'), {
      data: { searchTerm: value },
      preserveState: true,
      only: ['relatedData'],
      onSuccess: (page) => {
        setData('relatedData', page.props.relatedData);
      }
    });
  };

  return (
    <div>
      <input 
        type="text" 
        value={firstFieldValue}
        onChange={handleFirstFieldChange}
      />
      <input 
        type="text" 
        value={data.relatedData || ''} 
        readOnly 
      />
    </div>
  );
}

    */

/*async function showConfirmationModale(){ // should pass edit or create
        // !!! add unlimited alert for user if needed
        modal.showInjectionModal(
            <div className="flex flex-col w-full gap-y-[20px]">
                <div className="flex flex-shrink-0 justify-center items-center self-center w-[52px] h-[52px] bg-[#d0fae7] rounded-full">
                    <div className="flex flex-grow-0 justify-center items-center w-[36px] h-[36px] bg-[#40CBADBB] rounded-full">
                    </div>
                </div>
                <h3 className="w-full text-center font-bold text-[24px]">Confirm this transaction</h3>
                <p className="flex flex-col w-full text-[14px] italic p-[12px] pt-[24px] border-t border-[#303030] border-dashed">Accepting an Ethereum token allowance doesn't lock you in permanently. You can revoke permissions anytime through our platform.</p>
                <p className="flex flex-col w-full text-[14px] italic p-[12px] pt-[24px] border-t border-[#303030] border-solid">Accepting an Ethereum token allowance doesn't lock you in permanently. You can revoke permissions anytime through our platform.</p>
                <div className="flex flex-row gap-x-[10px]">
                    <button className="font-semibold flex-auto h-[44px] bg-[#ffffff] w-full bg-gradient-to-r from-[#303030] to-[#4D5054] rounded-[4px] text-offwhite">
                        Cancel
                    </button>
                    <button onClick={processConfirmedAllowance} className="font-semibold flex-auto h-[44px] w-full bg-gradient-to-r from-[#2A9F8C] to-[#4DB85A] rounded-[4px] text-offwhite shadow-[0_4px_8px_#4DB85A40]">
                        Confirm
                    </button>
                </div>
            </div>
        )
    }*/