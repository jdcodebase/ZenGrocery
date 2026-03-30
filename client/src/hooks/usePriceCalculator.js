import { useState } from "react";
import { calculatePriceAPI } from "../services/itemService";

export const usePriceCalculator = () => {
  const [mode, setMode] = useState("price");
  const [inputValue, setInputValue] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const parseInput = (value) => {
    value = value.toLowerCase().trim();

    if (value.includes("kg")) {
      return { value: parseFloat(value), unit: "kg" };
    }

    if (value.includes("g")) {
      return { value: parseFloat(value), unit: "g" };
    }

    return { value: parseFloat(value), unit: null };
  };

  const handleCalculate = async (selectedItem) => {
    if (!selectedItem || !inputValue) {
      alert("Select product and enter value");
      return;
    }

    const parsed = parseInput(inputValue);

    if (isNaN(parsed.value)) {
      alert("Invalid input ❌");
      return;
    }

    try {
      setLoading(true);

      const res = await calculatePriceAPI({
        itemId: selectedItem._id,
        mode,
        value: parsed.value,
        unit: parsed.unit,
      });

      const data = res.data;

      if (mode === "price") {
        setResult(`${parsed.value}${parsed.unit || ""} = ₹${data.price}`);
      } else {
        setResult(`₹${parsed.value} = ${data.weight}g`);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Error ❌");
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
