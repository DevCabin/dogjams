import React from 'react';
import ReactDOM from 'react-dom/client';
import ProductGrid from './components/ProductGrid';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ProductGrid />
  </React.StrictMode>
);