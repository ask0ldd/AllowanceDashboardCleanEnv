import useModalManager from "@/hooks/useModalManager";
import DashboardLayout from "@/Layouts/DashboardLayout";
import logo from '@/assets/mainlogo.png'
import '@/Components/Modale/Modal.css'
import useSnackbar from "@/hooks/useSnackbar";

export default function Page404(){
    const modal = useModalManager({initialVisibility : false, initialModalContentId : 'error'})
    const { snackbarMessage, setSnackbarMessage } = useSnackbar()
    
    // snackbarMessage={snackbarMessage ?? ""} setSnackbarMessage={setSnackbarMessage}
    return(
        <DashboardLayout modal={modal}>
            <div className="text-[128px] text-center w-full">
                <div className="flex flex-col items-center gap-y-[10px]">
                    <img className="h-[176px] w-[176px] mt-[90px] element element1" src={logo}/>
                    <span className="font-oswald font-semibold mt-[20px] bg-gradient-to-r from-[#D86055] via-[#F86F4D] to-[#F8A053] text-transparent bg-clip-text opacity-85">ERROR 404</span>
                    
                    <span className="text-[30px] mt-[20px] text-[hsl(210,10%,65%)]">We apologize, but the page you are looking for does not exist or has been moved.</span>
                </div>
            </div>
        </DashboardLayout>        
    )
}