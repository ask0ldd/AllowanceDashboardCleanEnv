import hhTokens from "@/constants/deployedTokens";
import { WalletAccountNotFoundError } from "@/errors/WalletAccountNotFoundError";
import { THexAddress } from "@/types/THexAddress";
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

    async getTokenName(publicClient : PublicClient, tokenAddress : THexAddress){
        try{
            // if(publicClient) throw new Error("PublicClient is not initialized") // !!!!
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

    async getTokenNSymbol(publicClient : PublicClient, tokenAddress: THexAddress): Promise<{ name: string, symbol: string }> {
        try {
            // if(!this.publicClient) throw new Error("PublicClient is not initialized") // !!!!
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

    async getTotalSupply(publicClient : PublicClient, contractAddress : `0x${string}`) : Promise<string>{
        try{
            // if(!this.publicClient) throw new Error("PublicClient is not initialized") // !!!!
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

    async revokeAllowance({publicClient, walletClient, contractAddress, spenderAddress} : {publicClient : PublicClient, walletClient : WalletClient, contractAddress : THexAddress, spenderAddress : THexAddress}){
        return await this.setAllowance({
            publicClient, walletClient,
            contractAddress, 
            spenderAddress, 
            amount: BigInt(0)
        })
    }

    async readAllowance({publicClient, contractAddress, ownerAddress, spenderAddress} : {publicClient : PublicClient, contractAddress : THexAddress, ownerAddress : THexAddress, spenderAddress : THexAddress}) : Promise<ReadContractReturnType>{
        try {
            // if(!this.publicClient) throw new Error("PublicClient is not initialized") // !!!!
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

    async setAllowance({publicClient, walletClient, contractAddress, spenderAddress, amount} : {publicClient : PublicClient, walletClient : WalletClient, contractAddress : THexAddress, spenderAddress : THexAddress, amount : bigint}) : Promise<`0x${string}` /*TransactionReceipt*/>{
        try{
            // const parsedAmount = parseUnits('20000', 18) // why parse?
            // if (!walletClient || !publicClient) throw new Error('You must connect your wallet to initiate such a transaction.')
        
            if (!walletClient.account) throw new WalletAccountNotFoundError()

            const hash = await walletClient.sendTransaction({
                account : walletClient.account,
                to: contractAddress,
                data: encodeFunctionData({
                    abi: this.ERC20abis.setAllowance,
                    functionName: 'approve',
                    args: [spenderAddress, amount] // Use parsed amount
                }),
                chain: holesky
            })

            // This hash merely indicates that the transaction was submitted, not that it was successful in executing the intended function
            // const receipt = await publicClient.waitForTransactionReceipt({ hash }) // after the backend job
        
            return hash // receipt
        }catch(error){
            console.error("Can't set the requested allowance : ", error)
            throw error
        }
    }

    async getReceipt(publicClient : PublicClient, hash : `0x${string}`) : Promise<TransactionReceipt> {
        // !!! should format receipt to json
        return await publicClient.waitForTransactionReceipt({ hash })
    }

    async setAllowanceToUnlimited({publicClient, walletClient, contractAddress, spenderAddress} : {publicClient : PublicClient, walletClient : WalletClient, contractAddress : THexAddress, spenderAddress : THexAddress}) : Promise<`0x${string}` /*TransactionReceipt*/>{
        return this.setAllowance({publicClient, walletClient, contractAddress, spenderAddress, amount : this.maxUint256})
    }

    // !!! use viem getbalance instead ?
    async getBalance(publicClient : PublicClient, tokenAddress : THexAddress, walletAddress : THexAddress) : Promise<bigint>{
        try{
            /*
            const balance = await Promise.race([
                balancePromise,
                new Promise((_, reject) => setTimeout(() => reject(new Error('Network timeout')), 5000))
            ])*/ // might be needed if network down

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

    // !!! test with only 5 working contracts
    // how to deal with errors? when only one promise fails?
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

    getSymbols(){
        return this.deployedTokens.map(token => token.symbol)
    }

    /*sendMoney(){ // !!! clean key

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

/*
getKnownDeployedTokens(){
    return this.deployedTokens
}*/


/*
    try {
    const blockNumber = await client.getBlockNumber()
    } catch (e) {
    const error = e as GetBlockNumberErrorType
    
    if (error.name === 'InternalRpcError') {
        console.log(error.code) // -32603
    }
    
    if (error.name === 'HttpRequestError') {
        console.log(error.headers)
        console.log(error.status)
    }
    }
*/

/*
const account: PrivateKeyAccount = privateKeyToAccount(mockAccountPrivateKey as THexAddress)
const request = await this.publicClient.prepareTransactionRequest({
    account,
    to: contractAddress,
    data: encodeFunctionData({
        abi : this.ERC20abis.setAllowance,
        functionName: 'approve',
        args: [spenderAddress, amount]
    }),
    chain: this.publicClient.chain,
    // !!! really useful?!!!
    maxFeePerGas: 150000000000n, // !!! The absolute maximum amount a user is willing to pay per unit of gas
    maxPriorityFeePerGas: 1000000000n, // The highest amount offered as a tip to validators for each unit of gas consumed
    // nonce: 1, // A unique number that represents the count of transactions sent from a particular address !!!!! how to setup ??? !!!
    type: 'eip1559', // Refers to the specific format and fields included in the transaction.
})

const serializedTransaction = await this.publicClient.account.signTransaction({...request})*/