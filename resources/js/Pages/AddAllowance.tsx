import TokenPanel from "@/Components/TokenPanel/TokenPanel";
import { useServices } from "@/hooks/useServices";
import DashboardLayout from "@/Layouts/DashboardLayout";
import AllowanceService from "@/services/AllowanceService";
import ERC20TokenService from "@/services/ERC20TokenService";
import MetaMaskService from "@/services/MetaMaskService";
import { THexAddress } from "@/types/THexAddress";
import { FormEvent, useEffect, useState } from "react";

export default function AddAllowance() {

    const [supply, setSupply] = useState<string>()
    const [unlimitedAmount, setUnlimitedAmount] = useState<boolean>(false)
    const [walletAddress, setWalletAddress] = useState<THexAddress>()

    const {metamaskService, erc20TokenService} = useServices()

    async function read(){
        try{
            const as = new AllowanceService()

            const metamaskAddress = await metamaskService.getWalletAddress()
            if(metamaskAddress) {
                setWalletAddress(metamaskAddress)
                console.log("metamask address : ", metamaskAddress)
            }

            const readSupply = await erc20TokenService.getTotalSupply("0x5FbDB2315678afecb367f032d93F642f64180aa3")
            if(readSupply) setSupply(readSupply)
            
            const receipt = await as.setAllowance({
                contractAddress : "0x5FbDB2315678afecb367f032d93F642f64180aa3", 
                spenderAddress : "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199", 
                amount: BigInt(20000)
            })
            if(receipt) console.log("Receipt : ", receipt)
            
            const allowance = await as.readAllowance({
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
    }, [])

    const defaultWalletAddress = "0x58730ae0faa10d73b0cddb5e7b87c3594f7a20cb"

    const untouchedAllowanceForm : IFormAllowance = {
        erc20Addr : {
            value : '',
            touched : false,
            error : ''
        },
        ownerAddr : {
            value : '',
            touched : false,
            error : ''
        },
        spenderAddr : {
            value : '',
            touched : false,
            error : ''
        },
        spenderName : {
            value : '',
            touched : false,
            error : ''
        },
        allowedAmount : {
            value : 0,
            touched : false,
            error : ''
        },
    }

    const [allowanceForm, setAllowanceForm] = useState<IFormAllowance>(
        {...untouchedAllowanceForm, 
            ownerAddr : {
                value : defaultWalletAddress,
                touched : false,
                error : ''
            },
        }
    )

    function handleSendAllowanceForm(e : React.MouseEvent<HTMLButtonElement>) : void {
        e.preventDefault()
        if(!isAllowanceFormValid()) return
    }

    function isAllowanceFormValid(){
        return false
    }

    const textinputClasses = "px-[10px] mt-[6px] fill-w h-[44px] rounded-[4px] outline-1 outline outline-dashcomponent-border focus:outline-2"
    const labelClasses = "mt-[25px] font-medium text-[#474B55]"

    const inputsPropsMap : Record<string, string> = {
        'amountInput' : 'allowedAmount',
        'contractInput' : 'erc20Addr',
        'ownerInput' : 'ownerAddr',
        'spenderInput' : 'spenderAddr',
        'spenderNameInput' : 'spenderName',
    }

    function handleSetInput(e: FormEvent<HTMLInputElement>): void {
        e.preventDefault()
        const input = (e.target as HTMLInputElement)
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
        setAllowanceForm(form => ({...form, [inputsPropsMap[input.id]] : {...[inputsPropsMap[input.id]], value : input.id == "amountInput" ? parseFloat(input.value) : input.value, touched : true}}))
    }

    useEffect(() => {
        if(unlimitedAmount) return setAllowanceForm(form => ({...form, allowedAmount : {...form.allowedAmount, value : "unlimited"}}))
        return setAllowanceForm(form => ({...form, allowedAmount : {...form.allowedAmount, value : 0}}))
    }, [unlimitedAmount])

    // modal with token name, symbol
    // modal contract doesn't not exist

    return(
        <DashboardLayout>
            <TokenPanel/>
            <div id="allowanceFormContainer" className='flex grow shrink flex-col bg-component-white rounded-3xl overflow-hidden p-[40px] pt-[35px] border border-solid border-dashcomponent-border'>
                <h1 className='mx-auto max-w-[580px] w-full text-[36px] leading-[34px] font-bold font-oswald' style={{color:'#474B55'}}>SET A NEW ALLOWANCE</h1>
                <p className="border-l border-[#a2bbE0] border-solid pl-3 italic mx-auto max-w-[580px] w-full mt-6 leading-snug text-[14px]">By setting this allowance, you will authorize a specific address (spender) to withdraw a fixed number of tokens from the selected ERC20 token contract. Exercise extreme caution and only grant allowances to entities you fully trust. Unlimited allowances should be avoided.</p>
                <form className="mx-auto flex flex-col max-w-[580px] w-full">
                    
                    <label className={labelClasses}>Token Contract Address</label>
                    <input id="contractInput" placeholder="0x20c...a20cb" type="text" value={allowanceForm.erc20Addr.value} className={textinputClasses} onInput={(e) => handleSetInput(e)}/>
                    
                    <label className={labelClasses}>Owner Address</label>
                    <input id="ownerInput" placeholder="0x20c...a20cb" type="text" value={allowanceForm.ownerAddr.value} className={textinputClasses} onInput={(e) => handleSetInput(e)}/>
                    
                    <label className={labelClasses}>Spender Address</label>
                    <input id="spenderInput" placeholder="0x20c...a20cb" type="text" value={allowanceForm.spenderAddr.value} className={textinputClasses} onInput={(e) => handleSetInput(e)}/>
                    
                    <label className={labelClasses}>Spender Name (optional)</label>
                    <input id="spenderNameInput" placeholder="0x20c...a20cb" type="text" value={allowanceForm.spenderName.value} className={textinputClasses} onInput={(e) => handleSetInput(e)}/>
                    
                    <label className={labelClasses}>Amount</label>
                    <div className="flex flex-row mt-[6px] gap-x-[15px]">
                        <input readOnly={unlimitedAmount} id="amountInput" type={unlimitedAmount ? "text" : "number"} style={{marginTop:0}} min={0} className={textinputClasses + ' w-full' + (unlimitedAmount ? ' bg-[#DCE3F2]' : '')} value={allowanceForm.allowedAmount.value} onInput={(e) => handleSetInput(e)}/>
                        <div onClick={() => setUnlimitedAmount(prevState => (!prevState))} className="cursor-pointer flex flex-row flex-shrink-0 items-center bg-[#DCE3F2] p-1 w-[80px] h-[44px] rounded-full shadow-[inset_0_1px_3px_#B8C9E0,0_2px_0_#ffffff]">
                            <div className={`w-[36px] h-[36px] bg-[#474B55] rounded-full transition-all ease-in duration-150 ${unlimitedAmount ? 'ml-[36px]' : 'ml-0'}`}></div>
                        </div>
                    </div>

                    <button onClick={handleSendAllowanceForm} className="mt-[35px] font-semibold h-[44px] w-full bg-active-black rounded-[4px] text-offwhite shadow-[0_4px_8px_#5b93ec40,0_8px_16px_#5b93ec40]">Send Allowance</button>
                </form>
                { /* <p className="mx-auto my-[20px]">{supply}</p> */ }
            </div>
            <TokenPanel/>
        </DashboardLayout>
    )
}

interface IFormAllowance {
    erc20Addr : {
        value : string
        touched : boolean
        error : string
    },
    ownerAddr : {
        value : string
        touched : boolean
        error : string
    },
    spenderAddr : {
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
}