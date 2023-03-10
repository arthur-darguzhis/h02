export class DomainException extends Error {
  public property: string;
  constructor(message, property = null) {
    super(message);
    this.property = property;
  }
}
