import hhTokens from "@/constants/deployedTokens";
import { InvalidAddressError } from "@/errors/InvalidAddressError";
import { InvalidHashError } from "@/errors/InvalidHashError";
import { PublicClientUnavailableError } from "@/errors/PublicClientUnavailableError";
import { WalletAccountNotFoundError } from "@/errors/WalletAccountNotFoundError";
import { THexAddress } from "@/types/THexAddress";
import { isHexAddress } from "@/types/typeguards";
import AddressUtils from "@/utils/AddressUtils";
import VariousUtils from "@/utils/VariousUtils";
import { encodeFunctionData, parseAbi, PublicClient, ReadContractReturnType, TransactionReceipt, WalletClient } from "viem"
import { holesky } from 'viem/chains'

export default class ERC20TokenService{
    
    readonly ERC20abis = {
        setAllowance : parseAbi(['function approve(address spender, uint256 amount) returns (bool)']),
        getAllowance : parseAbi(['function allowance(address owner, address spender) returns (uint256)']),
        doTransfer : parseAbi(['function transfer(address to, uint256 amount) returns (bool)']),
        getTotalSupply : parseAbi(['function totalSupply() returns (uint256)']),
        getBalance : parseAbi(['function balanceOf(address account) view returns (uint256)']),
    } as const

    readonly maxUint256 = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')

    private deployedTokens = hhTokens

    /**
     * Retrieves the name of a token from its contract.
     * @async
     * @param {PublicClient} publicClient - The public client used to interact with the blockchain.
     * @param {THexAddress} tokenAddress - The address of the token contract.
     * @throws {PublicClientUnavailableError} If the public client is not available.
     * @throws {InvalidAddressError} If the token address is invalid.
     * @throws {Error} If there's an error retrieving the token name.
     */
    async getTokenName(publicClient : PublicClient, tokenAddress : THexAddress){
        try{
            if(!publicClient) throw new PublicClientUnavailableError()
            if(AddressUtils.isValidAddress(tokenAddress)) throw new InvalidAddressError()
            const tokenName = await publicClient.readContract({
            address: tokenAddress,
            abi: [{ 
                name: 'name',
                type: 'function',
                inputs: [],
                outputs: [{ type: 'string' }],
                stateMutability: 'view'
            }],
            functionName: 'name',
            })
            
            console.log(`Token name: ${tokenName}`)
        }catch(error){
            console.error("Can't retrieve the target token name : ", error)
            throw error
        }
    }

    /**
     * Retrieves both the name and symbol of a token from its contract.
     * @async
     * @param {PublicClient} publicClient - The public client used to interact with the blockchain.
     * @param {THexAddress} tokenAddress - The address of the token contract.
     * @returns {Promise<{name: string, symbol: string}>} An object containing the token's name and symbol.
     * @throws {PublicClientUnavailableError} If the public client is not available.
     * @throws {InvalidAddressError} If the token address is invalid.
     * @throws {Error} If there's an error retrieving the token information or if the retrieved information is invalid.
     */
    async getTokenNSymbol(publicClient : PublicClient, tokenAddress: THexAddress): Promise<{ name: string, symbol: string }> {
        try {
            if(!publicClient) throw new PublicClientUnavailableError()
            if(AddressUtils.isValidAddress(tokenAddress)) throw new InvalidAddressError()
            const nameAbi = [{ name: 'name', type: 'function', outputs: [{ type: 'string' }] }]
            const symbolAbi = [{ name: 'symbol', type: 'function', outputs: [{ type: 'string' }] }]
    
            const nameContract = { address: tokenAddress, abi: nameAbi }
            const symbolContract = { address: tokenAddress, abi: symbolAbi }
    
            const [name, symbol] = await Promise.all([
                publicClient.readContract({
                    ...nameContract,
                    functionName: 'name',
                }),
                publicClient.readContract({
                    ...symbolContract,
                    functionName: 'symbol',
                })
            ])
    
            if (!name || !symbol || typeof name !== 'string' || typeof symbol !== 'string') {
                throw new Error("Invalid token informations.")
            }
    
            return { name, symbol };
        } catch (error) {
            console.error("Can't retrieve the target token name & symbol: ", error)
            throw error
        }
    }

