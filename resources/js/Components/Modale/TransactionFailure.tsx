import validIcon from '@/assets/icons/validicon.png'
import VariousUtils from '@/utils/VariousUtils'

export default function TransactionFailure({failureMessage, hash, closeModal} : {failureMessage : string, hash : string, closeModal : () => void}){
    return(
        <div className="flex flex-col w-full gap-y-[5px]">
            <img className='h-[56px] w-[56px] mt-[12px] self-center' src={validIcon}/>
            <h3 className="mt-[23px] w-full text-center font-bold text-[22px]">Your transaction has been validated.</h3>
            {/*<hr className='mt-[15px]'/>*/}
            <div style={{overflowWrap: 'break-word', wordWrap: 'break-word', wordBreak:'break-all'}} className="mt-[20px] flex flex-grow-0 justify-center">
                {/*successMessage*/}
                Check the details of this transaction on :
            </div>
            <p className="flex flex-grow-0 justify-center text-[13px]"><a className='underline text-slate-500' href={'https://holesky.etherscan.io/tx/' + hash} target="_blank" rel="noopener noreferrer">{'https://holesky.etherscan.io/tx/' + VariousUtils.maskHash(hash as `0x${string}`)}</a></p>
            <button onClick={closeModal} className="max-w-[500px] self-center mt-[30px] font-semibold h-[44px] w-full rounded-[4px] text-offwhite bg-gradient-to-r from-[#303030] to-[#4C5054] shadow-[0_4px_8px_#CBC7C5]">Close</button>
        </div>
    )
}