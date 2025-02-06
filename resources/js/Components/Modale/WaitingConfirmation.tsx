import './Modal.css'
import logo from '@/assets/mainlogo.png'

export default function WaitingConfirmation(){
    return(
        <div className='m-y-auto px[1.5rem] py-[10px] flex flex-col items-center w-full gap-y-[20px]'>
            <img alt="main logo" className='element element1 w-[176px]' src={logo}/>
            <h3 className="w-full text-center font-bold text-[22px]">Waiting for your confirmation...</h3>
            <span className="pulse-element text-[16px]">Please, check your Metamask wallet.</span>
        </div>
    )
}