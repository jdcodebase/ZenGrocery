import Navbar from "./components/layout/Navbar";
import AppRoutes from "./routes/AppRoutes";
import "./App.css";

const App = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <AppRoutes />
    </div>
  );
};

export default App;
