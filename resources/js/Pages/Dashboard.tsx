import Table from '@/Components/Dashboard/Table/Table';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { IAllowance } from '@/types/IAllowance';
import { usePage } from '@inertiajs/react';
import type { PageProps } from "@inertiajs/core";
import { useEffect, useState } from 'react';
import { THexAddress } from '@/types/THexAddress';
import useModalManager from '@/hooks/useModalManager';
import BlankTable from '@/Components/Dashboard/Table/BlankTable';
import useErrorHandler from '@/hooks/useErrorHandler';

export default function Dashboard() {

    const { flash, success, accountAddress, mockAccountPrivateKey, allowances } = usePage<IPageProps>().props

    // const account: PrivateKeyAccount = privateKeyToAccount("0xc526ee95bf44d8fc405a158bb884d9d1238d99f0612e9f33d006bb0789009aaa") // !!! should use wallet instead

    const {modalVisibility, modalContentId, setModalStatus, errorMessageRef, showErrorModal, injectedComponentRef} = useModalManager({initialVisibility : false, initialModalContentId : "error"})

    const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null)

    useEffect(() => {
        if(flash?.success) setSnackbarMessage(flash.success)
    }, [flash.success])


    // !!! if accountAddress && mockAccountAddress null then BlankTable
    // !!! deal with no wallet connected

    return(
        <DashboardLayout snackbarMessage={snackbarMessage ?? ""} setModalStatus={setModalStatus} modalVisibility={modalVisibility} errorMessageRef={errorMessageRef} modalContentId={modalContentId} injectedComponentRef={injectedComponentRef}>
            <div id="allowanceListContainer" className='w-full flex flex-col bg-component-white rounded-3xl overflow-hidden p-[40px] border border-solid border-dashcomponent-border'>
                <h1 className='text-[36px] font-bold font-oswald text-offblack leading-[34px] translate-y-[-6px]'>ACTIVE ALLOWANCES</h1>
                {allowances ? <Table showErrorModal={showErrorModal} setModalStatus={setModalStatus} accountAddress={accountAddress as THexAddress} allowances={allowances} setSnackbarMessage={setSnackbarMessage}/> : <BlankTable/>}
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