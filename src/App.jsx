import { useState } from 'react'
import { Routes, Route } from "react-router-dom";
import './App.css'
import Home from './Views/Home/Home';
import Services from "./Views/Services/Services";
import ClientDashboard from "./Views/ClientDashboard/ClientDashboard";


function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/services" element={<Services />} />
      <Route path="/dashboard" element={<ClientDashboard />} />
    </Routes>
  );
}

export default App;