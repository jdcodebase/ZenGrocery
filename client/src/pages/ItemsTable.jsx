import { useEffect, useState } from "react";
import { fetchItemsAPI } from "../services/itemService";
import { FaEdit, FaTrash } from "react-icons/fa";

const getMarginBadge = (margin) => {
  if (margin > 20) return "bg-green-100 text-green-700 px-2 py-1 rounded";
  if (margin >= 10) return "bg-yellow-100 text-yellow-700 px-2 py-1 rounded";
  return "bg-red-100 text-red-700 px-2 py-1 rounded";
};

const ItemsTable = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const getItems = async () => {
      try {
        const res = await fetchItemsAPI();
        setItems(res.data.data);
      } catch (err) {
        console.error("Error fetching items:", err);
      }
    };

    getItems();
  }, []);

  // 🔥 Handlers (you will connect API later)
  const handleEdit = (item) => {
    console.log("Edit:", item);
  };

  const handleDelete = (id) => {
    console.log("Delete:", id);
  };

  return (
    <div className="p-4 overflow-x-auto">
      <h2 className="text-xl font-bold mb-4">Inventory Table</h2>

      <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
        <thead className="bg-gray-100 text-sm">
          <tr>
            <th className="p-2 text-left">Name</th>
            <th className="p-2">Unit</th>
            <th className="p-2">Selling Price</th>
            <th className="p-2">Stock</th>
            <th className="p-2">Cost</th>
            <th className="p-2">Margin %</th>
            <th className="p-2">Profit</th>
            <th className="p-2">Status</th>
            <th className="p-2">Actions</th> {/* ✅ NEW */}
          </tr>
        </thead>

        <tbody>
          {items.map((item) => (
            <tr
              key={item._id}
              className="border-t text-sm hover:bg-gray-50 text-center"
            >
              <td className="p-2 font-medium">{item.name}</td>

              <td className="p-2">{item.unit}</td>

              <td className="p-2">₹{item.sellingPrice}</td>

              <td className="p-2">
                {item.quantity} {item.unit}
              </td>

              <td className="p-2">₹{item.cost}</td>

              <td>
                <span className={getMarginBadge(item.margin)}>
                  {item.margin}%
                </span>
              </td>

              <td>₹{item.profit}</td>

              <td className="p-2">
                {item.lowStock ? (
                  <span className="text-red-500 font-semibold">Low</span>
                ) : (
                  <span className="text-green-600">OK</span>
                )}
              </td>

              {/* 🔥 ACTION BUTTONS */}
              <td className="p-2 flex justify-center gap-2">
                {/* EDIT */}
                <button
                  onClick={() => handleEdit(item)}
                  className="flex items-center gap-1 text-blue-600 hover:bg-blue-50 px-2 py-1 rounded"
                >
                  <FaEdit />
                  <span className="hidden sm:inline">Edit</span>
                </button>

                {/* DELETE */}
                <button
                  onClick={() => handleDelete(item._id)}
                  className="flex items-center gap-1 text-red-600 hover:bg-red-50 px-2 py-1 rounded"
                >
                  <FaTrash />
                  <span className="hidden sm:inline">Delete</span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ItemsTable;
