import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getProductSlug } from '../utils/slugify';

const FALLBACK_IMG = 'data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" width=\"400\" height=\"400\" viewBox=\"0 0 400 400\"%3E%3Crect width=\"400\" height=\"400\" fill=\"%23f3f4f6\"/%3E%3Ctext x=\"50%25\" y=\"50%25\" dominant-baseline=\"middle\" text-anchor=\"middle\" font-family=\"sans-serif\" font-size=\"18\" fill=\"%239ca3af\"%3ENo Image%3C/text%3E%3C/svg%3E';

const ProductCard = ({ product }) => {
  const [imgSrc, setImgSrc] = useState(product.image_urls?.[0] || FALLBACK_IMG);
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="group relative bg-white rounded-[2.5rem] shadow-xl shadow-indigo-100/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden border border-gray-50">
      <Link to={`/products/${getProductSlug(product)}`} className="block overflow-hidden">
        <div className="aspect-square w-full overflow-hidden bg-gray-100">
          <img
            src={imgSrc}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={(e) => { e.target.src = FALLBACK_IMG; }}
          />
        </div>
      </Link>
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-xl text-gray-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
            {product.title}
          </h3>
        </div>
        
        <p className="text-gray-500 text-sm line-clamp-2 mb-4 min-h-[2.5rem]">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-2xl font-black text-indigo-600">
            ${product.price.toFixed(2)}
          </span>
          
          <button
            onClick={handleAdd}
            className={`relative overflow-hidden px-5 py-3 rounded-2xl font-bold text-sm transition-all duration-300 ${
              added
                ? 'bg-green-500 text-white scale-95'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 active:scale-95'
            }`}
          >
            {added ? (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.708 5.293a1 1 0 010 1.414L9 13.414a1 1 0 01-1.414 0L2.293 7.707a1 1 0 011.414-1.414L9 10.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Added
              </span>
            ) : (
              'Add to Cart'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
