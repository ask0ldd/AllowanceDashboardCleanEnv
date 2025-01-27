import { THexAddress } from "./THexAddress"

/*export interface IAllowance{
    id : number
    ERC20TokenAddress : THexAddress
    ownerAddress : THexAddress
    spenderAddress : THexAddress
    spenderName? : string
    date : string
    amount : number
}*/

export interface IAllowance {
    id: number;
    tokenContractId: number
    ownerAddressId: number
    spenderAddressId: number
    amount: bigint
    spenderName? : string
    transaction_hash: `0x${string}`
    tokenContractAddress: THexAddress
    tokenContractSymbol: string
    tokenContractName: string
    ownerAddress: THexAddress
    spenderAddress: THexAddress
    createdAt: string
    updatedAt: string
    isUnlimited : boolean
}