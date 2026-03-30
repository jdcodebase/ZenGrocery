export const parseInput = (input) => {
  if (!input) return null;

  const value = input.toLowerCase().trim();

  if (value.includes("kg")) {
    const num = parseFloat(value.replace("kg", "").trim());
    return isNaN(num) ? null : { value: num, unit: "kg", mode: "price" };
  }

  if (value.includes("g")) {
    const num = parseFloat(value.replace("g", "").trim());
    return isNaN(num) ? null : { value: num, unit: "g", mode: "price" };
  }

  const num = parseFloat(value);
  return isNaN(num) ? null : { value: num, unit: null, mode: "weight" };
};
