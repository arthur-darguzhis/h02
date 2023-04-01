export const checkFieldsInErrorMessage = (
  response,
  errors: Array<{ field: string; message: string }>,
) => {
  expect(response.body.errorsMessages.length).toBe(errors.length);

  expect(response.body).toEqual({
    errorsMessages: errors.map((error) => {
      return {
        field: error.field,
        message: error.message,
      };
    }),
  });
};
