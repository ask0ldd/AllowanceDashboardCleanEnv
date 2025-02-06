export default interface IFormAllowance{
    ERC20TokenAddress : string
    ownerAddress : string
    spenderAddress : string
    spenderName : string
    amount : string
    isUnlimited : boolean
}