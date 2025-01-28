/* eslint-disable @typescript-eslint/no-unused-vars */
import { ReactNode, useEffect, useRef } from 'react'
import './Modal.css'

function Modal({children, modalVisibility, setModalStatus, /*modalContent,*/ containerCSSClass, width} : IProps){

    const dialogRef = useRef<HTMLDialogElement>(null)
    const modalVisibilityRef = useRef<boolean>(modalVisibility)

    const isMouseDownInsideModal = useRef<boolean>(false)
    
    useEffect(() => {
        if(modalVisibilityRef && !dialogRef.current?.open) return dialogRef.current?.showModal()
        if(!modalVisibilityRef && dialogRef.current?.open) return dialogRef.current?.close()
    })

    // the following events handler prevent the modal from being closed by releasing the mouse button outside of it
    // useful when the user makes big gestures when selecting modal text elements
    /**
     * Handles click events on the modal.
     * Prevents closing the modal when releasing the mouse button outside after a drag action started inside.
     * 
     * @function handleOnClick
     * @param {React.MouseEvent} e - The mouse event object.
     * @returns {void}
     */
    function handleOnClick(e : React.MouseEvent) : void{
        if (isMouseDownInsideModal.current && (e.target as HTMLDialogElement).nodeName === 'DIALOG') {
            e.preventDefault()
            e.stopPropagation()
            return
        }
    }

    /**
     * Handles mouse down events on the modal.
     * Determines if the mouse down event occurred inside or outside the modal.
     * 
     * @function handleMouseDown
     * @param {React.MouseEvent} e - The mouse event object.
     * @returns {void}
     */
    function handleMouseDown(e: React.MouseEvent) : void {
        const dialogElement = e.target as HTMLDialogElement

        if(dialogElement.nodeName !== 'DIALOG') {
            isMouseDownInsideModal.current = true
            return
        }
        
        const rect = dialogElement.getBoundingClientRect()
        const isInDialog = (
            rect.top <= e.clientY &&
            e.clientY <= rect.top + rect.height &&
            rect.left <= e.clientX &&
            e.clientX <= rect.left + rect.width
        )
        
        if (!isInDialog) {
            isMouseDownInsideModal.current = false
        } else {
            isMouseDownInsideModal.current = true
        }
    }

    /**
     * Handles mouse up events on the modal.
     * Closes the modal if the mouse up event occurred outside the modal content.
     * 
     * @function handleMouseUp
     * @param {React.MouseEvent} e - The mouse event object.
     * @returns {void}
     */
    function handleMouseUp(e : React.MouseEvent): void{
        if (isMouseDownInsideModal.current) return
        e.preventDefault()
        e.stopPropagation()
        isMouseDownInsideModal.current = false
        if ((e.target as HTMLDialogElement).nodeName === 'DIALOG') setModalStatus({visibility : false})
    }
    
    return (
        <dialog style={width ? {width : width} : {}} data-testid="modal" ref={dialogRef} 
            onClick={handleOnClick} onMouseUp={handleMouseUp} onMouseDown={handleMouseDown}
            onCancel={(e) => e.preventDefault()}>
                <div className='modalHorizPadding'></div>
                <div className='modalVertPaddingNChildrenContainer'>
                    <div className='modalVertPadding'></div>
                    {children}
                    <div className='modalVertPadding'></div>
                </div>
                <div className='modalHorizPadding'></div>
        </dialog> 
    )
}

export default Modal

interface IProps{
    children: ReactNode
    modalVisibility : boolean
    containerCSSClass? : string
    setModalStatus : ({visibility, contentId} : {visibility : boolean, contentId? : string}) => void
    width ?: string
}