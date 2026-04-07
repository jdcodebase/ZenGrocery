import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // from .env
  withCredentials: true,
});

export const addWeighItemAPI = (data) => {
  return API.post("/items/weigh", data);
};

export const addUnitItemAPI = (data) => {
  return API.post("/items/unit", data);
};

export const getItemsAPI = (params) => {
  return API.get("/items", {
    params,
    headers: {
      "Cache-Control": "no-cache",
    },
  });
};

export const calculatePriceAPI = (data) => {
  return API.post("/bills/estimate", data);
};

export const generateBillAPI = (payload) => {
  return API.post(`/bills/sell`, payload);
};

export const fetchItemsAPI = async () => {
  return API.get("/items/table");
};

export const fetchStatsAPI = async () => {
  return API.get("/bills/analytics/today");
};

export const getLowStockAPI = async () => {
  return API.get("/items/low-stock");
};
