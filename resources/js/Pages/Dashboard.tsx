import Table from '@/Components/Dashboard/Table/Table';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { IAllowance } from '@/types/IAllowance';
import { usePage } from '@inertiajs/react';
import { type PageProps } from "@inertiajs/core";
import { useEffect, useRef } from 'react';
import BlankTable from '@/Components/Dashboard/Table/BlankTable';
import { useSDK } from '@metamask/sdk-react';
import checked from '@/assets/checked.png'
import searchIcon from '@/assets/icons/searchIcon.svg'
import useSnackbar from '@/hooks/useSnackbar';
import { useEtherClientsContext } from '@/hooks/useEtherClientsContext';
import useDashboardControls from '@/hooks/useDashboardControls';
import { useModalContext } from '@/context/ModalContext';

export default function Dashboard() {

    const { flash, allowances} = usePage<IPageProps>().props

    const { modal } = useModalContext()
    const { connected } = useSDK()
    const { setSnackbarMessage } = useSnackbar()

    const { searchValue, setSearchValue, showUnlimitedOnly, setShowUnlimitedOnly, showRevoked, setShowRevoked , updateDashboard } = useDashboardControls()

    useEffect(() => {
        if(flash?.success) setSnackbarMessage(flash.success)
    }, [flash.success])

    // reset the table filters & the search bar when resetFilters == true is sent as a prop by the backend
    useEffect(() => {
        if(flash?.resetFilters){
            // perfs : should use only one state for all three options
            setSearchValue('')
            setShowRevoked(false)
            setShowUnlimitedOnly(false)
        }
    }, [flash.resetFilters])

    function handleDisplayRevoked(e : React.MouseEvent<HTMLDivElement>){
        setShowUnlimitedOnly(false)
        const newShowRevoked = !showRevoked
        setShowRevoked(prevShowRevoked => !prevShowRevoked)
        updateDashboard({ showRevoked: newShowRevoked, showUnlimitedOnly: false, searchValue })
    }

    function handleDisplayUnlimitedOnly(e : React.MouseEvent<HTMLDivElement>){
        setShowRevoked(false)
        const newUnlimited = !showUnlimitedOnly
        setShowUnlimitedOnly(prev => !prev)
        updateDashboard({ showRevoked: false, showUnlimitedOnly: newUnlimited, searchValue })
    }

    // display only the allowances associated with the active wallet address
    const { walletClient, addressRef } = useEtherClientsContext()
   
    /*useEffect(() => {
        debouncedSearch(searchValue);
        return () => debouncedSearch.cancel();
    }, [searchValue, debouncedSearch]);*/
    
    function handleSearchInput(e: React.ChangeEvent<HTMLInputElement>) {
        const value = e.target.value
        setSearchValue(value)
    }

    function handleEmptySearchTermClick(){
        setSearchValue("")
    }
    
    const inputRef = useRef<HTMLInputElement | null>(null);
    function handleFocusInput(){
        if(inputRef) inputRef.current?.focus()
    }

    function handleClearFilter(event: React.MouseEvent<HTMLDivElement>): void {
        setShowRevoked(false)
        setShowUnlimitedOnly(false)
        setSearchValue("")
        updateDashboard({showRevoked : false, showUnlimitedOnly: false, searchValue : ""})
    }

    return(
        <>
            <div id="allowanceListContainer" className='w-full flex flex-col bg-component-white rounded-3xl overflow-hidden p-[40px] border border-solid border-dashcomponent-border'>
                <h1 className='text-[36px] font-bold font-oswald text-offblack leading-[34px] translate-y-[-6px]'>{showUnlimitedOnly ? 'UNLIMITED' : showRevoked ? 'REVOKED' : 'ACTIVE'} ALLOWANCES</h1>
                <div className='flex justify-between h-[44px] mt-[25px]'>
                    <div onClick={handleFocusInput} className='cursor-text flex pl-[16px] pr-[16px] w-[250px] h-[40px] mt-auto items-center justify-between rounded-full bg-[#FDFDFE] outline-1 outline outline-[#E1E3E6] focus:outline-1 focus:outline-[#F86F4D]'>
                        <input spellCheck="false" ref={inputRef} disabled={!allowances || !connected} placeholder='Search' className='border-none outline-none bg-none h-[40px]' type="text" onInput={handleSearchInput} value={searchValue} />
                        {searchValue == "" ? 
                            <img alt="search icon" onClick={handleFocusInput} className='cursor-text' src={searchIcon}/> : 
                            <svg onClick={handleEmptySearchTermClick} className='cursor-pointer translate-y-[1px]' width="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                                <path fill="#303030" d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/>
                            </svg>}
                    </div>
                    <div className='flex  gap-x-[10px]'>
                        <div onClick={allowances && connected ? handleDisplayUnlimitedOnly : undefined} className={'flex justify-center items-center gap-x-[10px] bg-[hsl(210,25%,100%)] px-[15px] rounded-[6px] shadow-[0_1px_2px_#A8B0BD10,0_3px_6px_#5D81B930]' + (allowances && connected ? ' cursor-pointer' : '')}>
                            <label id='unlimitedLabel' className={'flex items-center text-[14px]' + (allowances && connected ? ' cursor-pointer' : '')}>Unlimited only</label>
                            <div role="checkbox" aria-checked={showUnlimitedOnly} className={'border-[1px] border-solid border-[#48494c] h-[14px] w-[14px] rounded-[3px] flex justify-center items-center' + (!showUnlimitedOnly ? ' bg-[#eef0f2]' : ' bg-[#48494c]') + (allowances && connected ? ' cursor-pointer' : '')}>
                                {showUnlimitedOnly && <img alt="checkbox image" src={checked}/>}
                            </div>
                        </div>
                        <div onClick={allowances && connected ? handleDisplayRevoked :undefined} className={'flex justify-center items-center gap-x-[10px] bg-[hsl(210,25%,100%)] px-[15px] rounded-[6px] shadow-[0_1px_2px_#A8B0BD10,0_3px_6px_#5D81B930]' + (allowances && connected ? ' cursor-pointer' : '')}>
                            <label id='revokedLabel' className={'flex items-center text-[14px]' + (allowances && connected ? ' cursor-pointer' : '')}>Revoked only</label>
                            <div role="checkbox" aria-checked={showRevoked} className={'border-[1px] border-solid border-[#48494c] h-[14px] w-[14px] rounded-[3px] flex justify-center items-center' + (!showRevoked ? ' bg-[#eef0f2]' : ' bg-[#48494c]') + (allowances && connected ? ' cursor-pointer' : '')}>
                                {showRevoked && <img alt="checkbox image" src={checked}/>}
                            </div>
                        </div>
                        <div onClick={allowances && connected ? handleClearFilter :undefined} className={'flex justify-center items-center gap-x-[10px] bg-[hsl(210,25%,100%)] px-[15px] rounded-[6px] shadow-[0_1px_2px_#A8B0BD10,0_3px_6px_#5D81B930]' + (allowances && connected ? ' cursor-pointer' : '')}>
                            <label id='clearFiltersLabel' className={'flex items-center text-[14px]' + (allowances && connected ? ' cursor-pointer' : '')}>Clear filters</label>
                            <svg className='opacity-90' width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10 11.4L12.9 14.3C13.0833 14.4833 13.3167 14.575 13.6 14.575C13.8833 14.575 14.1167 14.4833 14.3 14.3C14.4833 14.1167 14.575 13.8833 14.575 13.6C14.575 13.3167 14.4833 13.0833 14.3 12.9L11.4 10L14.3 7.1C14.4833 6.91667 14.575 6.68333 14.575 6.4C14.575 6.11667 14.4833 5.88333 14.3 5.7C14.1167 5.51667 13.8833 5.425 13.6 5.425C13.3167 5.425 13.0833 5.51667 12.9 5.7L10 8.6L7.1 5.7C6.91667 5.51667 6.68333 5.425 6.4 5.425C6.11667 5.425 5.88333 5.51667 5.7 5.7C5.51667 5.88333 5.425 6.11667 5.425 6.4C5.425 6.68333 5.51667 6.91667 5.7 7.1L8.6 10L5.7 12.9C5.51667 13.0833 5.425 13.3167 5.425 13.6C5.425 13.8833 5.51667 14.1167 5.7 14.3C5.88333 14.4833 6.11667 14.575 6.4 14.575C6.68333 14.575 6.91667 14.4833 7.1 14.3L10 11.4ZM10 20C8.61667 20 7.31667 19.7373 6.1 19.212C4.88334 18.6867 3.825 17.9743 2.925 17.075C2.025 16.1757 1.31267 15.1173 0.788001 13.9C0.263335 12.6827 0.000667932 11.3827 1.26582e-06 10C-0.000665401 8.61733 0.262001 7.31733 0.788001 6.1C1.314 4.88267 2.02633 3.82433 2.925 2.925C3.82367 2.02567 4.882 1.31333 6.1 0.788C7.318 0.262667 8.618 0 10 0C11.382 0 12.682 0.262667 13.9 0.788C15.118 1.31333 16.1763 2.02567 17.075 2.925C17.9737 3.82433 18.6863 4.88267 19.213 6.1C19.7397 7.31733 20.002 8.61733 20 10C19.998 11.3827 19.7353 12.6827 19.212 13.9C18.6887 15.1173 17.9763 16.1757 17.075 17.075C16.1737 17.9743 15.1153 18.687 13.9 19.213C12.6847 19.739 11.3847 20.0013 10 20ZM10 18C12.2333 18 14.125 17.225 15.675 15.675C17.225 14.125 18 12.2333 18 10C18 7.76667 17.225 5.875 15.675 4.325C14.125 2.775 12.2333 2 10 2C7.76667 2 5.875 2.775 4.325 4.325C2.775 5.875 2 7.76667 2 10C2 12.2333 2.775 14.125 4.325 15.675C5.875 17.225 7.76667 18 10 18Z" fill="#303030"/>
                            </svg>
                        </div>
                    </div>
                </div>
                {
                    allowances && walletClient?.account?.address ? 
                    <Table 
                        allowances={allowances} 
                        setSnackbarMessage={setSnackbarMessage}
                    /> : 
                    <BlankTable/>
                }
            </div>
        </>
    )
}

Dashboard.layout = (page: React.ReactNode) => <DashboardLayout children={page}/>

interface IPageProps extends PageProps {
    flash: {
      success?: string
      message? : string
      error? : string
      resetFilters? : boolean
    };

    success?: string
    accountAddress?: string
    mockAccountPrivateKey?: string
    allowances ?: IAllowance[]
}


    /*const refreshDashboard = useCallback((walletAddress : string | null) => {
        router.get(route('dashboard'), {
            showRevoked,
            searchValue,
            showUnlimitedOnly,
            walletAddress
        }, {
            preserveState: true,
            replace: true,
            preserveScroll: true,
            preserveUrl: true,
            only: ['allowances', 'flash', 'success'],
        });
    }, [showRevoked, searchValue, showUnlimitedOnly])*/