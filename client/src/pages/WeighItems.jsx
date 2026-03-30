import { useState, useEffect } from "react";
import {
  calculateCostPerKg,
  calculateSellingPrice,
  calculateMargin,
} from "../utils/itemUtils";
import { addWeighItemAPI } from "../services/itemService";
import { getItemsAPI } from "../services/itemService";

const margins = [2.5, 5, 8, 10];

const initialState = {
  itemName: "",
  buyingPrice: "",
  sellingPrice: "",
  quantity: "",
};

const parseQuantity = (value) => {
  if (!value) return 0;

  value = value.toLowerCase().trim();

  if (value.includes("kg")) {
    return parseFloat(value);
  }

  if (value.includes("g")) {
    return parseFloat(value) / 1000;
  }

  return parseFloat(value);
};

const WeighItems = () => {
  const [formData, setFormData] = useState(initialState);
  const [costPerKg, setCostPerKg] = useState(0);
  const [margin, setMargin] = useState(null);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    const fetchItems = async () => {
      const res = await getItemsAPI();
      setItems(res.data);
    };

    fetchItems();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "itemName") {
      const search = value.toLowerCase();

      const result = items.filter((item) =>
        item.displayName.toLowerCase().includes(search),
      );

      setFiltered(result);
    }

    const updated = { ...formData, [name]: value };
    setFormData(updated);

    // calculate cost per kg

    const parsedQty = parseQuantity(updated.quantity);

    if (!parsedQty || isNaN(parsedQty)) {
      setCostPerKg(0);
      return; // 🚨 STOP further calculations
    }

    const cost = calculateCostPerKg(updated.buyingPrice, parsedQty);
    setCostPerKg(cost);

    if (name === "sellingPrice") {
      if (!value || !cost || isNaN(cost)) {
        setMargin(null);
      } else {
        setMargin(calculateMargin(cost, value));
      }
    }

    if (name === "quantity") {
      updated.sellingPrice = "";
      setMargin(null);
    }
  };

  const handleSelectPrice = (percent) => {
    const selling = calculateSellingPrice(costPerKg, percent);

    setFormData((prev) => ({
      ...prev,
      sellingPrice: selling,
    }));

    setMargin(percent);
  };

  const handleSelectItem = (item) => {
    setFormData({
      itemName: item.displayName,
      buyingPrice: "",
      quantity: "",
      sellingPrice: item.sellingPrice,
    });

    setCostPerKg(item.costPerKg);
    setMargin(null);
    setFiltered([]);
  };

  const resetForm = () => {
    setFormData(initialState);
    setCostPerKg(0);
    setMargin(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.sellingPrice) {
      alert("Select or enter selling price");
      return;
    }

    try {
      setLoading(true);

      const parsedQty = parseQuantity(formData.quantity);

      const payload = {
        itemName: formData.itemName,
        buyingPrice: Number(formData.buyingPrice),
        quantity: parsedQty, // ✅ always in KG
        sellingPrice: Number(formData.sellingPrice),
        margin: Number(margin),
      };

      const res = await addWeighItemAPI(payload);

      alert("Item added successfully");

      resetForm();
    } catch (err) {
      console.error(err);
      alert("Error adding item ❌");
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

      {filtered.length > 0 && (
        <div className="border rounded max-h-40 overflow-y-auto">
          {filtered.map((item) => (
            <p
              key={item._id}
              onClick={() => handleSelectItem(item)}
              className="p-2 hover:bg-gray-100 cursor-pointer flex justify-between"
            >
              <span>{item.displayName}</span>
              <span className="text-sm text-gray-500">
                ₹{item.sellingPrice}/kg | {item.stock}kg
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

      {formData.quantity && (
        <p className="text-xs text-gray-500">
          Parsed: {parseQuantity(formData.quantity)} kg
        </p>
      )}

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
                  margin === m
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

      {margin && (
        <p className="text-sm text-green-600">Your Margin: {margin}%</p>
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
