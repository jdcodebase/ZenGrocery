import { Link } from "react-router-dom";
import { ROUTES } from "../routes/routes";

const actions = [
  { name: "+ Weigh Items", path: ROUTES.WEIGH, type: "weigh" },
  { name: "+ Pack Items", path: "/pack", type: "pack" },
  { name: "Price Check", path: ROUTES.PRICE, type: "price" },
  { name: "New Bill", path: ROUTES.BILLING, type: "billing" },
];

const Dashboard = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-4 justify-items-center border-b-2 py-10">
      {actions.map((item) => (
        <Link
          key={item.name}
          to={item.path}
          className={`hero-btn ${item.type}`}
        >
          {item.name}
        </Link>
      ))}
    </div>
  );
};

export default Dashboard;
