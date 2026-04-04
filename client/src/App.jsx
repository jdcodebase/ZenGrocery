import Navbar from "./components/layout/Navbar";
import AppRoutes from "./routes/AppRoutes";
import "./App.css";
import SideBar from "./components/layout/SideBar";

const App = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Layout */}
      <div className="flex flex-1">
        {/* Sidebar (Left) */}
        <SideBar />

        {/* Main Content (Right) */}
        <div className="flex-1 p-4">
          <AppRoutes />
        </div>
      </div>
    </div>
  );
};

export default App;
