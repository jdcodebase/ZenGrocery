import {
  calculateEstimateService,
  createBillService,
  getTodayStatsService,
} from "./bill.service.js";

export const calculateEstimate = async (req, res, next) => {
  try {
    const result = await calculateEstimateService(req.body);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const createBill = async (req, res, next) => {
  try {
    const bill = await createBillService(req.body);

    res.status(201).json({
      message: "Bill created successfully",
      bill,
    });
  } catch (error) {
    next(error);
  }
};

export const getTodayStats = async (req, res, next) => {
  try {
    const data = await getTodayStatsService();

    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};