    /**
     * Retrieves the total supply of a token from its contract.
     * @async
     * @param {PublicClient} publicClient - The public client used to interact with the blockchain.
     * @param {`0x${string}`} contractAddress - The address of the token contract.
     * @returns {Promise<string>} The total supply of the token.
     * @throws {PublicClientUnavailableError} If the public client is not available.
     * @throws {InvalidAddressError} If the contract address is invalid.
     * @throws {Error} If there's an error retrieving the total supply.
     */
    async getTotalSupply(publicClient : PublicClient, contractAddress : `0x${string}`) : Promise<string>{
        try{
            if(!publicClient) throw new PublicClientUnavailableError()
                if(AddressUtils.isValidAddress(contractAddress)) throw new InvalidAddressError()
            const abi = this.ERC20abis.getTotalSupply
            const supply = await publicClient.readContract({
                address: contractAddress,
                abi,
                functionName: 'totalSupply',
                args: []
            })
            return supply
        } catch (error) {
            console.error(`Can't retrieve the total token supply for the ${contractAddress} contract : `, error)
            throw error
        }
    }

    /**
     * Revokes the allowance for a specific spender on a given token contract.
     * @async
     * @param {Object} params - The parameters for revoking allowance.
     * @param {WalletClient} params.walletClient - The wallet client used to sign and send the transaction.
     * @param {THexAddress} params.contractAddress - The address of the token contract.
     * @param {THexAddress} params.spenderAddress - The address of the spender whose allowance is being revoked.
     * @returns {Promise<`0x${string}`>} The transaction hash of the revoke operation.
     * @throws {Error} If there's an error during the revocation process.
     */
    async revokeAllowance({walletClient, contractAddress, spenderAddress} : {walletClient : WalletClient, contractAddress : THexAddress, spenderAddress : THexAddress}) : Promise<`0x${string}`> {
        return await this.setAllowance({
            walletClient,
            contractAddress, 
            spenderAddress, 
            amount: BigInt(0)
        })
    }

    /**
     * Reads the allowance for a given token, owner, and spender.
     * @async
     * @param {Object} params - The parameters for reading the allowance.
     * @param {PublicClient} params.publicClient - The public client instance.
     * @param {THexAddress} params.contractAddress - The token contract address.
     * @param {THexAddress} params.ownerAddress - The address of the token owner.
     * @param {THexAddress} params.spenderAddress - The address of the spender.
     * @returns {Promise<ReadContractReturnType>} The allowance amount.
     * @throws {PublicClientUnavailableError} If the public client is not available.
     * @throws {InvalidAddressError} If any of the provided addresses are invalid.
     */
    async readAllowance({publicClient, contractAddress, ownerAddress, spenderAddress} : {publicClient : PublicClient, contractAddress : THexAddress, ownerAddress : THexAddress, spenderAddress : THexAddress}) : Promise<ReadContractReturnType>{
        try {
            if(!publicClient) throw new PublicClientUnavailableError()
            if (!AddressUtils.isValidAddress(contractAddress)) throw new InvalidAddressError('Invalid token address')
            if (!AddressUtils.isValidAddress(ownerAddress)) throw new InvalidAddressError('Invalid owner address')
            if (!AddressUtils.isValidAddress(spenderAddress)) throw new InvalidAddressError('Invalid spender address')
            const allowance = await publicClient.readContract({
                address: contractAddress,
                abi : this.ERC20abis.getAllowance,
                functionName: 'allowance',
                args: [ownerAddress, spenderAddress]
            })
            return allowance
        } catch (error) {
            console.error("Can't reading the target allowance :", error)
            throw error
        }
    }

