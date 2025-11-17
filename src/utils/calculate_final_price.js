// Helper function to calculate final price
export const calculateFinalPrice = (price, discountType, discountValue) => {
  if (!discountType || discountValue === null || discountValue === undefined) {
    return price;
  }

  let finalPrice = price;

  if (discountType === 'fixed') {
    finalPrice = price - discountValue;
  } else if (discountType === 'percentage') {
    finalPrice = price - (price * discountValue / 100);
  }

  // Ensure final price is not negative
  return Math.max(0, finalPrice);
};