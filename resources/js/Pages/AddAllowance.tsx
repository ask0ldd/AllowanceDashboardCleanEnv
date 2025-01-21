import DashboardLayout from "@/Layouts/DashboardLayout";
import { FormEvent, useState } from "react";

export default function AddAllowance() {

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

    function handleSetInput(e: FormEvent<HTMLInputElement>): void {
        e.preventDefault()
        const input = (e.target as HTMLInputElement)
        switch(input.id){
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
        }
    }

    return(
        <DashboardLayout>
            <div id="allowanceFormContainer" className='flex flex-col max-w-[800px] mx-auto bg-component-white rounded-3xl overflow-hidden p-[40px] border border-solid border-dashcomponent-border'>
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
            </div>
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