import Table from '@/Components/Dashboard/Table/Table';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { IAllowance } from '@/types/IAllowance';
import { usePage } from '@inertiajs/react';
import type { PageProps } from "@inertiajs/core";
import { useEffect, useMemo, useRef, useState } from 'react';
import useModalManager from '@/hooks/useModalManager';
import { router } from '@inertiajs/react'
import BlankTable from '@/Components/Dashboard/Table/BlankTable';
import { useSDK } from '@metamask/sdk-react';
import checked from '@/assets/checked.png'
import searchIcon from '@/assets/icons/searchIcon.svg'
import debounce from 'lodash/debounce';
import useSnackbar from '@/hooks/useSnackbar';

export default function Dashboard() {

    const { flash, allowances } = usePage<IPageProps>().props

    const { connected } = useSDK()

    const modal = useModalManager({initialVisibility : false, initialModalContentId : "error"})
    const { snackbarMessage, setSnackbarMessage } = useSnackbar()

    useEffect(() => {
        if(flash?.success) setSnackbarMessage(flash.success)
    }, [flash.success])

    const [showRevoked, setShowRevoked] = useState(false)
    function handleDisplayRevoked(e : React.MouseEvent<HTMLDivElement>){
        setShowUnlimitedOnly(false)
        const newShowRevoked = !showRevoked
        setShowRevoked(prevShowRevoked => !prevShowRevoked)
        // !!! should pass the wallet address too to filter
        router.get(route('dashboard'), {
            showRevoked: newShowRevoked,
            searchValue,
            showUnlimitedOnly : false
        }, {
            preserveState: true,
            replace: true,
            preserveScroll: true,
            preserveUrl: true,
            only: ['allowances', 'flash', 'success'],
        });
    }

    const [showUnlimitedOnly, setShowUnlimitedOnly] = useState(false)
    function handleDisplayUnlimitedOnly(e : React.MouseEvent<HTMLDivElement>){ // !!!
        setShowRevoked(false)
        const newUnlimited = !showUnlimitedOnly
        setShowUnlimitedOnly(prev => !prev)
        // !!! should pass the wallet address too to filter
        router.get(route('dashboard'), { 
            showRevoked : false, 
            searchValue, 
            showUnlimitedOnly : newUnlimited
        }, {
            preserveState: true,
            replace: true,
            preserveScroll: true,
            preserveUrl : true,
            only: ['allowances', 'flash', 'success'],
        });
    }

    const [searchValue, setSearchValue] = useState("")
    const debouncedSearch = useMemo(
        () => debounce((value: string) => {

            router.get(route('dashboard'), 
                { showRevoked, searchValue: value, showUnlimitedOnly}, 
                {
                    preserveState: true,
                    replace: true,
                    preserveScroll: true,
                    preserveUrl: true,
                    only: ['allowances'],
                }
            );
        }, 300),
        [showRevoked, router, showUnlimitedOnly]
    )
    
    useEffect(() => {
        debouncedSearch(searchValue);
        return () => debouncedSearch.cancel();
    }, [searchValue, debouncedSearch]);
    
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
    }

    /*useEffect(() => {
        if(!allowances || allowances.length == 0) alert('You should connect to your wallet.')
    }, [allowances])*/ // !!!!
    // snackbarMessage={snackbarMessage ?? ""} setSnackbarMessage={setSnackbarMessage}
    return(
        <DashboardLayout modal={modal}>
            <div id="allowanceListContainer" className='w-full flex flex-col bg-component-white rounded-3xl overflow-hidden p-[40px] border border-solid border-dashcomponent-border'>
                <h1 className='text-[36px] font-bold font-oswald text-offblack leading-[34px] translate-y-[-6px]'>{showUnlimitedOnly ? 'UNLIMITED' : showRevoked ? 'REVOKED' : 'ACTIVE'} ALLOWANCES</h1>
                <div className='flex justify-between h-[44px] mt-[25px]'>
                    <div onClick={handleFocusInput} className='cursor-text flex pl-[16px] pr-[16px] w-[240px] h-[40px] mt-auto items-center justify-between rounded-full bg-[#FDFDFE] outline-1 outline outline-[#E1E3E6] focus:outline-1 focus:outline-[#F86F4D]'>
                        <input spellCheck="false" ref={inputRef} disabled={!allowances || !connected} placeholder='Search' className='border-none outline-none bg-none h-[40px]' type="text" onInput={handleSearchInput} value={searchValue} />
                        {searchValue == "" ? 
                            <img onClick={handleFocusInput} className='cursor-text' src={searchIcon}/> : 
                            <svg onClick={handleEmptySearchTermClick} className='cursor-pointer translate-y-[1px]' width="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                                <path fill="#303030" d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/>
                            </svg>}
                    </div>
                    <div className='flex  gap-x-[10px]'>
                        <div onClick={allowances && connected ? handleDisplayUnlimitedOnly : undefined} className={'flex justify-center items-center gap-x-[10px] bg-[hsl(210,25%,100%)] px-[15px] rounded-[6px] shadow-[0_1px_2px_#A8B0BD10,0_3px_6px_#5D81B930]' + (allowances && connected ? ' cursor-pointer' : '')}>
                            <label id='unlimitedLabel' className={'flex items-center text-[14px]' + (allowances && connected ? ' cursor-pointer' : '')}>Unlimited only</label>
                            <div role="checkbox" aria-checked={showUnlimitedOnly} className={'border-[1px] border-solid border-[#48494c] h-[14px] w-[14px] rounded-[3px] flex justify-center items-center' + (!showUnlimitedOnly ? ' bg-[#eef0f2]' : ' bg-[#48494c]') + (allowances && connected ? ' cursor-pointer' : '')}>
                                {showUnlimitedOnly && <img src={checked}/>}
                            </div>
                        </div>
                        <div onClick={allowances && connected ? handleDisplayRevoked :undefined} className={'flex justify-center items-center gap-x-[10px] bg-[hsl(210,25%,100%)] px-[15px] rounded-[6px] shadow-[0_1px_2px_#A8B0BD10,0_3px_6px_#5D81B930]' + (allowances && connected ? ' cursor-pointer' : '')}>
                            <label id='revokedLabel' className={'flex items-center text-[14px]' + (allowances && connected ? ' cursor-pointer' : '')}>Revoked only</label>
                            <div role="checkbox" aria-checked={showRevoked} className={'border-[1px] border-solid border-[#48494c] h-[14px] w-[14px] rounded-[3px] flex justify-center items-center' + (!showRevoked ? ' bg-[#eef0f2]' : ' bg-[#48494c]') + (allowances && connected ? ' cursor-pointer' : '')}>
                                {showRevoked && <img src={checked}/>}
                            </div>
                        </div>
                        <div onClick={allowances && connected ? handleClearFilter :undefined} className={'flex justify-center items-center gap-x-[10px] bg-[hsl(210,25%,100%)] px-[15px] rounded-[6px] shadow-[0_1px_2px_#A8B0BD10,0_3px_6px_#5D81B930]' + (allowances && connected ? ' cursor-pointer' : '')}>
                            <label id='clearFiltersLabel' className={'flex items-center text-[14px]' + (allowances && connected ? ' cursor-pointer' : '')}>Clear filters</label>
                        </div>
                    </div>
                </div>
                {allowances && connected ? 
                    <Table 
                        allowances={allowances} 
                        setSnackbarMessage={setSnackbarMessage}
                        modal={modal}
                    /> : <BlankTable/>}
            </div>
        </DashboardLayout>
    )
}

