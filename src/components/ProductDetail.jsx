import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import products from '../data/products.json';
import { getProductSlug } from '../utils/slugify';

const FALLBACK_IMG = 'data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" width=\"400\" height=\"400\" viewBox=\"0 0 400 400\"%3E%3Crect width=\"400\" height=\"400\" fill=\"%23f3f4f6\"/%3E%3Ctext x=\"50%25\" y=\"50%25\" dominant-baseline=\"middle\" text-anchor=\"middle\" font-family=\"sans-serif\" font-size=\"18\" fill=\"%239ca3af\"%3ENo Image%3C/text%3E%3C/svg%3E';

const ProductDetail = () => {
  const { slug } = useParams();
  const product = products.find(p => getProductSlug(p) === slug);
  const { addItem, totalItems, setIsOpen } = useCart();
  const [added, setAdded] = useState(false);

  if (!product) {
    return (
      <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-4">Product not found</h1>
          <Link to="/" className="text-indigo-600 hover:text-indigo-500 font-medium transition-colors">
            ← Back to all products
          </Link>
        </div>
      </div>
    );
  }

  const handleAdd = () => {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-black tracking-tighter text-indigo-600 hover:scale-105 transition-transform">
            DogJams
          </Link>
          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsOpen(true)}
              className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full ring-2 ring-white">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <Link to="/" className="text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors mb-8 inline-block">
          ← Back to Catalog
        </Link>

        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 overflow-hidden border border-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="bg-gray-50 flex items-center justify-center overflow-hidden">
              <img
                src={product.image_urls?.[0] || FALLBACK_IMG}
                alt={product.title}
                className="w-full h-[400px] md:h-[600px] object-cover transition-transform duration-500 hover:scale-110"
                onError={(e) => { e.target.src = FALLBACK_IMG; }}
              />
            </div>
            <div className="p-12 flex flex-col justify-center">
              <div className="inline-block px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold tracking-wider uppercase mb-4">
                Pet Fashion
              </div>
              <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
                {product.title}
              </h1>
              <p className="text-gray-500 mb-8 text-lg leading-relaxed">
                {product.description}
              </p>
              
              <div className="flex items-baseline gap-4 mb-10">
                <span className="text-5xl font-black text-indigo-600">
                  ${product.price.toFixed(2)}
                </span>
              </div>

              <button
                onClick={handleAdd}
                className={`w-full py-5 rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg ${
                  added
                    ? 'bg-green-500 text-white scale-95'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-indigo-200 active:scale-95'
                }`}
              >
                {added ? '✓ Added to Cart' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetail;
