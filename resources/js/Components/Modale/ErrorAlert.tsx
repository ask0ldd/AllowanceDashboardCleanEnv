import errorIcon from '@/assets/icons/erroricon.png'

export default function ErrorAlert({errorMessage, closeModal} : {errorMessage : string, closeModal : () => void}){
    return(
        <div className="flex flex-col w-full gap-y-[10px]">
            <img alt="error icon" className='h-[56px] w-[56px] mt-[8px] self-center' src={errorIcon}/>
            <h3 className="w-full text-center font-bold mt-[10px] text-[22px]">An error occurred</h3>
            <div style={{overflowWrap: 'break-word', wordWrap: 'break-word', wordBreak:'break-all'}} className="flex flex-grow-0 mt-[3px] justify-center">{errorMessage}</div>
            <button onClick={closeModal} className="font-semibold mt-[15px] h-[44px] w-full rounded-[4px] text-offwhite bg-gradient-to-r from-[#303030] to-[#4C5054] shadow-[0_4px_8px_#CBC7C5]">Close</button>
        </div>
    )
}