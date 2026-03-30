import { Routes, Route } from "react-router-dom";
import { ROUTES } from "./routes";

import Dashboard from "../pages/Dashboard";
import WeighItems from "../pages/WeighItems";
import PriceCalculator from "../pages/PriceCalculator";
import Billing from "../components/billing/Billing";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path={ROUTES.HOME} element={<Dashboard />} />
      <Route path={ROUTES.WEIGH} element={<WeighItems />} />
      <Route path={ROUTES.PRICE} element={<PriceCalculator />} />
      <Route path={ROUTES.BILLING} element={<Billing />} />
    </Routes>
  );
};

export default AppRoutes;
