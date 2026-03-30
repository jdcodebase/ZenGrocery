import { Link } from "react-router-dom";
import { ROUTES } from "../../routes/routes";

const Navbar = () => {
  return (
    <div className="py-3 px-4 shadow-sm border-b border-gray-300 bg-white text-black">
      <Link to={ROUTES.HOME} className="font-semibold text-xl px-5">
        ZenGrocery
      </Link>
    </div>
  );
};

export default Navbar;
