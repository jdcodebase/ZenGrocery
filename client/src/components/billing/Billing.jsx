import { useState } from "react";
import { calculatePriceAPI, generateBillAPI } from "../../services/itemService";
import ProductSearch from "../price/ProductSearch";

const Billing = () => {
  const [rows, setRows] = useState([
    {
      item: null,
      input: "",
      price: 0,
      weight: 0, // ALWAYS grams (for backend)
      displayWeight: "", // ✅ UI only
    },
  ]);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // 🧠 Parse input (₹ or g/kg)
  const parseInput = (value) => {
    value = value.toLowerCase().trim();

    // ✅ weight input → mode = price
    if (value.includes("kg")) {
      return { value: parseFloat(value), unit: "kg", mode: "price" };
    }

    if (value.includes("g")) {
      return { value: parseFloat(value), unit: "g", mode: "price" };
    }

    // ✅ price input → mode = weight
    return { value: parseFloat(value), unit: null, mode: "weight" };
  };

  // 🧠 Handle input change
  const handleChange = async (index, value) => {
    const updated = [...rows];
    updated[index].input = value;
    setRows(updated);

    const row = updated[index];

    if (!row.item || !value) return;

    const parsed = parseInput(value);

    if (isNaN(parsed.value)) return;

    try {
      console.log(parsed);
      const res = await calculatePriceAPI({
        itemId: row.item._id,
        mode: parsed.mode,
        value: parsed.value,
        unit: parsed.unit,
      });

      if (parsed.mode === "price") {
        updated[index].price = res.data.price;

        // ✅ store REAL weight
        updated[index].weight =
          parsed.unit === "kg" ? parsed.value * 1000 : parsed.value;

        // ✅ display
        updated[index].displayWeight =
          parsed.unit === "kg" ? `${parsed.value} kg` : `${parsed.value} g`;
      } else {
        updated[index].price = parsed.value;

        // ✅ store REAL weight
        updated[index].weight = res.data.weight;

        // ✅ display
        updated[index].displayWeight = `${res.data.weight} g`;
      }

      setRows([...updated]);
    } catch (err) {
      console.error(err);
    }
  };

  // ➕ Add row
  const addRow = () => {
    setRows([...rows, { item: null, input: "", price: 0, weight: 0 }]);
  };

  // ❌ Remove row
  const removeRow = (index) => {
    const updated = rows.filter((_, i) => i !== index);
    setRows(updated);
  };

  // 💰 Total
  const total = rows.reduce((sum, r) => sum + (r.price || 0), 0);

  const handleSell = async () => {
    try {
      const items = rows.map((r) => ({
        itemId: r.item._id,
        quantity: r.weight / 1000,
        price: r.price,
      }));

      setLoading(true);
      const res = await generateBillAPI(items);

      const bill = res.data.bill;

      setMessage(`✅ Bill Created! Total: ₹${bill.totalPrice}`);

      setRows([
        { item: null, input: "", price: 0, weight: 0, displayWeight: "" },
      ]);
    } catch (err) {
      const msg = err.response?.data?.message || "Error creating bill ❌";

      setMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-3 sm:p-6 max-w-5xl mx-auto">
      <h2 className="text-xl sm:text-2xl font-semibold mb-4">🧾 Billing</h2>

      {message && (
        <div className="mb-4 p-3 bg-yellow-100 text-center rounded">
          {message}
        </div>
      )}

      {/* MOBILE VIEW */}
      <div className="space-y-4 sm:hidden">
        {rows.map((row, index) => (
          <div
            key={index}
            className="border rounded-xl p-3 shadow-sm space-y-2"
          >
            <ProductSearch
              onSelect={(item) => {
                const updated = [...rows];
                updated[index].item = item;
                setRows(updated);
              }}
            />

            <input
              type="text"
              placeholder="₹50 or 250g"
              value={row.input}
              onChange={(e) => handleChange(index, e.target.value)}
              className="w-full border p-3 rounded text-lg"
            />

            <div className="flex justify-between text-sm">
              <span>Weight:</span>
              <span>{row.displayWeight || "-"}</span>
            </div>

            <div className="flex justify-between font-semibold">
              <span>Price:</span>
              <span>₹{row.price || 0}</span>
            </div>

            <button
              onClick={() => removeRow(index)}
              className="w-full text-red-500 border rounded p-2"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden sm:block">
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Item</th>
              <th className="p-2 border">Input</th>
              <th className="p-2 border">Weight</th>
              <th className="p-2 border">Price</th>
              <th className="p-2 border">Action</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                <td className="p-2 border">
                  <ProductSearch
                    onSelect={(item) => {
                      const updated = [...rows];
                      updated[index].item = item;
                      setRows(updated);
                    }}
                  />
                </td>

                <td className="p-2 border">
                  <input
                    type="text"
                    placeholder="₹50 or 250g"
                    value={row.input}
                    onChange={(e) => handleChange(index, e.target.value)}
                    className="w-full border p-2 rounded"
                  />
                </td>

                <td className="p-2 border">{row.displayWeight || "-"}</td>
                <td className="p-2 border">₹{row.price || 0}</td>

                <td className="p-2 border text-center">
                  <button onClick={() => removeRow(index)}>❌</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ACTIONS */}
      <div className="mt-4 flex flex-col sm:flex-row gap-3">
        <button
          onClick={addRow}
          className="flex-1 bg-blue-600 text-white py-3 rounded text-lg"
        >
          + Add Item
        </button>

        <button
          onClick={handleSell}
          className="flex-1 bg-green-600 text-white py-3 rounded text-lg"
          disabled={loading}
        >
          {loading ? "Processing..." : "Generate Bill"}
        </button>
      </div>

      {/* TOTAL (Sticky feel) */}
      <div className="mt-4 text-right text-xl font-bold">Total: ₹{total}</div>
    </div>
  );
};

export default Billing;
