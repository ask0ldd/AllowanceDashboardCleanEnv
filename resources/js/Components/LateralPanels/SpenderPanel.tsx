import SpenderRow from "./SpenderRow"

function SpenderPanel({setSnackbarMessage} : {setSnackbarMessage : React.Dispatch<React.SetStateAction<string | null>>}){

    const pics = ["magiceden.jpg", "opensea.jpg", "pancakeswap.jpg", "farcaster.jpg", "oneinch.jpg", "decentraland.jpg", "binance.jpg", "bakeryswap.jpg", "rehold.jpg", "opensea.jpg", "pancakeswap.jpg", "uniswap.jpg"]

    return(
        <aside className="w-full max-w-[320px] h-fit flex flex-col bg-component-white rounded-3xl overflow-hidden p-[30px] pt-[30px] border border-solid border-dashcomponent-border">
            <h2 className='mx-auto mb-[18px] w-full text-[36px] leading-[34px] font-bold font-oswald' style={{color:'#474B55'}}>RECENT</h2>

            {new Array(10).fill(0).slice(0, 9).map((_, id) => (
                <SpenderRow key={'spenderRow' + id} spenderName={"Mock Name"} spenderAddress={"0x70997970C51812dc3A010C7d01b50e0d17dc79C8"} imgUrl={`/spenders/${pics[id]}`} setSnackbarMessage={setSnackbarMessage} />
            ))}
        </aside>
    )
}

export default SpenderPanel