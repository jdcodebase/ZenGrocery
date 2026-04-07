import {
  createOrUpdateWeighItemService,
  createOrUpdateUnitItemService,
  getAllItemsService,
  getItemsTableService,
  getLowStockItemsService,
} from "./item.service.js";

export const createOrUpdateWeighItem = async (req, res, next) => {
  try {
    const item = await createOrUpdateWeighItemService(req.body);

    res.status(200).json({
      message: "Item processed successfully",
      item,
    });
  } catch (error) {
    next(error); // 🔥 important (global error handler)
  }
};

export const createOrUpdateUnitItem = async (req, res, next) => {
  try {
    const item = await createOrUpdateUnitItemService(req.body);

    res.status(200).json({
      message: "Unit item processed successfully",
      item,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllItems = async (req, res, next) => {
  try {
    const data = await getAllItemsService(req.query);

    res.set("Cache-Control", "no-store").status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const getAllItemsTable = async (req, res, next) => {
  try {
    const data = await getItemsTableService();

    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getLowStockItems = async (req, res, next) => {
  try {
    const data = await getLowStockItemsService();

    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};
