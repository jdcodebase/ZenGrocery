import { useEffect, useState } from "react";
import { fetchStatsAPI, getLowStockAPI } from "../services/itemService";

const MAX_LIMIT = 10000;

const Circle = ({ value, max, label, color }) => {
  const radius = 100; // 🔥 bigger
  const stroke = 12;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;

  const progress = Math.min(value / max, 1);
  const strokeDashoffset = circumference - progress * circumference;

  const remaining = Math.max(max - value, 0);

  return (
    <div className="flex flex-col items-center bg-white shadow-md rounded-2xl p-6">
      <svg height={radius * 2} width={radius * 2}>
        {/* Background */}
        <circle
          stroke="#e5e7eb"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />

        {/* Progress */}
        <circle
          stroke={value >= max ? "orange" : color} // 🔥 change color after target
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />

        {/* CENTER TEXT */}
        <text
          x="50%"
          y="45%"
          textAnchor="middle"
          fontSize="18"
          fontWeight="bold"
        >
          ₹{value.toFixed(0)}
        </text>

        <text x="50%" y="60%" textAnchor="middle" fontSize="12" fill="gray">
          / ₹{max}
        </text>
      </svg>

      {/* LABEL */}
      <p className="mt-3 font-semibold">{label}</p>

      {/* REMAINING TEXT */}
      <p className="text-sm text-gray-500 mt-1">
        {value >= max
          ? "🎯 Target achieved!"
          : `₹${remaining.toFixed(0)} left to target`}
      </p>
    </div>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalProfit: 0,
    totalBills: 0,
    avgBill: 0,
    bestItem: "",
    bestItemQty: 0,
    hourlySales: {},
  });

  const [lowStock, setLowStock] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      const res = await fetchStatsAPI();
      setStats(res.data);
    };

    fetchStats();
  }, []);

  useEffect(() => {
    const fetchLowStock = async () => {
      const res = await getLowStockAPI();
      setLowStock(res.data);
    };

    fetchLowStock();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard 📊</h1>

      <div className="flex gap-6 flex-wrap">
        {/* SALES */}
        <Circle
          value={stats.totalSales}
          max={10000}
          label="Today's Sales"
          color="green"
        />

        {/* PROFIT */}
        <Circle
          value={stats.totalProfit}
          max={1000}
          label="Today's Profit"
          color="blue"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-gray-500">Bills Today</p>
          <p className="text-xl font-bold">{stats.totalBills}</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-gray-500">Avg Bill</p>
          <p className="text-xl font-bold">₹{stats.avgBill.toFixed(0)}</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-gray-500">Top Item</p>
          <p className="text-lg font-semibold">{stats.bestItem || "-"}</p>
          <p className="text-xs text-gray-400">
            {stats.bestItemQty.toFixed(2)} sold
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-gray-500">Profit</p>
          <p className="text-xl font-bold">₹{stats.totalProfit.toFixed(0)}</p>
        </div>

        {lowStock.length > 0 && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
            <p className="font-semibold text-red-600 mb-2">
              ⚠️ Low Stock Alert
            </p>

            {lowStock.map((item) => (
              <div key={item._id} className="text-sm mb-2">
                <p>
                  {item.displayName} → {item.stock} {item.unit}
                  {item.outOfStock && " ⚠️"}
                </p>

                {/* 🔥 SHOW OUT OF STOCK VARIANTS */}
                {item.outOfStock &&
                  item.variants.map((v, i) => (
                    <p key={i} className="ml-4 text-red-500 text-xs">
                      ₹{v.sellingPrice} → ❌ Out of stock
                    </p>
                  ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default Dashboard;
