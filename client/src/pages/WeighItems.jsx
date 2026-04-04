import { useState, useEffect, useRef } from "react";
import { addWeighItemAPI, getItemsAPI } from "../services/itemService";

const margins = [2.5, 5, 8, 10];

const initialState = {
  itemName: "",
  buyingPrice: "",
  sellingPrice: "",
  quantity: "",
  lowStockThreshold: "", // ✅ NEW
};

const parseQuantity = (value) => {
  if (!value) return NaN;

  value = value.toLowerCase().trim();

  value = value.replace(/\s/g, "");

  if (value.endsWith("kg")) {
    return parseFloat(value.replace("kg", ""));
  }

  if (value.endsWith("g")) {
    return parseFloat(value.replace("g", "")) / 1000;
  }

  return parseFloat(value);
};

const calculateCostPerKg = (buyingPrice, quantity) => {
  if (!buyingPrice || !quantity) return 0;
  return Math.ceil(buyingPrice / quantity);
};

const calculateMargin = (costPrice, sellingPrice) => {
  if (!costPrice || !sellingPrice) return 0;
  return (((sellingPrice - costPrice) / costPrice) * 100).toFixed(1);
};

const calculateSellingPrice = (costPrice, percent) => {
  return Math.ceil(costPrice + (costPrice * percent) / 100);
};

const WeighItems = () => {
  const [formData, setFormData] = useState(initialState);
  const [costPerKg, setCostPerKg] = useState(0);
  const [margin, setMargin] = useState(null);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");

  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setItems([]);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => {
      const fetchItems = async () => {
        try {
          const res = await getItemsAPI({ type: "weighItem", search });
          setItems(res.data);
        } catch (err) {
          console.error(err);
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

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "itemName") {
      setSearch(value);
    }

    const updated = { ...formData, [name]: value };
    setFormData(updated);

    const parsedQty = parseQuantity(updated.quantity);

    if (!parsedQty || isNaN(parsedQty)) {
      setCostPerKg(0);
      setMargin(null);
      return;
    }

    const cost = calculateCostPerKg(Number(updated.buyingPrice), parsedQty);
    setCostPerKg(cost);

    if (updated.sellingPrice && cost) {
      setMargin(calculateMargin(cost, updated.sellingPrice));
    }

    if (name === "quantity") {
      if (Math.abs(cost - costPerKg) > 0.01) {
        setFormData((prev) => ({
          ...prev,
          sellingPrice: "",
        }));
        setMargin(null);
      }
    }
  };

  const handleSelectItem = (item) => {
    setFormData({
      itemName: item.displayName,
      buyingPrice: "",
      quantity: item.stock,
      sellingPrice: item.sellingPrice,
      lowStockThreshold: item.lowStockThreshold || "", // ✅ NEW
    });

    setSearch(item.displayName); // ✅ FIX
    setCostPerKg(item.costPerKg);
    setMargin(null);
    setItems([]); // close dropdown
  };

  const handleSelectPrice = (percent) => {
    const selling = calculateSellingPrice(costPerKg, percent);

    setFormData((prev) => ({
      ...prev,
      sellingPrice: selling,
    }));

    // ✅ calculate real margin
    setMargin(calculateMargin(costPerKg, selling));
  };

  const resetForm = () => {
    setFormData(initialState);
    setCostPerKg(0);
    setMargin(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.itemName.trim()) {
      alert("Item name required");
      return;
    }

    if (!formData.sellingPrice) {
      alert("Select or enter selling price");
      return;
    }

    try {
      setLoading(true);

      const parsedQty = parseQuantity(formData.quantity);

      let parsedThreshold = 0;

      if (formData.lowStockThreshold) {
        parsedThreshold = parseQuantity(formData.lowStockThreshold);

        if (isNaN(parsedThreshold)) {
          alert("Invalid threshold value");
          return;
        }

        if (parsedThreshold >= parsedQty) {
          alert("Threshold must be smaller than total quantity");
          return;
        }
      }

      const payload = {
        itemName: formData.itemName,
        buyingPrice: Number(formData.buyingPrice),
        quantity: parsedQty,
        sellingPrice: Number(formData.sellingPrice),
        lowStockThreshold: parsedThreshold,
      };
      const res = await addWeighItemAPI(payload);

      alert("Item added successfully");

      resetForm();
    } catch (err) {
      console.error(err);
      alert("Error adding item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-4 space-y-4 md:border rounded-lg md:shadow md:mt-5"
    >
      <h2 className="text-xl font-semibold">Add Weigh Item</h2>

      <input
        type="text"
        name="itemName"
        placeholder="Item Name"
        value={formData.itemName}
        onChange={handleChange}
        className="input"
        required
      />

      {items.length > 0 && (
        <div
          ref={dropdownRef}
          className="border rounded max-h-40 overflow-y-auto"
        >
          {items.map((item) => (
            <p
              key={`${item.itemId}-${item.sellingPrice}`}
              onClick={() => handleSelectItem(item)}
              className="p-2 hover:bg-gray-100 cursor-pointer flex justify-between"
            >
              <span>{item.label}</span>
              <span className="text-sm text-gray-500">
                {item.type === "weighItem"
                  ? `₹${item.sellingPrice}/kg | ${item.stock}kg`
                  : `₹${item.sellingPrice} | ${item.quantity} pcs`}
              </span>
            </p>
          ))}
        </div>
      )}

      <input
        type="number"
        name="buyingPrice"
        placeholder="Buying Price"
        value={formData.buyingPrice}
        onChange={handleChange}
        className="input"
        required
      />

      <input
        type="text"
        name="quantity"
        placeholder="Quantity (e.g. 1kg or 500g)"
        value={formData.quantity}
        onChange={handleChange}
        className="input"
        required
      />

      {costPerKg > 0 && (
        <p className="text-sm text-gray-600">Cost per KG: ₹{costPerKg}</p>
      )}

      {costPerKg > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {margins.map((m) => {
            const price = calculateSellingPrice(costPerKg, m);

            return (
              <button
                key={m}
                type="button"
                onClick={() => handleSelectPrice(m)}
                className={`btn ${
                  Math.round(margin) === m
                    ? "bg-black text-white"
                    : "hover:bg-black hover:text-white"
                }`}
              >
                {m}% → ₹{price}
              </button>
            );
          })}
        </div>
      )}

      <input
        type="number"
        name="sellingPrice"
        placeholder="Selling Price (₹/KG)"
        value={formData.sellingPrice}
        onChange={handleChange}
        className="input"
        required
      />

      {margin !== null && (
        <p className="text-sm text-green-600">Your Margin: {margin}%</p>
      )}

      <input
        type="text"
        name="lowStockThreshold"
        placeholder="Low Stock Alert (e.g. 5kg or 300g)"
        value={formData.lowStockThreshold}
        onChange={handleChange}
        className="input"
      />

      {formData.lowStockThreshold && (
        <p className="text-xs text-gray-500">
          Parsed: {parseQuantity(formData.lowStockThreshold)} kg
        </p>
      )}

      <button
        disabled={loading}
        className="w-full bg-black text-white p-2 rounded"
      >
        {loading ? "Adding..." : "Add Item"}
      </button>
    </form>
  );
};

export default WeighItems;
