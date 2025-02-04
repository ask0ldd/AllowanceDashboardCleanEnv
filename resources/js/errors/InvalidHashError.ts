export class InvalidHashError extends Error {
    constructor(message?: string) {
      super(message || 'The provided hash is invalid or does not meet the required format.');
      this.name = 'InvalidHashError';
      
      Object.setPrototypeOf(this, InvalidHashError.prototype);
    }
  }