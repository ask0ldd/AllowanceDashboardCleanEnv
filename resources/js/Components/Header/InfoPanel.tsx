import metamask from '@/assets/images/metamask.svg'

export default function InfoPanel(){
    return(
        <div className="flex flex-row gap-x-[10px] justify-center items-center h-20 bg-component-white rounded-3xl overflow-hidden p-3 border border-solid border-dashcomponent-border shadow-component-grey">
            <img className='w-[42px]' src={metamask}/>
            0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
        </div>
    )
}