export const calculateCostPerKg = (buyingPrice, quantity) => {
  if (!buyingPrice || !quantity) return 0;
  return Math.ceil(buyingPrice / quantity);
};

export const calculateMargin = (costPrice, sellingPrice) => {
  if (!costPrice || !sellingPrice) return 0;
  return (((sellingPrice - costPrice) / costPrice) * 100).toFixed(1);
};

export const calculateSellingPrice = (costPrice, percent) => {
  return Math.ceil(costPrice + (costPrice * percent) / 100);
};
