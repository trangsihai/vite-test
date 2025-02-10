export const exchangeRate = (from?: number, to?: number) =>
  from && to ? from / to : 1;

export const delay = (t: number) => {
  return new Promise((resolve) => setTimeout(resolve, t));
};
