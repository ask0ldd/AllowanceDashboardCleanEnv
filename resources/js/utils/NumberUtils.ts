export default class NumberUtils{
    /**
     * Checks if a number is a float.
     * @param {number} num - The number to check.
     * @returns {boolean} True if the number is a float, false otherwise.
     */
    static isFloat(num : number): boolean {
        return Number(num) === num && num % 1 !== 0
    }

    /**
     * Adds decimal places to a number if it's not already a float.
     * @param {number} num - The number to add decimals to.
     * @returns {string} The number as a string with decimal places.
     */
    static addDecimals(num : number) : string{
        return this.isFloat(num) ? `${num}` : `${num}.00`
    }

    /**
     * Checks if a string contains only digits.
     * @param {string} str - The string to check.
     * @returns {boolean} True if the string contains only digits, false otherwise.
     */
    static isNumber(str : string) : boolean {
        return /^\d+$/.test(str)
    }

    /**
     * Adds thousands separators to a number.
     * @param {number|bigint} num - The number to format.
     * @returns {string} The formatted number as a string with thousands separators.
     */
    static addThousandsSeparators(num : number | bigint) : string{
        const strNum = typeof num === 'bigint' ? num.toString() : `${num}`
        const parts = strNum.split('.')
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.')
        return parts.join(',')
    }

    static formatNumber(num: number | bigint): string {
        const absNum = Math.abs(Number(num))
        const sign = num < 0 ? "-" : ""
        
        if (absNum < 1000) {
            return sign + absNum.toString()
        }
        
        const exponent = Math.floor(Math.log10(absNum))
        const mantissa = absNum / Math.pow(10, Math.floor(exponent / 3) * 3)
        
        if (mantissa >= 1 && mantissa < 10000) {
            return `${sign}${mantissa.toFixed(0)} * 10^${Math.floor(exponent / 3) * 3}`
        } else {
            const adjustedMantissa = mantissa / 1000
            const adjustedExponent = Math.floor(exponent / 3) * 3 + 3
            return `${sign}${adjustedMantissa.toFixed(3).replace(/\.?0+$/, '')} * 10^${adjustedExponent}`
        }
    }
    
}