    /**
     * Sets an allowance for a given token and spender.
     * @async
     * @param {Object} params - The parameters for setting the allowance.
     * @param {WalletClient} params.walletClient - The wallet client instance.
     * @param {THexAddress} params.contractAddress - The token contract address.
     * @param {THexAddress} params.spenderAddress - The address of the spender.
     * @param {bigint} params.amount - The amount to set as allowance.
     * @returns {Promise<`0x${string}`>} The transaction hash.
     * @throws {Error} If the amount is not a BigInt.
     * @throws {InvalidAddressError} If any of the provided addresses are invalid.
     * @throws {WalletAccountNotFoundError} If the wallet account is not found.
     */
    async setAllowance({walletClient, contractAddress, spenderAddress, amount} : {walletClient : WalletClient, contractAddress : THexAddress, spenderAddress : THexAddress, amount : bigint}) : Promise<`0x${string}`>{
        try{
            if (typeof amount !== 'bigint') {
                throw new Error('Amount must be a BigInt.')
            }
            if (!AddressUtils.isValidAddress(contractAddress)) throw new InvalidAddressError('Invalid token address')
            if (!AddressUtils.isValidAddress(spenderAddress)) throw new InvalidAddressError('Invalid spender address')
        
            if (!walletClient.account) throw new WalletAccountNotFoundError()

            const hash = await walletClient.sendTransaction({
                account : walletClient.account,
                to: contractAddress,
                data: encodeFunctionData({
                    abi: this.ERC20abis.setAllowance,
                    functionName: 'approve',
                    args: [spenderAddress, amount < this.maxUint256 ? amount : this.maxUint256]
                }),
                chain: holesky
            })
        
            return hash
        }catch(error){
            console.error("Can't set the requested allowance : ", error)
            throw error
        }
    }

    /**
     * Retrieves the transaction receipt for a given transaction hash.
     * @async
     * @param {PublicClient} publicClient - The public client instance.
     * @param {`0x${string}`} hash - The transaction hash.
     * @returns {Promise<TransactionReceipt>} The transaction receipt.
     * @throws {PublicClientUnavailableError} If the public client is not available.
     * @throws {InvalidHashError} If the provided hash is invalid.
     */
    async getReceipt(publicClient : PublicClient, hash : `0x${string}`) : Promise<TransactionReceipt> {
        try{
            if(!publicClient) throw new PublicClientUnavailableError()
            if(!VariousUtils.isValidEthereumHash(hash)) throw new InvalidHashError()
            return await publicClient.waitForTransactionReceipt({ hash })
        }catch(error){
            console.error("Can't retrieve the receipt for this transaction : ", hash)
            throw error
        }
    }

    /**
     * Sets the allowance to the maximum possible value (unlimited).
     * @async
     * @param {Object} params - The parameters for setting unlimited allowance.
     * @param {WalletClient} params.walletClient - The wallet client instance.
     * @param {THexAddress} params.contractAddress - The token contract address.
     * @param {THexAddress} params.spenderAddress - The address of the spender.
     * @returns {Promise<`0x${string}`>} The transaction hash.
     */
    async setAllowanceToUnlimited({walletClient, contractAddress, spenderAddress} : {walletClient : WalletClient, contractAddress : THexAddress, spenderAddress : THexAddress}) : Promise<`0x${string}`>{
        return this.setAllowance({walletClient, contractAddress, spenderAddress, amount : this.maxUint256})
    }

    /**
     * Gets the token balance for a given address.
     * @async
     * @param {PublicClient} publicClient - The public client instance.
     * @param {THexAddress} tokenAddress - The token contract address.
     * @param {THexAddress} walletAddress - The address to check the balance for.
     * @returns {Promise<bigint>} The token balance.
     * @throws {PublicClientUnavailableError} If the public client is not available.
     * @throws {InvalidAddressError} If any of the provided addresses are invalid.
     */
    async getBalance(publicClient : PublicClient, tokenAddress : THexAddress, walletAddress : THexAddress) : Promise<bigint>{
        try{
            /*
            const balance = await Promise.race([
                balancePromise,
                new Promise((_, reject) => setTimeout(() => reject(new Error('Network timeout')), 5000))
            ])*/ // might be needed if network down
            if(!publicClient) throw new PublicClientUnavailableError()
            if (!AddressUtils.isValidAddress(tokenAddress)) throw new InvalidAddressError('Invalid token address')
            if (!AddressUtils.isValidAddress(walletAddress)) throw new InvalidAddressError('Invalid wallet address')

            const balance = await publicClient.readContract({
                address: tokenAddress,
                abi: this.ERC20abis.getBalance,
                functionName: 'balanceOf',
                args: [walletAddress]
            })
        
            return balance
        }catch(error){
            console.error(`Can't retrieve the balance for the contract ${tokenAddress}, account ${walletAddress} pair :`, error)
            throw error
        }
    }

