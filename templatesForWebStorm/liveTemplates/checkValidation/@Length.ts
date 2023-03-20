import { faker } from '@faker-js/faker';
import { HttpStatus } from '@nestjs/common';

it('should throw an error if "name" is less than 1 characters', async () => {
  const response = await sendTestRequest(
    { ...dto, name: faker.datatype.string(1 - 1) },
    HttpStatus.BAD_REQUEST,
  );

  checkFieldsInErrorMessage(response, ['name']);
});

it('should throw an error if "name" is more than 15 characters', async () => {
  const response = await sendTestRequest(
    { ...dto, name: faker.datatype.string(15 + 1) },
    HttpStatus.BAD_REQUEST,
  );

  checkFieldsInErrorMessage(response, ['name']);
});
