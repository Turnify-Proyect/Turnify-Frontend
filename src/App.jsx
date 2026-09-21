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
import About from "./Views/About/About";
import Contact from "./Views/Contact/Contact";
import AdminDashboard from "./Views/Admin/AdminDashboard";
import Checkout from "./Views/Checkout/Checkout";
import PaymentSuccess from "./Views/Payment/PaymentSuccess";
import PaymentFailure from "./Views/Payment/PaymentFailure";
import PaymentPending from "./Views/Payment/PaymentPending";

import "./App.css";

function App() {
  return (
    <>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/services" element={<Services />} />
      <Route path="/services/:id" element={<ServiceDetail />} />
      <Route path="/dashboard" element={<ProtectedRoute> <ClientDashboard /> </ProtectedRoute>}/>
      <Route path="/booking" element={<ProtectedRoute> <BookingPage /></ProtectedRoute>}/>
      <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>}/>
      <Route path="/checkout" element={<ProtectedRoute> <Checkout /></ProtectedRoute>}/>
      <Route path="/payment/success" element={<PaymentSuccess />} />
      <Route path="/payment/failure" element={<PaymentFailure />} />
      <Route path="/payment/pending" element={<PaymentPending />} />
    </Routes>
    <Chatbot />
    </>
  );
}

export default App;