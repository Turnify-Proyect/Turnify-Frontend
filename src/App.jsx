import { useState } from 'react'
import { Routes, Route } from "react-router-dom";
import './App.css'
import Home from './Views/Home/Home';
import Services from "./Views/Services/Services";


function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/services" element={<Services />} />
    </Routes>
  );
}

export default App;