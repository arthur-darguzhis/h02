import { DomainException } from './domain.exception';

export class EntityAlreadyExistsException extends DomainException {
  public property: string;
  constructor(message, property) {
    super(message);
    this.property = property;
  }
}
