export default class DateUtils{
    static toEUFormat(str : string){
        if(!this.isISODateValid(str)) return "xx/xx/xxxx"
        return new Date(str).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          })
    }

    static isISODateValid(str : string){
        const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}Z$/
        return dateRegex.test(str)
    }
}