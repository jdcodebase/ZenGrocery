import { useEffect, useRef, useState } from "react";
import { getItemsAPI, calculatePriceAPI } from "../services/itemService";

// 🔧 Extract number safely
const extractNumber = (str) => {
  if (!str) return null;

  const match = str.match(/\d+(\.\d+)?/);
  if (!match) return null;

  return parseFloat(match[0]);
};

// 🔧 Improved parser
const parseInput = (value, type, mode) => {
  if (!value) return null;

  value = value.toLowerCase().trim();
  const num = extractNumber(value);

  if (num == null) return null;

  // 🟢 WEIGH ITEM
  if (type === "weighItem") {
    if (mode === "qtyToPrice") {
      if (value.includes("kg")) return { value: num, unit: "kg" };
      if (value.includes("g")) return { value: num, unit: "g" };

      // 👇 better default
      return num > 10
        ? { value: num, unit: "g" } // 250 → grams
        : { value: num, unit: "kg" }; // 1 → kg
    } else {
      return { value: num }; // ₹ → weight
    }
  }

  // 🔵 UNIT ITEM
  if (type === "unitItem") {
    // ❌ reject kg/g input
    if (value.includes("kg") || value.includes("g")) return null;
    if (!/^\d+(\.\d+)?$/.test(value.replace("pcs", "").trim())) {
      return null;
    }
    return { value: num };
  }

  return null;
};

const PriceCalculator = () => {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  const [mode, setMode] = useState("qtyToPrice"); // ✅ cleaner
  const [inputValue, setInputValue] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // 📦 Fetch items
  useEffect(() => {
    const delay = setTimeout(() => {
      const fetchItems = async () => {
        try {
          const res = await getItemsAPI({
            search,
          });

          setItems(res.data);
        } catch (err) {
          console.error(err);
          setError("Failed to load items");
        }
      };

      if (search.length >= 2) {
        fetchItems();
      } else {
        setItems([]);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [search]);

  useEffect(() => {
    if (!inputValue || !selectedItem) return;

    const timer = setTimeout(() => {
      handleCalculate();
    }, 400);

    return () => clearTimeout(timer);
  }, [inputValue, selectedItem, mode]);

  // 🔄 Reset on mode/item change
  useEffect(() => {
    setInputValue("");
    setResult(null);
    setError("");
  }, [mode, selectedItem]);

  // 🧮 CALCULATE
  const handleCalculate = async () => {
    setError("");

    if (!selectedItem) {
      setError("Select item first");
      return;
    }

    const parsed = parseInput(inputValue, selectedItem.type, mode);

    if (!parsed) {
      setError("Invalid input");
      return;
    }

    if (parsed.value <= 0) {
      setError("Enter valid amount");
      return;
    }

    try {
      // 🔧 Clean mode mapping
      let apiMode;

      if (selectedItem.type === "weighItem") {
        apiMode = mode === "qtyToPrice" ? "price" : "weight";
      } else {
        apiMode = mode === "qtyToPrice" ? "price" : "quantity";
      }

      const payload = {
        itemId: selectedItem.itemId,
        mode: apiMode,
        value: parsed.value,
        unit: selectedItem.type === "weighItem" ? parsed.unit : null,

        // ✅ ADD THIS
        sellingPrice: selectedItem.sellingPrice,
      };
      const res = await calculatePriceAPI(payload);
      setResult(res.data);
    } catch (err) {
      setError("Calculation failed");
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-4 border rounded-lg shadow md:mt-5">
      <h2 className="text-xl font-semibold">Price Calculator</h2>

      {/* 🔍 SEARCH */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border p-2 rounded"
        />

        {items.length > 0 && (
          <div className="border rounded max-h-40 overflow-y-auto">
            {items.map((item) => (
              <p
                key={`${item.itemId}-${item.sellingPrice}`}
                onClick={() => {
                  setSelectedItem(item);
                  setSearch(item.displayName);
                  setItems([]);
                }}
                className="p-2 hover:bg-gray-100 cursor-pointer flex justify-between"
              >
                <span>{item.label}</span>

                <span className="text-sm text-gray-500">
                  {item.type === "weighItem"
                    ? `₹${item.sellingPrice}/kg | ${Number(item.stock || 0).toFixed(2)}kg`
                    : `₹${item.sellingPrice} | ${item.quantity} pcs`}
                </span>
              </p>
            ))}
          </div>
        )}
      </div>

      {/* 📦 SELECTED ITEM */}
      {selectedItem && (
        <p className="text-sm text-green-600">
          <b>{selectedItem.displayName}</b> | ₹{selectedItem.sellingPrice}
          {selectedItem.type === "weighItem" ? "/kg" : " / pcs"} | Stock:{" "}
          {selectedItem.type === "weighItem"
            ? `${selectedItem.stock} kg`
            : `${selectedItem.quantity} pcs`}
        </p>
      )}

      {/* 🔁 MODE */}
      <div className="flex gap-2">
        <button
          className={`w-full p-2 border rounded ${
            mode === "qtyToPrice" ? "bg-black text-white" : ""
          }`}
          onClick={() => setMode("qtyToPrice")}
        >
          Qty → Price
        </button>

        <button
          className={`w-full p-2 border rounded ${
            mode === "priceToQty" ? "bg-black text-white" : ""
          }`}
          onClick={() => setMode("priceToQty")}
        >
          Price → Qty
        </button>
      </div>

      {/* 🧾 INPUT */}
      <input
        type="text"
        placeholder={
          selectedItem?.type === "weighItem"
            ? mode === "qtyToPrice"
              ? "e.g. 250g, 500g, 1kg"
              : "e.g. ₹10, ₹20"
            : mode === "qtyToPrice"
              ? "e.g. 2 pcs"
              : "e.g. ₹30"
        }
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleCalculate()}
        className="w-full border p-2 rounded"
      />

      {/* ❌ ERROR */}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* 📊 RESULT */}
      {result && (
        <div className="p-3 rounded bg-gray-100 text-center font-semibold space-y-1">
          {result.price && <div>Price: ₹{result.price}</div>}

          {result.weight && <div>Weight: {result.weight} g</div>}

          {result.quantity && (
            <div>
              Qty: {result.quantity} pcs
              {result.price && (
                <span className="text-sm text-gray-500 ml-2">
                  (₹{result.price})
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PriceCalculator;
