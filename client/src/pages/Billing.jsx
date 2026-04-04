import { useState, useEffect } from "react";
import {
  getItemsAPI,
  calculatePriceAPI,
  generateBillAPI,
} from "../services/itemService";
import { FaTimes } from "react-icons/fa";

// 🔧 Extract number
const extractNumber = (str) => {
  if (!str) return null;

  const match = str.match(/\d+(\.\d+)?/);
  if (!match) return null;

  return parseFloat(match[0]);
};

// 🔧 Parse input
const parseInput = (value, type) => {
  if (!value) return null;

  value = value.toLowerCase().trim();
  const num = extractNumber(value);

  if (num == null) return null;

  if (type === "weighItem") {
    if (value.includes("kg")) return { value: num, unit: "kg" };
    if (value.includes("g")) return { value: num, unit: "g" };

    // 👇 better default
    return { value: num, unit: "kg" }; // 1 → kg
  }

  if (type === "unitItem") {
    if (value.includes("kg") || value.includes("g")) {
      return null; // ❌ block invalid
    }
    if (!/^\d+(\.\d+)?$/.test(value.replace("pcs", "").trim())) {
      return null;
    }

    return { value: num }; // ✅ always pcs
  }

  return null;
};

const formatWeight = (g) => {
  if (g >= 1000) return `${g / 1000} kg`;
  return `${g} g`;
};

