export const addUnhandledRejectionListener = (): void => {
  if (
    process.listeners('unhandledRejection').includes(handleUnhandledRejection)
  ) {
    process.on('unhandledRejection', handleUnhandledRejection);
  }
};

const handleUnhandledRejection = (reason: Error | any, promise) => {
  console.log(`Unhandled Promise Rejection: ${reason.message || reason}`);
  //TODO добавить отправку сообщения на email
  process.exit(1);
};
