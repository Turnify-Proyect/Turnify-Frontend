import { Routes, Route } from "react-router-dom";
import Home from "./Views/Home/Home";
import Login from "./Views/Login/Login";
import Register from "./Views/Register/Register";
import Services from "./Views/Services/Services";
import ClientDashboard from "./Views/ClientDashboard/ClientDashboard";
import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/services" element={<Services />} />
      <Route path="/dashboard" element={<ClientDashboard />} />
    </Routes>
  );
}

export default App;