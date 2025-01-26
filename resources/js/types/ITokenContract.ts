import { THexAddress } from "./THexAddress"

export interface ITokenContract{
    id?: number
    created_at: string
    updated_at: string
    token_address_id: number
    address: THexAddress
    name: string
    symbol: string
    decimals: number
}