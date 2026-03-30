import { useEffect, useState } from "react";
import { getItemsAPI } from "../services/itemService";

export const useItems = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    getItemsAPI().then((res) => setItems(res.data));
  }, []);

  return items;
};
