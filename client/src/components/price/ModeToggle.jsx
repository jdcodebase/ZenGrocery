const ModeToggle = ({ mode, setMode }) => {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => setMode("price")}
        className={`flex-1 p-2 border rounded ${
          mode === "price" ? "bg-black text-white" : ""
        }`}
      >
        Calculate Price
      </button>

      <button
        onClick={() => setMode("weight")}
        className={`flex-1 p-2 border rounded ${
          mode === "weight" ? "bg-black text-white" : ""
        }`}
      >
        Calculate Weight
      </button>
    </div>
  );
};

export default ModeToggle;
