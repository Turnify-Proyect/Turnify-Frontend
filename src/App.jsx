import { useState } from 'react'
import { Routes, Route } from "react-router-dom";
import './App.css'
import Home from './Views/Home/Home';
import Services from "./Views/Services/Services";
import ClientDashboard from "./Views/ClientDashboard/ClientDashboard";
import Login from "./Views/Login/Login";


function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/services" element={<Services />} />
      <Route path="/dashboard" element={<ClientDashboard />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}

export default App;