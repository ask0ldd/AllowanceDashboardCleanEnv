import metamask from '@/assets/images/metamask.svg'

export default function InfoPanel(){
    return(
        <div className="flex flex-row gap-x-[10px] justify-center items-center h-20 bg-component-white rounded-3xl overflow-hidden p-3 border border-solid border-dashcomponent-border shadow-component-grey">
            <img className='w-[42px]' src={metamask}/>
            0x58730ae0faa10d73b0cddb5e7b87c3594f7a20cb
        </div>
    )
}