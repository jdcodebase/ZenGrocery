import { useState } from "react";
import { usePriceCalculator } from "../hooks/usePriceCalculator";
import ProductSearch from "../components/price/ProductSearch";
import ModeToggle from "../components/price/ModeToggle";
import ResultBox from "../components/price/ResultBox";

const PriceCalculator = () => {
  const [selectedItem, setSelectedItem] = useState(null);

  const {
    mode,
    setMode,
    inputValue,
    setInputValue,
    result,
    loading,
    handleCalculate,
  } = usePriceCalculator();

  return (
    <div className="max-w-md mx-auto p-4 space-y-4 border rounded-lg shadow md:mt-5">
      <h2 className="text-xl font-semibold">Price Calculator</h2>

      <ProductSearch onSelect={setSelectedItem} />

      {selectedItem && (
        <p className="text-sm text-green-600">
          <b>{selectedItem.displayName}</b> | ₹{selectedItem.sellingPrice}/kg |
          Stock: {selectedItem.stock}kg
        </p>
      )}

      <ModeToggle mode={mode} setMode={setMode} />

      <input
        type="text"
        placeholder={mode === "price" ? "350g or 2kg" : "₹30"}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="w-full border p-2 rounded"
      />

      <button
        onClick={() => handleCalculate(selectedItem)}
        className="w-full bg-black text-white p-2 rounded"
        disabled={loading}
      >
        {loading ? "Calculating..." : "Calculate"}
      </button>

      <ResultBox result={result} />
    </div>
  );
};

export default PriceCalculator;
