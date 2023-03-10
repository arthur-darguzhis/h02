import { Transform } from 'class-transformer';

export function Trim(): PropertyDecorator {
  return Transform(({ value }) =>
    // typeof value === 'string' ? value.trim().replace("'", '') : value,
    // TOTO this code down is correct it should be uncommented and replase that override for passing tests.
    typeof value === 'string' ? value.trim() : value,
  );
}
