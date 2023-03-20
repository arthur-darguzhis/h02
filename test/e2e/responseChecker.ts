export const checkFieldsInErrorMessage = (response, fields: string[]) => {
  expect(response.body.errorsMessages.length).toBe(fields.length);

  expect(response.body).toEqual({
    errorsMessages: fields.map((fieldName) => {
      return {
        field: fieldName,
        message: expect.any(String),
      };
    }),
  });
};
