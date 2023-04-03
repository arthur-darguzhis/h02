export const wait = (milliseconds: number): Promise<void> => {
  return new Promise((resolve, _) => {
    setTimeout(() => {
      resolve();
    }, milliseconds);
  });
};
