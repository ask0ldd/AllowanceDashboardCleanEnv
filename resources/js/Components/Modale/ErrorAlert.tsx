import errorIcon from '@/assets/icons/erroricon.png'

export default function ErrorAlert({errorMessage, closeModal} : {errorMessage : string, closeModal : () => void}){
    return(
        <div className="flex flex-col w-full gap-y-[20px]">
            {/*<div className="flex flex-shrink-0 justify-center items-center self-center w-[52px] h-[52px] bg-[#fad0dd] rounded-full">
                <div className="flex flex-grow-0 justify-center items-center w-[36px] h-[36px] bg-[#cb4052bb] rounded-full">
                </div>
            </div>*/}
            <img className='h-[56px] w-[56px] mt-[8px] self-center' src={errorIcon}/>
            <h3 className="w-full text-center font-bold text-[20px]">Error</h3>
            <div style={{overflowWrap: 'break-word', wordWrap: 'break-word', wordBreak:'break-all'}} className="flex flex-grow-0 justify-center">{errorMessage}</div>
            <button onClick={closeModal} className="font-semibold h-[44px] w-full rounded-[4px] text-offwhite bg-gradient-to-r from-[#303030] to-[#4C5054] shadow-[0_4px_8px_#CBC7C5]">Close</button>
        </div>
    )
}