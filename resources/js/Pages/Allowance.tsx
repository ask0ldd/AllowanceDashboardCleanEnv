import TokenPanel from "@/Components/TokenPanel/TokenPanel";
import { useServices } from "@/hooks/useServices";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { IAllowance } from "@/types/IAllowance";
import { ITokenContract } from "@/types/ITokenContract";
import { THexAddress } from "@/types/THexAddress";
import { isHexAddress } from "@/types/typeguards";
import AddressUtils from "@/utils/AddressUtils";
import NumberUtils from "@/utils/NumberUtils";
import { router, useForm } from "@inertiajs/react";
import { FormEvent, useEffect, useRef, useState } from "react";

export default function Allowance({ existingAllowance, ownedTokens } : { existingAllowance?: IAllowance, ownedTokens: ITokenContract[] }) {

    const [unlimitedAmount, setUnlimitedAmount] = useState<boolean>(false)
    const [walletAddress, setWalletAddress] = useState<THexAddress>()
    const [symbol, setSymbol] = useState<string | null>(null)

    const mode = useRef<string>(existingAllowance ? 'edit' : 'new')

    const {metamaskService, erc20TokenService} = useServices()

    // !!! deal with no wallet connected
    const defaultWalletAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"// "0x58730ae0faa10d73b0cddb5e7b87c3594f7a20cb" // !!!

    const { data, setData, post, put, get, submit, processing, errors, setError } = useForm<IFormAllowance & {[key: string]: string}>({
        ERC20TokenAddress: existingAllowance?.tokenContractAddress ?? '',
        ownerAddress: existingAllowance?.ownerAddress ?? defaultWalletAddress ?? '',
        spenderAddress: existingAllowance?.spenderAddress ?? '',
        spenderName : existingAllowance?.spenderName ?? '',
        amount : `${existingAllowance?.amount ?? 0}`, // !!! should i really be converting bigint to number
    })

    async function handleSubmitAllowanceForm(e : React.MouseEvent<HTMLButtonElement>) : Promise<void> {
        e.preventDefault()
        // !!! backend side : check if trio not already existing
        // if (!await isAllowanceFormValid()) return
        if(mode.current == 'new'){
            post('/allowance', {
                preserveScroll: true,
                onSuccess: () => {},
            })
        }else{
            put('/allowance/' + route().params.id, {
                preserveScroll: true,
                onSuccess: () => {},
            })
        }
    }

    async function isAllowanceFormValid(){
        // can't check if address exists through viem since balances may be 0 so only check contract address supply
        if(!isHexAddress(data.ERC20TokenAddress)) return false
        if(!isHexAddress(data.spenderAddress)) return false
        if(!isHexAddress(data.ownerAddress)) return false
        if(!(NumberUtils.isNumber(data.amount) || data.amount == 'unlimited')) return false
        if(!await isBalanceGreaterThanAmount(data.ERC20TokenAddress, data.ownerAddress)) return false
        return true
    }

    async function isBalanceGreaterThanAmount(ERC20TokenAddress : THexAddress, ownerAddress : THexAddress){
        const balance = await erc20TokenService.getBalance(ERC20TokenAddress, ownerAddress)
        if(!balance) return false
        return true
    }

    const textinputClasses = "px-[10px] mt-[6px] fill-w h-[44px] rounded-[4px] outline-1 outline outline-dashcomponent-border focus:outline-2"
    const labelClasses = "mt-[25px] font-medium text-[#474B55]"

    const inputsPropsMap : Record<string, string> = {
        // 'amountInput' : 'allowedAmount',
        'amountInput' : 'amount', 
        'contractInput' : 'ERC20TokenAddress', // 'erc20Address',
        'ownerInput' : 'ownerAddress',
        'spenderInput' : 'spenderAddress',
        'spenderNameInput' : 'spenderName',
    }

    function handleSetInput(e: FormEvent<HTMLInputElement>): void {
        e.preventDefault()
        const input = (e.target as HTMLInputElement)
        if(input.id == "amountInput" && !NumberUtils.isNumber(input.value[input.value.length-1])) return
        setData(form  => ({...form, [inputsPropsMap[input.id]] : input.value}))
        // setAllowanceForm(form => ({...form, [inputsPropsMap[input.id]] : {...[inputsPropsMap[input.id]], value : input.id == "amountInput" ? parseFloat(input.value) : input.value, touched : true}}))
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

    useEffect(() => {
        if(unlimitedAmount) return setData("amount", "Unlimited")
        return setData("amount", `${existingAllowance?.amount ?? 0}`)
    }, [unlimitedAmount])

    // !!! modal with token name, symbol
    // !!! modal contract doesn't not exist

    return(
        <DashboardLayout>
            <TokenPanel ownedTokens={ownedTokens}/>
            <div id="allowanceFormContainer" className='flex grow shrink flex-col bg-component-white rounded-3xl overflow-hidden p-[40px] pt-[35px] border border-solid border-dashcomponent-border'>
                <h1 className='mx-auto max-w-[580px] w-full text-[36px] leading-[34px] font-bold font-oswald' style={{color:'#474B55'}}>{!existingAllowance ? 'SET A NEW' : 'EDIT AN'} ALLOWANCE</h1>
                <p className="border-l border-[#a2bbE0] border-solid pl-3 italic mx-auto max-w-[580px] w-full mt-6 leading-snug text-[14px]">By setting this allowance, you will authorize a specific address (spender) to withdraw a fixed number of tokens from the selected ERC20 token contract. Exercise extreme caution and only grant allowances to entities you fully trust. Unlimited allowances should be avoided.</p>
                <form className="mx-auto flex flex-col max-w-[580px] w-full">
                    
                    <label className={labelClasses}>Token Contract Address</label>
                    <div className="w-full flex flex-row gap-x-[10px] mt-[6px]">
                        <input readOnly={mode.current == "edit"} onBlur={handleContractAddressBlur} style={{marginTop:0}} id="contractInput" placeholder="0x20c...a20cb" type="text" value={data.ERC20TokenAddress/*allowanceForm.erc20Address.value*/} className={textinputClasses + ' flex-grow'} onInput={(e) => handleSetInput(e)}/>
                        <div className="w-[44px] h-[44px] rounded-[4px] bg-[#ffffff] flex-shrink-0 flex justify-center items-center outline-1 outline outline-dashcomponent-border">{(existingAllowance?.tokenContractSymbol || symbol) && <img src={symbol ? `/coins/${symbol}.svg` : `/coins/${existingAllowance?.tokenContractSymbol}.svg`} className="w-[34px]"/>}</div>
                    </div>
                    
                    <label className={labelClasses}>Owner Address</label>
                    <input id="ownerInput" placeholder="0x20c...a20cb" type="text" value={data.ownerAddress/*allowanceForm.ownerAddress.value*/} className={textinputClasses} onInput={(e) => handleSetInput(e)}/>
                    
                    <label className={labelClasses}>Spender Address</label>
                    <input id="spenderInput" placeholder="0x20c...a20cb" type="text" value={data.spenderAddress/*allowanceForm.spenderAddress.value*/} className={textinputClasses} onInput={(e) => handleSetInput(e)}/>
                    
                    <label className={labelClasses}>Spender Name (optional)</label>
                    <input id="spenderNameInput" placeholder="Ex : PancakeSwap, Axie Infinity, Magic Eden, ..." type="text" value={data.spenderName/*allowanceForm.spenderName.value*/} className={textinputClasses} onInput={(e) => handleSetInput(e)}/>
                    
                    <div className="flex flex-row justify-between"><label className={labelClasses}>Amount</label><label className={labelClasses + 'flex flex-shrink-0 w-[80px] text-center'}>Unlimited</label></div>
                    <div className="flex flex-row mt-[6px] gap-x-[15px]">
                        <input readOnly={unlimitedAmount} id="amountInput" inputMode={unlimitedAmount ? "text" : "numeric"} pattern={unlimitedAmount ? ".*" : "[0-9]*"} type="text" style={{marginTop:0}} min={0} className={textinputClasses + ' w-full' + (unlimitedAmount ? ' bg-[#DCE3F2]' : '')} value={data.amount} onInput={(e) => handleSetInput(e)}/>
                        <div onClick={() => setUnlimitedAmount(prevState => (!prevState))} className="cursor-pointer flex flex-row flex-shrink-0 items-center bg-[#DCE3F2] p-1 w-[80px] h-[44px] rounded-full shadow-[inset_0_1px_3px_#B8C9E0,0_2px_0_#ffffff]">
                            <div className={`w-[36px] h-[36px] rounded-full transition-all ease-in duration-150 shadow-[0_2px_4px_-2px_#555566] ${unlimitedAmount ? 'ml-[36px] bg-[#474B55]' : 'ml-0 bg-[#FFFFFF] shadow-slate-400'}`}></div>
                        </div>
                    </div>

                    <button onClick={handleSubmitAllowanceForm} className="mt-[35px] font-semibold h-[44px] w-full bg-active-black rounded-[4px] text-offwhite shadow-[0_4px_8px_#5b93ec40,0_8px_16px_#5b93ec40]">Send / Set Allowance</button>
                </form>
                { /* <p className="mx-auto my-[20px]">{supply}</p> */ }
            </div>
            <TokenPanel ownedTokens={ownedTokens}/>
        </DashboardLayout>
    )
}

/*interface IFormAllowance {
    erc20Address : {
        value : string
        touched : boolean
        error : string
    },
    ownerAddress : {
        value : string
        touched : boolean
        error : string
    },
    spenderAddress : {
        value : string
        touched : boolean
        error : string
    },
    spenderName : {
        value : string
        touched : boolean
        error : string
    },
    allowedAmount : {
        value : number | "unlimited"
        touched : boolean
        error : string
    },
}*/

interface IFormAllowance{
    ERC20TokenAddress: string
    ownerAddress: string
    spenderAddress: string
    spenderName : string
    amount : string // | "unlimited" // biginit
}

/*switch(input.id){
    case 'amountInput' :
        setAllowanceForm(form => ({...form, allowedAmount : {...form.allowedAmount, value : parseFloat(input.value), touched : true}})) // float?
    break;
    case 'contractInput' :
        setAllowanceForm(form => ({...form, erc20Addr : {...form.erc20Addr, value : input.value, touched : true}}))
    break;
    case 'ownerInput' :
        setAllowanceForm(form => ({...form, ownerAddr : {...form.ownerAddr, value : input.value, touched : true}}))
    break;
    case 'spenderInput' :
        setAllowanceForm(form => ({...form, spenderAddr : {...form.spenderAddr, value : input.value, touched : true}}))
    break;
}*/


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


/*const untouchedAllowanceForm : IFormAllowance = {
        erc20Address : {
            value : existingAllowance?.tokenContractAddress ?? '',
            touched : false,
            error : ''
        },
        ownerAddress : {
            value : existingAllowance?.ownerAddress ?? '',
            touched : false,
            error : ''
        },
        spenderAddress : {
            value : existingAllowance?.spenderAddress ?? '',
            touched : false,
            error : ''
        },
        spenderName : {
            value : existingAllowance?.spenderName ?? '',
            touched : false,
            error : ''
        },
        allowedAmount : {
            value : Number(existingAllowance?.amount ?? 0), // !!! fix error in console
            touched : false,
            error : ''
        },
    }

    const [allowanceForm, setAllowanceForm] = useState<IFormAllowance>(
        {...untouchedAllowanceForm, 
            ownerAddress : {
                value : defaultWalletAddress, // !!!
                touched : false,
                error : ''
            },
        }
    )*/