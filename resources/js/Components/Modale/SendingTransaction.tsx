import './Modal.css'
import logo from '@/assets/mainlogo.png'

export default function SendingTransaction(){
    return(
        <div className='m-y-auto px[1.5rem] py-[10px] flex flex-col items-center w-full gap-y-[25px]'>
            <img className='element element1 w-[176px]' src={logo}/>
            <span className="pulse-element font-semibold text-[16px]">Sending your transaction...</span>
        </div>
    )
}