import { useState } from "react";
import { calculatePriceAPI } from "../services/itemService";

export const usePriceCalculator = () => {
  const [mode, setMode] = useState("price"); // price | reverse
  const [inputValue, setInputValue] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const parseInput = (value, type) => {
    if (!value) return null;

    value = value.toLowerCase().trim();

    // 🟢 WEIGH ITEM
    if (type === "weighItem") {
      if (mode === "price") {
        if (value.includes("kg")) {
          return { value: parseFloat(value), unit: "kg" };
        }
        if (value.includes("g")) {
          return { value: parseFloat(value), unit: "g" };
        }
        return { value: parseFloat(value), unit: "kg" };
      } else {
        return { value: parseFloat(value.replace("₹", "")) };
      }
    }

    // 🔵 UNIT ITEM
    if (type === "unitItem") {
      return { value: parseFloat(value.replace("₹", "")) };
    }

    return null;
  };

  const handleCalculate = async (item) => {
    if (!item) return;

    const parsed = parseInput(inputValue, item.type);

    if (!parsed || isNaN(parsed.value)) {
      alert("Invalid input ❌");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        itemId: item.itemId,
        mode:
          item.type === "weighItem"
            ? mode === "price"
              ? "price"
              : "weight"
            : mode === "price"
              ? "price"
              : "quantity",

        value: parsed.value,
        unit: parsed.unit,

        // 🔥 IMPORTANT for unit items
        sellingPrice: item.sellingPrice,
      };

      const res = await calculatePriceAPI(payload);

      setResult(res.data);
    } catch (err) {
      console.error(err);
      alert("Calculation failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return {
    mode,
    setMode,
    inputValue,
    setInputValue,
    result,
    loading,
    handleCalculate,
  };
};
