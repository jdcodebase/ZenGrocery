const BillingSummary = ({ total, onGenerate }) => {
  return (
    <div className="mt-6 bg-white p-4 rounded-xl shadow-md">
      <div className="text-xl font-bold mb-3">Total: ₹ {total}</div>

      <button
        onClick={onGenerate}
        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl"
      >
        🧾 Generate Bill
      </button>
    </div>
  );
};

export default BillingSummary;