interface IPageProps extends PageProps {
    flash: {
      success?: string
      message? : string
      error? : string
    };

    success?: string
    accountAddress?: string
    mockAccountPrivateKey?: string
    // allowances ?: IPaginatedResponse<IAllowance>
    allowances ?: IAllowance[]
}

// <div className='w-full flex flex-col bg-component-white rounded-3xl overflow-hidden p-[40px] border border-solid border-dashcomponent-border'>Connect your wallet to see the allowances linked to your account.</div>
/*
const handleFieldChange = (e) => {
  const { name, value } = e.target;
  form.setData(name, value);
  
  if (name === 'fieldThatNeedsDataFetch') {
    fetchAdditionalData(value);
  }
};
Fetch additional data:
Use Inertia's router.reload() method to fetch updated data from the server without a full page reload25.
javascript
const fetchAdditionalData = (value) => {
  router.reload({
    only: ['additionalData'],
    data: { fieldValue: value },
    preserveState: true,
    preserveScroll: true,
  });
};

public function index(Request $request)
{
    if ($request->has('fieldValue')) {
        $additionalData = // Fetch data based on $request->fieldValue
        return Inertia::render('YourComponent', [
            'additionalData' => $additionalData,
        ]);
    }
    
    // Regular page load logic
}
*/

/*return(
        <div className='bg-dash-grey w-full h-full min-h-full flex flex-col font-jost'>
            <Head title="Dashboard" />
            <Header/>
            <main>
                <div id="allowanceListContainer" className='w-full flex flex-col bg-component-white rounded-3xl overflow-hidden p-[40px] border border-solid border-dashcomponent-border shadow-component-grey'>
                    <h1 className='text-[36px] font-bold font-oswald text-offblack'>ACTIVE ALLOWANCES</h1>
                    <Table/>
                </div>
            </main>
        </div>
    )*/
    /*return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            You're logged in!
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );*/


    /*

    useEffect(() => {
        const storedAddress = localStorage.getItem('walletAddress');
        if (storedAddress) {
            setWalletAddress(storedAddress);
        }
    }, []);

    useEffect(() => {
        if (walletAddress && !allowances) {
            fetchAllowances();
        }
    }, [walletAddress]);

    const fetchAllowances = async () => {
        try {
            const response = await axios.get('/api/allowances', {
                params: { walletAddress }
            });
            setAllowances(response.data);
        } catch (error) {
            console.error('Error fetching allowances:', error);
        }
    };
    */