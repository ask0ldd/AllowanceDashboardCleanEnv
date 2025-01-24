export default class NumberUtils{
    static isFloat(n : number) {
        return Number(n) === n && n % 1 !== 0;
    }

    static addDecimals(num : number){
        return this.isFloat(num) ? `${num}` : `${num}.00`
    }
}