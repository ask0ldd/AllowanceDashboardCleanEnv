import TokenPanel from "@/Components/TokenPanel/TokenPanel";
import DashboardLayout from "@/Layouts/DashboardLayout";
import AllowanceService from "@/services/AllowanceService";
import ERC20TokenService from "@/services/ERC20TokenService";
import HardhatService from "@/services/HardhatService";
import { FormEvent, useEffect, useState } from "react";

export default function AddAllowance() {

    const [supply, setSupply] = useState<string>()

    async function read(){
        try{
            const hhs = new HardhatService()
            const readSupply = await hhs.readERC20Supply("0x5FbDB2315678afecb367f032d93F642f64180aa3")
            setSupply(readSupply)
            const as = new AllowanceService()
            
            const receipt = await as.setAllowance({
                contractAddress : "0x5FbDB2315678afecb367f032d93F642f64180aa3", 
                spenderAddress : "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199", 
                amount: BigInt(20000)
            })
            console.log("Receipt : ", receipt)
            
            const allowance = await as.readAllowance({
                contractAddress : "0x5FbDB2315678afecb367f032d93F642f64180aa3", 
                ownerAddress : "0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097", 
                spenderAddress : "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199"
            })
            console.log("Allowance : ", allowance)

            const erc20ts = new ERC20TokenService()
            const tokenInfos = await erc20ts.getTokenNSymbol("0x5FbDB2315678afecb367f032d93F642f64180aa3")
            if(tokenInfos != undefined) console.log(JSON.stringify(tokenInfos))
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

    const inputsPropsMap : Record<string, string> = {
        'amountInput' : 'allowedAmount',
        'contractInput' : 'erc20Addr',
        'ownerInput' : 'ownerAddr',
        'spenderInput' : 'allowedAmount',
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

    // modal with token name, symbol
    // modal contract doesn't not exist

    return(
        <DashboardLayout>
            <TokenPanel/>
            <div id="allowanceFormContainer" className='flex grow shrink flex-col bg-component-white rounded-3xl overflow-hidden p-[40px] border border-solid border-dashcomponent-border'>
                <h1 className='mx-auto max-w-[550px] w-full text-[36px] leading-[34px] font-bold font-oswald' style={{color:'#474B55'}}>SET A NEW ALLOWANCE</h1>
                <p className="italic mx-auto max-w-[550px] w-full mt-6 leading-snug text-[14px]">By setting this allowance, you will authorize a specific address (spender) to withdraw a fixed number of tokens from the selected ERC20 token contract. Exercise extreme caution and only grant allowances to entities you fully trust. Unlimited allowances should be avoided.</p>
                <form className="mx-auto flex flex-col max-w-[550px] w-full">
                    <label className="mt-[25px] font-medium" style={{color:'#474B55'}}>ERC-20 Contract Address</label>
                    <input id="contractInput" placeholder="0x20c...a20cb" type="text" value={allowanceForm.erc20Addr.value} className={textinputClasses} onInput={(e) => handleSetInput(e)}/>
                    <label className="mt-[25px] font-medium" style={{color:'#474B55'}}>Owner Address</label>
                    <input id="ownerInput" placeholder="0x20c...a20cb" type="text" value={allowanceForm.ownerAddr.value} className={textinputClasses} onInput={(e) => handleSetInput(e)}/>
                    <label className="mt-[25px] font-medium" style={{color:'#474B55'}}>Spender Address</label>
                    <input id="spenderInput" placeholder="0x20c...a20cb" type="text" value={allowanceForm.spenderAddr.value} className={textinputClasses} onInput={(e) => handleSetInput(e)}/>
                    <label className="mt-[25px] font-medium" style={{color:'#474B55'}}>Amount</label>
                    <input id="amountInput" type="number" min={0} className={textinputClasses} value={allowanceForm.allowedAmount.value} onInput={(e) => handleSetInput(e)}/>
                    <button onClick={handleSendAllowanceForm} className="mt-[35px] font-semibold h-[44px] w-full bg-active-black rounded-[4px] text-offwhite shadow-[0_4px_8px_#5b93ec40,0_8px_16px_#5b93ec40]">Send Allowance</button>
                </form>
                <p className="mx-auto my-[20px]">{supply}</p>
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
    allowedAmount : {
        value : number | "unlimited"
        touched : boolean
        error : string
    },
}