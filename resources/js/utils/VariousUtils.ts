export default class VariousUtils{
    static isValidEthereumHash(hash: string): boolean {
        const ethereumHashRegex = /^0x[a-fA-F0-9]{64}$/;
        return ethereumHashRegex.test(hash);
    }

    static maskHash(fullHash : `0x${string}`) : `0x${string}...${string}` | undefined {
        const maskedPart = '...'
        const startVisiblePart = fullHash.slice(0, 5).toLowerCase() as `0x${string}`
        const endVisiblePart = fullHash.slice(-5).toLowerCase()
        return `${startVisiblePart}${maskedPart}${endVisiblePart}`
    }
}