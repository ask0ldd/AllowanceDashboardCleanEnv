export class PublicClientUnavailableError extends Error {
    constructor(message?: string) {
      super(message || 'PublicClient not instanciated.');
      this.name = 'PublicClientUnavailableError';
      
      Object.setPrototypeOf(this, PublicClientUnavailableError.prototype);
    }
  }