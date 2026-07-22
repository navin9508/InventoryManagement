import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AddProduct from './pages/AddProduct';
import Inventory from './pages/Inventory';
import Orders from './pages/Orders';
import Suppliers from './pages/Suppliers';
import Sales from './pages/Sales';
import Salesreport from './pages/Salesreport';
import Customers from './pages/Customers';
import Profile from './pages/Profile';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add-product" element={<AddProduct />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/suppliers" element={<Suppliers />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/salesreport" element={<Salesreport />} />
        <Route path="/customers" element={<Customers />} />
         <Route path="/profile" element={<Profile/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
