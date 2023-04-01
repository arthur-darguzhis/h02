import { BadRequestException, ValidationPipe } from '@nestjs/common';

export const validationPipe = new ValidationPipe({
  transform: true,
  stopAtFirstError: true,
  exceptionFactory: (errors) => {
    const errorsForResponse = [];
    errors.forEach((e) => {
      for (const key in e.constraints) {
        errorsForResponse.push({
          field: e.property,
          message: e.constraints[key],
        });
      }
    });
    throw new BadRequestException(errorsForResponse);
  },
});
