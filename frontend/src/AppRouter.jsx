import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Dashboard from "./pages/adminDashboard";
import TrucksPage from "./pages/TrucksPage";
import TrailersPage from "./pages/TrailersPage";
import UsersPage from "./pages/UsersPage";
import PneusPage from "./pages/PneusPage";

function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/trucks" element={<TrucksPage />} />
        <Route path="/trailers" element={<TrailersPage />} />
        <Route path="/chauffeurs" element={<UsersPage />} />
        <Route path="/pneus" element={<PneusPage />} />
      </Routes>
    </Router>
  );
}

export default AppRouter;
