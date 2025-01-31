import Table from '@/Components/Dashboard/Table/Table';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { IAllowance } from '@/types/IAllowance';
import { usePage } from '@inertiajs/react';
import type { PageProps } from "@inertiajs/core";
import { useEffect, useState } from 'react';
import useModalManager from '@/hooks/useModalManager';
import { router } from '@inertiajs/react'
import BlankTable from '@/Components/Dashboard/Table/BlankTable';
import { useSDK } from '@metamask/sdk-react';

export default function Dashboard() {

    const { flash, allowances } = usePage<IPageProps>().props

    const { connected } = useSDK()

    const modal = useModalManager({initialVisibility : false, initialModalContentId : "error"})

    const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null)

    useEffect(() => {
        if(flash?.success) setSnackbarMessage(flash.success)
    }, [flash.success])

    const [showRevoked, setShowRevoked] = useState(false)
    function handleDisplayRevoked(e : React.ChangeEvent<HTMLInputElement>){
        setShowRevoked(prev => !prev)
        router.get(route('dashboard'), { showRevoked : e.currentTarget.checked, search: searchValue }, {
            preserveState: true,
            replace: true,
            preserveScroll: true,
            preserveUrl : true,
            only: ['allowances', 'flash', 'success'],
        });
    }

    const [showOnlyUnlimited, setOnlyUnlimited] = useState(false)
    function handleDisplayUnlimitedOnly(e : React.ChangeEvent<HTMLInputElement>){ // !!!
        setOnlyUnlimited(prev => !prev)
        /*router.get(route('dashboard'), { showRevoked : e.currentTarget.checked, search: searchValue }, {
            preserveState: true,
            replace: true,
            preserveScroll: true,
            preserveUrl : true,
            only: ['allowances'],
        });*/
    }

    const [searchValue, setSearchValue] = useState("")
    function handleSearchInput(e : React.KeyboardEvent<HTMLInputElement>){
        setSearchValue(e.currentTarget.value)
        router.get(route('dashboard'), { showRevoked, search: e.currentTarget.value }, {
            preserveState: true,
            replace: true,
            preserveScroll: true,
            preserveUrl : true,
            only: ['allowances'],
        });
    } // !!! debounce?*/

    return(
        <DashboardLayout snackbarMessage={snackbarMessage ?? ""} modal={modal}>
            <div id="allowanceListContainer" className='w-full flex flex-col bg-component-white rounded-3xl overflow-hidden p-[40px] border border-solid border-dashcomponent-border'>
                <h1 className='text-[36px] font-bold font-oswald text-offblack leading-[34px] translate-y-[-6px]'>ACTIVE ALLOWANCES</h1>
                <div className='flex justify-between h-[44px] mt-[25px]'>
                    <input placeholder='Search' className='px-[18px] w-[240px] h-[42px] mt-auto rounded-full bg-[#FDFDFE] outline-1 outline outline-[#E1E3E6] focus:outline-1 focus:outline-[#F86F4D]' type="search" onInput={handleSearchInput} value={searchValue} />
                    <div className='flex gap-x-[10px]'>
                        <div className='flex gap-x-[10px] bg-[#ffffff] px-[15px] rounded-[6px] shadow-[0_1px_2px_#A8B0BD10,0_3px_6px_#5D81B930]'>
                            <label id='unlimitedLabel' className='flex items-center'>Unlimited only</label>
                            <input aria-labelledby='unlimitedLabel' type="checkbox" onChange={handleDisplayUnlimitedOnly}/>
                        </div>
                        <div className='flex gap-x-[10px] bg-[#ffffff] px-[15px] rounded-[6px] shadow-[0_1px_2px_#A8B0BD10,0_3px_6px_#5D81B930]'>
                            <label id='revokedLabel' className='flex items-center'>Revoked allowances</label>
                            <input aria-labelledby='revokedLabel' type="checkbox" onChange={handleDisplayRevoked}/>
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