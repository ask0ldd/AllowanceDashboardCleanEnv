export default class ClipboardUtils{
    static async copy(text : string){
        try {
            await navigator.clipboard.writeText(text)
        } catch (err) {
            console.error('Failed to copy text: ', err)
        }
    }
}