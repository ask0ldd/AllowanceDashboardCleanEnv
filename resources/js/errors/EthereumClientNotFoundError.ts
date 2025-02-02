export class EthereumClientNotFoundError extends Error {
    constructor(message?: string) {
      super(message || 'You must connect your wallet to initiate such a transaction.');
      this.name = 'EthereumClientNotFoundError';
      
      Object.setPrototypeOf(this, EthereumClientNotFoundError.prototype);
    }
  }