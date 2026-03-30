const BillingRow = ({
  row,
  index,
  items,
  onItemChange,
  onInputChange,
  onRemove,
}) => {
  return (
    <div className="grid grid-cols-5 gap-3 items-center bg-white p-3 rounded-xl shadow-sm">
      <select
        value={row.itemId}
        onChange={(e) => onItemChange(index, e.target.value)}
        className="border p-2 rounded"
      >
        <option value="">Select</option>
        {items.map((item) => (
          <option key={item._id} value={item._id}>
            {item.displayName}
          </option>
        ))}
      </select>

      <input
        type="text"
        placeholder="2kg / 250g / 50"
        value={row.input}
        onChange={(e) => onInputChange(index, e.target.value)}
        className="border p-2 rounded"
      />

      <div className="text-center text-gray-600">
        {row.weight ? `${row.weight} g` : "--"}
      </div>

      <div className="text-center font-semibold">₹ {row.price || 0}</div>

      <button onClick={() => onRemove(index)} className="text-red-500">
        ❌
      </button>
    </div>
  );
};

export default BillingRow;
