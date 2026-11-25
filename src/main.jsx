import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import CartDrawer from './components/CartDrawer';
import ProductGrid from './components/ProductGrid';
import ProductDetail from './components/ProductDetail';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <CartProvider>
      <BrowserRouter>
        <CartDrawer />
        <Routes>
          <Route path="/" element={<ProductGrid />} />
          <Route path="/products" element={<ProductGrid />} />
          <Route path="/products/:slug" element={<ProductDetail />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  </React.StrictMode>
);
