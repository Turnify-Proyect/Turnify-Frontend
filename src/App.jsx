import { Routes, Route } from "react-router-dom";
import Home from "./Views/Home/Home";
import Login from "./Views/Login/Login";
import Register from "./Views/Register/Register";
import Services from "./Views/Services/Services";
import ClientDashboard from "./Views/ClientDashboard/ClientDashboard";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import Chatbot from "./components/Chatbot/Chatbot";
import BookingPage from "./Views/Booking/BookingPage";
import ServiceDetail from "./Views/Services/ServiceDetail";

import "./App.css";

function App() {
  return (
    <>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/services" element={<Services />} />
      <Route path="/services/:id" element={<ServiceDetail />} />
      <Route path="/dashboard" element={<ProtectedRoute> <ClientDashboard /> </ProtectedRoute>}/>
      <Route path="/booking" element={<ProtectedRoute> <BookingPage /></ProtectedRoute>}/>
    </Routes>
    <Chatbot />
    </>
  );
}

export default App;