    /**
     * Retrieves the balances of multiple tokens for a given wallet address.
     * 
     * @async
     * @param {PublicClient} publicClient - The public client used for blockchain interactions.
     * @param {THexAddress[]} tokenAddresses - An array of token addresses to check balances for.
     * @param {THexAddress} walletAddress - The wallet address to check balances for.
     * @returns {Promise<Record<THexAddress, bigint>>} A promise that resolves to an object mapping token addresses to their respective balances.
     * @throws {Error} If there are errors fetching balances for specific tokens (errors are logged to console).
     */
    async getAllBalances(publicClient : PublicClient, tokenAddresses : THexAddress[], walletAddress : THexAddress): Promise<Record<THexAddress, bigint>> {
        const balances: Record<THexAddress, bigint> = {}      
        const errors: Error[] = [];

        await Promise.all(
            tokenAddresses.map(async (tokenAddress) => {
                try {
                    const balance = await this.getBalance(publicClient, tokenAddress, walletAddress)
                    if (balance !== undefined) {
                        balances[tokenAddress] = balance
                    }
                } catch (error) {
                    errors.push(new Error(`Failed to get the balance for the token ${tokenAddress}: ${error}`))
                }
            })
        )

        if (errors.length > 0) {
            console.error('Errors occurred while fetching balances :', errors)
        }
        
        return balances
    }

    /**
     * Retrieves the symbols of all deployed tokens.
     * 
     * @returns {string[]} An array of token symbols.
     */
    getSymbols(): string[]{
        return this.deployedTokens.map(token => token.symbol)
    }

    /**
     * Checks if a given address is a contract address.
     * 
     * @async
     * @param {PublicClient} publicClient - The public client used for blockchain interactions.
     * @param {THexAddress} address - The address to check.
     * @returns {Promise<boolean>} A promise that resolves to true if the address is a contract, false otherwise.
     * @throws {Error} If there's an error checking the address (error is logged to console).
     */
    async isContract(publicClient : PublicClient, address: THexAddress): Promise<boolean> {
        if(!isHexAddress(address)) return false
        try {
            const bytecode = await publicClient.getCode({
              address
            })
            
            // If bytecode exists and is not '0x', it's a contract
            return bytecode !== undefined && bytecode.length > 2
        } catch (error) {
            console.error('Error checking address:', error)
            return false
        }
    }

    /*sendTokens(){

        const walletClient = createWalletClient({
            account, // : address,
            chain: holesky,
            transport : custom(window.ethereum)
        })

        const hash = walletClient.sendTransaction({
            to: "0xbc389292158700728d014d5b2b6237bfd36fa09c",
            value: parseEther("0.0001"),
        });
    }*/

    /* Multicall not supported by the Hardhat devnet
    async getTokenNSymbol(tokenAddress : THexAddress) : Promise<{name : string, symbol : string} | undefined>{
        try{
            const [name, symbol] = await this.client.multicall({
                contracts: [
                    {
                        address: tokenAddress,
                        abi: [{ name: 'name', type: 'function', outputs: [{ type: 'string' }] }],
                        functionName: 'name',
                    },
                    {
                        address: tokenAddress,
                        abi: [{ name: 'symbol', type: 'function', outputs: [{ type: 'string' }] }],
                        functionName: 'symbol',
                    },
                ],
            })

            if (name?.status !== "success" || symbol?.status !== "success") {
                throw new Error("Failed to retrieve token information")
            }
            
            if (!("result" in name) || !("result" in symbol)) {
                throw new Error("Missing result in token information")
            }
            
            if (typeof(name.result) !== "string" || typeof(symbol.result) !== "string") {
                throw new Error("Invalid token information format")
            }

            return {name : name.result, symbol : symbol.result}
        }catch(error){
            console.error("Can't retrieve target token name & symbol : ", error)
            return undefined
        }
    }
    */
}