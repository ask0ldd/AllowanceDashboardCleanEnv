export class WalletAccountNotFoundError extends Error {
    constructor(message?: string) {
      super(message || 'Transaction cannot be initiated: A wallet account must be selected first.');
      this.name = 'WalletAccountNotFoundError';
      
      Object.setPrototypeOf(this, WalletAccountNotFoundError.prototype);
    }
  }