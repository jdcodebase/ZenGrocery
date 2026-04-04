import { Routes, Route } from "react-router-dom";
import { ROUTES } from "./routes";

import Dashboard from "../pages/Dashboard";
import WeighItems from "../pages/WeighItems";
import PriceCalculator from "../pages/PriceCalculator";
import UnitItems from "../pages/UnitItems";
import BillingPage from "../pages/Billing";
import ItemsTable from "../pages/ItemsTable";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path={ROUTES.HOME} element={<Dashboard />} />
      <Route path={ROUTES.WEIGH} element={<WeighItems />} />
      <Route path={ROUTES.UNIT} element={<UnitItems />} />
      <Route path={ROUTES.PRICE} element={<PriceCalculator />} />
      <Route path={ROUTES.BILLING} element={<BillingPage />} />
      <Route path={ROUTES.INVENTORY} element={<ItemsTable />} />
    </Routes>
  );
};

export default AppRoutes;
