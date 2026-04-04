import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ROUTES } from "../../routes/routes";
import { FaBars, FaTimes } from "react-icons/fa";
import { FaArrowCircleLeft } from "react-icons/fa";
import {
  MdPointOfSale,
  MdPriceCheck,
  MdScale,
  MdInventory,
} from "react-icons/md";

const actions = [
  { name: "New Bill", path: ROUTES.BILLING, icon: <MdPointOfSale /> },
  { name: "Price Check", path: ROUTES.PRICE, icon: <MdPriceCheck /> },
  { name: "+ Weigh Items", path: ROUTES.WEIGH, icon: <MdScale /> },
  { name: "+ Unit Items", path: ROUTES.UNIT, icon: <MdInventory /> },
  { name: "Inventory", path: ROUTES.INVENTORY, icon: <MdInventory /> },
];

const SideBar = () => {
  const [open, setOpen] = useState(true);
  const location = useLocation();

  return (
    <>
      {/* Mobile Toggle Button */}
      {/* <button
        onClick={() => setOpen(!open)}
        className="fixed top-4 left-4 z-50 bg-white shadow-md p-2 rounded-md md:hidden"
      >
        {open ? <FaTimes /> : <FaBars />}
      </button> */}

      {/* Sidebar: Hidden on mobile, flex on md+ */}
      <div
        className={`bg-white border-r min-h-screen p-4 flex flex-col gap-3 transition-all duration-300
        ${open ? "w-52" : "w-16"} 
        hidden md:flex`} // hidden on mobile, visible on md+
      >
        {/* Desktop Toggle */}
        <button
          onClick={() => setOpen(!open)}
          className={`mb-4 text-gray-600 flex hover:text-black ${open ? "justify-end" : "justify-center"}`}
        >
          {open ? <FaArrowCircleLeft /> : <FaBars />}
        </button>

        {actions.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition 
              ${
                location.pathname === item.path
                  ? "bg-gray-200 font-semibold"
                  : "text-gray-700 hover:bg-gray-100"
              }
              ${open ? "justify-start" : "justify-center"}`}
          >
            <span className="text-xl">{item.icon}</span>
            {open && <span className="text-sm font-medium">{item.name}</span>}
          </Link>
        ))}
      </div>
    </>
  );
};

export default SideBar;