const BillingPage = () => {
  const [rows, setRows] = useState([
    { item: null, itemInput: "", input: "", price: 0, quantity: 0, weight: 0 },
  ]);

  const [search, setSearch] = useState("");
  const [items, setItems] = useState([]);
  const [activeRow, setActiveRow] = useState(null);
  const [totalBill, setTotalBill] = useState(null);

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

  // 🎯 SELECT ITEM
  const handleSelectItem = (index, item) => {
    const updated = [...rows];
    updated[index] = {
      item,
      itemInput: item.displayName, // 🔥 important
      input: "",
      price: 0,
      quantity: 0,
      weight: 0,
    };
    setRows(updated);
    setItems([]);
    setSearch("");
  };

  // 🧮 HANDLE INPUT
  const handleInputChange = async (index, value) => {
    const updated = [...rows];
    updated[index].input = value;
    setRows(updated);

    const row = updated[index];
    if (!row.item) return;

    const parsed = parseInput(value, row.item.type);
    if (!parsed) return;

    try {
      const isWeightInput =
        row.item.type === "weighItem" &&
        (value.includes("g") || value.includes("kg"));

      const isPriceInput = !isWeightInput;

      const apiMode =
        row.item.type === "weighItem"
          ? isPriceInput
            ? "weight"
            : "price"
          : "price"; // 🔥 ALWAYS pcs → price

      const res = await calculatePriceAPI({
        itemId: row.item.itemId,
        value: parsed.value,
        unit: parsed.unit,
        mode: apiMode,
        sellingPrice: row.item.sellingPrice,
      });

      if (row.item.type === "weighItem") {
        if (apiMode === "price") {
          updated[index].price = res.data.price;
          updated[index].weight =
            parsed.unit === "g" ? parsed.value : parsed.value * 1000;
        } else {
          updated[index].price = parsed.value;
          updated[index].weight = res.data.weight;
        }
      } else if (row.item.type === "unitItem") {
        updated[index].quantity = parsed.value; // pcs
        updated[index].price = res.data.price; // calculated ₹
      }

      setRows([...updated]);
    } catch (err) {
      console.error(err);
    }
  };

  // ➕ ADD ROW
  const addRow = () => {
    setRows([
      ...rows,
      { item: null, input: "", price: 0, quantity: 0, weight: 0 },
    ]);
  };

  // ❌ REMOVE ROW
  const removeRow = (index) => {
    const updated = rows.filter((_, i) => i !== index);
    setRows(
      updated.length
        ? updated
        : [{ item: null, input: "", price: 0, quantity: 0, weight: 0 }],
    );
  };

  // 💰 TOTAL
  const total = rows.reduce((sum, r) => sum + (r.price || 0), 0);

  const handleSell = async () => {
    try {
      const payload = {
        items: rows
          .filter((r) => {
            if (!r.item || r.price <= 0) return false;

            if (r.item.type === "weighItem") return r.weight > 0;
            if (r.item.type === "unitItem") return r.quantity > 0;

            return false;
          })
          .map((r) => ({
            itemId: r.item.itemId,
            type: r.item.type,

            // 🟢 WEIGH ITEM
            ...(r.item.type === "weighItem" && {
              weight: r.weight / 1000, // convert g → kg
            }),

            // 🔵 UNIT ITEM
            ...(r.item.type === "unitItem" && {
              quantity: r.quantity,
              sellingPrice: r.item.sellingPrice, // used to match stock entry
            }),

            price: r.price,
          })),
      };

      const res = await generateBillAPI(payload);
      setTotalBill(res.data.bill.totalPrice);
      alert(`Bill Created`);

      // 🔄 reset
      setRows([
        {
          item: null,
          itemInput: "",
          input: "",
          price: 0,
          quantity: 0,
          weight: 0,
        },
      ]);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Billing failed ❌");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <h2 className="text-xl font-semibold">Billing</h2>

      {totalBill !== null && (
        <p className="text-center text-green-500 text-xl">
          Total Bill: ₹{totalBill}
        </p>
      )}

      {/* 🧾 TABLE HEADER */}
      <div className="hidden md:grid grid-cols-[2fr_2fr_1fr_1fr_auto] gap-2 font-semibold bg-gray-100 p-2 rounded-md border border-gray-200">
        <div>Item</div>
        <div>Input</div>
        <div>Price</div>
        <div>Qty/Weight</div>
        <div></div>
      </div>

      {/* 📦 ROWS */}
      <div className="space-y-2">
        {rows.map((row, index) => (
          <div
            key={index}
            className="grid grid-cols-1 md:grid-cols-[2fr_2fr_1fr_1fr_auto] gap-3 items-center border border-gray-200 p-3 rounded-lg bg-white"
          >
            {/* 🔍 ITEM */}
            <div className="relative flex flex-col">
              <input
                type="text"
                placeholder="Search item"
                value={row.itemInput || ""}
                onChange={(e) => {
                  const updated = [...rows];
                  updated[index].itemInput = e.target.value;
                  updated[index].item = null;
                  setRows(updated);

                  setSearch(e.target.value);
                  setActiveRow(index);
                }}
                className="border p-2 w-full"
              />

              {/* ✅ aligned price */}
              {row.item && (
                <span className="text-xs text-gray-500 mt-1">
                  ₹{row.item.sellingPrice} /{" "}
                  {row.item.type === "weighItem" ? "kg" : "pcs"}
                </span>
              )}

              {items.length > 0 && activeRow === index && (
                <div className="absolute top-full left-0 bg-white border w-full max-h-40 overflow-y-auto z-10">
                  {items.map((item) => (
                    <p
                      key={`${item.itemId}-${item.sellingPrice}`}
                      onClick={() => handleSelectItem(index, item)}
                      className="p-2 hover:bg-gray-100 cursor-pointer flex justify-between"
                    >
                      <span>{item.displayName}</span>
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

            {/* 🧾 INPUT */}
            <div className="flex flex-col">
              <label className="text-xs md:hidden">Input</label>
              <input
                type="text"
                placeholder={
                  row.item?.type === "weighItem" ? "500g or 20" : "e.g. 2 pcs"
                }
                value={row.input}
                onChange={(e) => handleInputChange(index, e.target.value)}
                className="border p-2"
              />
            </div>

            {/* 💰 PRICE */}
            <div className="md:text-center flex items-center justify-around">
              <span className="md:hidden text-xs block">Price: </span>₹
              {row.price || 0}
            </div>

            {/* ⚖️ / 📦 */}
            <div className="md:text-center flex items-center justify-around">
              <span className="md:hidden text-xs block">Qty: </span>
              {row.item?.type === "weighItem"
                ? formatWeight(row.weight || 0)
                : `${row.quantity || 0} pcs`}
            </div>

            {/* ❌ REMOVE */}
            <button
              onClick={() => removeRow(index)}
              className="text-red-500 font-bold hover:bg-red-50 text-center px-2 py-1 rounded flex gap-1"
            >
              {/* Mobile → Text */}
              <span className="md:hidden">Remove</span>

              {/* Desktop → Icon */}
              <span className="hidden md:inline">
                <FaTimes />
              </span>
            </button>
          </div>
        ))}
      </div>

      {/* ➕ ADD */}
      <button onClick={addRow} className="bg-gray-200 px-4 py-2 rounded">
        + Add Item
      </button>

      <div className="flex justify-between">
        <button
          onClick={handleSell}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Generate Bill
        </button>

        {/* 💰 TOTAL */}
        <div className="text-xl font-bold">Total: ₹{total}</div>
      </div>
    </div>
  );
};

export default BillingPage;
