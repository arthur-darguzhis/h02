export const unhandledRejectionHandler = (): void => {
  process.on('unhandledRejection', (reason: Error | any, promise) => {
    console.log(`Unhandled Rejection: ${reason.message || reason}`);
    //TODO добавить отправку сообщения на email
    process.exit(1);
  });
};
