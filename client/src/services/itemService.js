import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // from .env
  withCredentials: true,
});

export const addWeighItemAPI = (data) => {
  return API.post("/items/weigh", data);
};

export const getItemsAPI = () => {
  return API.get("/items");
};

export const calculatePriceAPI = (data) => {
  return API.post("/items/estimate", data);
};

export const generateBillAPI = (items) => {
  return API.post(`/items/sell`, { items });
};
