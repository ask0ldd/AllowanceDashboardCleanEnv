/**
 * Utility class for handling Ethereum-like blockchain addresses
 * @class
 * @description Provides methods for address validation and masking
 */
export default class AddressUtils{

    /**
     * Masks an Ethereum-like address by truncating the middle portion
     * @param {`0x${string}`} fullAddress - Full blockchain address starting with '0x'
     * @returns {`0x${string}...${string}` | undefined} Masked address or undefined if invalid
     * @example
     * maskAddress('0x1234abcd...5678efgh') // Returns '0x123...efgh'
     */
    static maskAddress(fullAddress : `0x${string}`) : `0x${string}...${string}` | undefined {
        if (!this.isValidAddress(fullAddress)) {
            return undefined
        }
        const maskedPart = '...'
        const startVisiblePart = fullAddress.slice(0, 5).toLowerCase() as `0x${string}`
        const endVisiblePart = fullAddress.slice(-5).toLowerCase()
        return `${startVisiblePart}${maskedPart}${endVisiblePart}`
    }
    
    /**
     * Validates if a given string is a valid Ethereum-style address
     * @param {string} address - The address to validate
     * @returns {boolean} True if address is valid, false otherwise
     * @example
     * // returns true
     * AddressUtils.isValidAddress("0xa1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0")
     * // returns false
     * AddressUtils.isValidAddress("invalidaddress")
     */
    static isValidAddress(address: string): address is `0x${string}` {
        return /^0x[a-fA-F0-9]{40}$/.test(address);
    }
}