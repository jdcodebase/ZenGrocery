import { useState, useEffect, useRef } from "react";
import { addUnitItemAPI, getItemsAPI } from "../services/itemService";

const initialState = {
  itemName: "",
  costPrice: "",
  sellingPrice: "",
  quantity: "",
  lowStockThreshold: "",
};

const UnitItems = () => {
  const [formData, setFormData] = useState(initialState);
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

  // 📦 Fetch items
  useEffect(() => {
    const delay = setTimeout(() => {
      const fetchItems = async () => {
        try {
          const res = await getItemsAPI({
            type: "unitItem",
            search,
          });
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

  // 🔁 Handle input
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "itemName") {
      setSearch(value);
    }

    const updated = { ...formData, [name]: value };
    setFormData(updated);

    // 💰 Margin calculation
    const cost = parseFloat(updated.costPrice);
    const selling = parseFloat(updated.sellingPrice);

    if (!isNaN(cost) && !isNaN(selling) && cost > 0) {
      const m = ((selling - cost) / cost) * 100;
      setMargin(Number(m.toFixed(1)));
    } else {
      setMargin(null);
    }
  };

  // 🎯 Select item
  const handleSelectItem = (item) => {
    setFormData({
      itemName: item.displayName,
      costPrice: "",
      sellingPrice: item.sellingPrice,
      quantity: item.quantity,
      lowStockThreshold: "",
    });

    setSearch(item.displayName); // ✅ FIX
    setMargin(null);
    setItems([]);
  };

  // 🔄 Reset
  const resetForm = () => {
    setFormData(initialState);
    setMargin(null);
    setSearch(""); // ✅ important
  };

  // 🚀 Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    const qty = Number(formData.quantity);
    const cost = Number(formData.costPrice);
    const selling = Number(formData.sellingPrice);
    const threshold = Number(formData.lowStockThreshold || 0);

    // ❌ Basic validation
    if (!formData.itemName) {
      alert("Item name required");
      return;
    }

    if (cost <= 0) {
      alert("Cost price must be greater than 0");
      return;
    }

    if (selling <= 0) {
      alert("Selling price must be greater than 0");
      return;
    }

    if (qty <= 0) {
      alert("Quantity must be greater than 0");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        itemName: formData.itemName.trim(),
        stockEntries: {
          costPrice: cost,
          sellingPrice: selling,
          quantity: qty,
        },
        lowStockThreshold: threshold,
      };

      await addUnitItemAPI(payload);

      alert("Unit item added successfully");

      resetForm();
    } catch (err) {
      console.error(err);
      alert("Error adding unit item");
    } finally {
      setLoading(false);
    }
  };

  const isDisabled =
    !formData.itemName ||
    !formData.costPrice ||
    !formData.sellingPrice ||
    !formData.quantity ||
    loading;

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-4 space-y-4 md:border rounded-lg md:shadow md:mt-5"
    >
      <h2 className="text-xl font-semibold">Add Unit Item</h2>

      {/* 🔍 Item Name */}
      <input
        type="text"
        name="itemName"
        placeholder="Item Name (e.g. Maggi)"
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
            <div
              key={`${item.itemId}-${item.sellingPrice}`}
              onClick={() => handleSelectItem(item)}
              className="p-2 hover:bg-gray-100 cursor-pointer flex justify-between"
            >
              <span>{item.label}</span>
              <span className="text-sm text-gray-500">
                ₹{item.sellingPrice} | {item.quantity} pcs
              </span>
            </div>
          ))}
        </div>
      )}

      {/* 💰 Cost Price */}
      <input
        type="number"
        name="costPrice"
        placeholder="Cost Price (per piece)"
        value={formData.costPrice}
        onChange={handleChange}
        className="input"
        required
      />

      {/* 💰 Selling Price */}
      <input
        type="number"
        name="sellingPrice"
        placeholder="Selling Price (per piece)"
        value={formData.sellingPrice}
        onChange={handleChange}
        className="input"
        required
      />

      {/* 📦 Quantity */}
      <input
        type="number"
        name="quantity"
        placeholder="Quantity (number of pieces)"
        value={formData.quantity}
        onChange={handleChange}
        className="input"
        required
      />

      {/* 💹 Margin */}
      {margin !== null && (
        <p
          className={`text-sm ${
            margin < 5
              ? "text-red-500"
              : margin < 15
                ? "text-yellow-600"
                : "text-green-600"
          }`}
        >
          Margin: {margin}%
        </p>
      )}

      {/* ⚠️ Low Stock */}
      <input
        type="number"
        name="lowStockThreshold"
        placeholder="Low Stock Alert (e.g. 5 pcs)"
        value={formData.lowStockThreshold}
        onChange={handleChange}
        className="input"
      />

      {/* 🚀 Submit */}
      <button
        disabled={isDisabled}
        className="w-full bg-black text-white p-2 rounded disabled:opacity-50"
      >
        {loading ? "Adding..." : "Add Item"}
      </button>
    </form>
  );
};

export default UnitItems;
