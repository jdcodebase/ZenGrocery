import { useEffect, useState } from "react";
import { useItems } from "../../hooks/useItems";

const ProductSearch = ({ onSelect }) => {
  const items = useItems();

  const [query, setQuery] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const res = items.filter((item) =>
      item.displayName.toLowerCase().includes(query.toLowerCase()),
    );
    setFiltered(res);
  }, [query, items]);

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search product..."
        value={query}
        onFocus={() => setShow(true)}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full border p-3 rounded"
      />

      {show && query && (
        <div className="absolute z-10 w-full bg-white border rounded mt-1 shadow max-h-48 overflow-y-auto">
          {filtered.length > 0 ? (
            filtered.map((item) => (
              <div
                key={item._id}
                onClick={() => {
                  onSelect(item);
                  setQuery(item.displayName);
                  setShow(false);
                }}
                className="p-3 hover:bg-gray-100 cursor-pointer"
              >
                {item.displayName}
              </div>
            ))
          ) : (
            <div className="p-3 text-gray-400">No items found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductSearch;
