import Bill from "../models/bill.model.js";

export const getTodayStats = async (req, res) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const bills = await Bill.find({
      createdAt: { $gte: start, $lte: end },
    });

    let totalSales = 0;
    let totalProfit = 0;
    let totalBills = bills.length;

    const itemMap = {}; // for best selling
    const hourlySales = {}; // for graph

    bills.forEach((bill) => {
      totalSales += bill.totalPrice;
      totalProfit += bill.totalProfit;

      // 🥇 Best selling item
      bill.items.forEach((item) => {
        if (!itemMap[item.itemName]) {
          itemMap[item.itemName] = 0;
        }
        itemMap[item.itemName] += item.quantitySold;
      });

      // 📊 Hourly sales
      const hour = new Date(bill.createdAt).getHours();
      hourlySales[hour] = (hourlySales[hour] || 0) + bill.totalPrice;
    });

    // 🥇 Find top item
    let bestItem = null;
    let maxQty = 0;

    for (let item in itemMap) {
      if (itemMap[item] > maxQty) {
        maxQty = itemMap[item];
        bestItem = item;
      }
    }

    const avgBill = totalBills ? totalSales / totalBills : 0;

    res.json({
      totalSales,
      totalProfit,
      totalBills,
      avgBill,
      bestItem,
      bestItemQty: maxQty,
      hourlySales,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching stats" });
  }
};
