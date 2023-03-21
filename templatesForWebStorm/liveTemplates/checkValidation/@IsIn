it('should throw an error if "sortBy" is not one of the following: name, description, websiteUrl, createdAt."', async () => {
  const response = await sendTestRequest(
    { ...dto, sortBy: 'nonexistent property' },
    HttpStatus.BAD_REQUEST,
  );

  //TODO set here break point ant then take info from response.body.errorsMessages[0].sortBy
  checkFieldsInErrorMessage(response, ['sortBy']);
});
