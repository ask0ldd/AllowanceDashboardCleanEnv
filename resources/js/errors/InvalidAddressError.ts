export class InvalidAddressError extends Error {
    constructor(message?: string) {
      super(message || 'The provided Ethereum address is invalid.');
      this.name = 'InvalidAddressError';
      
      Object.setPrototypeOf(this, InvalidAddressError.prototype);
    }
  }