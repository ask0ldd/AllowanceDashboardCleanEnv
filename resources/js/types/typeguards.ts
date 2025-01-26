import { THexAddress } from "./THexAddress";

export function isHexAddress(value: unknown): value is THexAddress {
    return typeof value === 'string' && /^0x[0-9A-Fa-f]+$/.test(value);
}