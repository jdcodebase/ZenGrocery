import { Link } from "react-router-dom";
import { ROUTES } from "../../routes/routes";
import { FaBars, FaTimes } from "react-icons/fa";
import { useState } from "react";

const actions = [
  { name: "New Bill", path: ROUTES.BILLING },
  { name: "Price Check", path: ROUTES.PRICE },
  { name: "+ Weigh Items", path: ROUTES.WEIGH },
  { name: "+ Unit Items", path: ROUTES.UNIT },
  { name: "Inventory", path: ROUTES.INVENTORY },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Top Navbar */}
      <div className="py-3 px-4 shadow-sm border-b border-gray-300 bg-white text-black flex items-center justify-between">
        {/* Logo */}
        <Link to={ROUTES.HOME} className="font-semibold text-xl px-2">
          ZenGrocery
        </Link>

        {/* Hamburger (Mobile Only) */}
        <button className="md:hidden text-xl" onClick={() => setIsOpen(true)}>
          <FaBars />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Sidebar */}
          <div className="w-64 bg-white h-full p-4 flex flex-col gap-4 shadow-lg transform transition-all duration-300">
            {/* Close Button */}
            <button
              className="text-xl self-end mb-4"
              onClick={() => setIsOpen(false)}
            >
              <FaTimes />
            </button>

            {/* Links */}
            {actions.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className="py-2 px-3 rounded hover:bg-gray-100"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Overlay Background */}
          <div
            className="flex-1 bg-black bg-opacity-30"
            onClick={() => setIsOpen(false)}
          />
        </div>
      )}
    </>
  );
};

export default Navbar;
