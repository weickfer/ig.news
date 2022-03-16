export class UnhandledEventError extends Error {
  constructor() {
    super('Unhandled event.')
    this.name = 'UnhandledEvent'
  }
}