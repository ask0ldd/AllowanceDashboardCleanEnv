import './Snackbar.css'
import useSnackbar from '@/hooks/useSnackbar'

export default function Snackbar(){
    
    const { snackbarMessage, isVisible } = useSnackbar()

    return(
        <div className='snackbar' style={{ display: isVisible ? 'flex' : 'none'}}>
            {snackbarMessage?.split('::')[1]}
        </div>
    )
}