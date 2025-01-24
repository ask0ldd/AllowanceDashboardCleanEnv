import Table from '@/Components/Dashboard/Table/Table';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { IAllowance } from '@/types/IAllowance';
import { useEffect } from 'react';

export default function Dashboard({allowances} : {allowances ?: IAllowance[]}) {

    // !!! deal with no wallet connected

    return(
        <DashboardLayout>
            <div id="allowanceListContainer" className='w-full flex flex-col bg-component-white rounded-3xl overflow-hidden p-[40px] border border-solid border-dashcomponent-border shadow-component-grey'>
                <h1 className='text-[36px] font-bold font-oswald text-offblack leading-[34px] translate-y-[-6px]'>ACTIVE ALLOWANCES</h1>
                {allowances ? <Table allowances={allowances}/> : <div className='w-full flex flex-col bg-component-white rounded-3xl overflow-hidden p-[40px] border border-solid border-dashcomponent-border shadow-component-grey'>Connect your wallet to see the allowances linked to your account.</div>}
            </div>
        </DashboardLayout>
    )
}

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