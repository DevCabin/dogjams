import React, { useState } from 'react';

const FALLBACK_IMG = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"%3E%3Crect width="400" height="400" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="%239ca3af"%3ENo Image%3C/text%3E%3C/svg%3E';

const ProductCard = ({ product }) => {
  const [imgSrc, setImgSrc] = useState(product.image_urls[0] || FALLBACK_IMG);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <img
        src={imgSrc}
        alt={product.title}
        className="w-full h-48 object-cover bg-gray-100"
        onError={() => setImgSrc(FALLBACK_IMG)}
      />
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2">{product.title}</h3>
        <p className="text-gray-600 mb-2">{product.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold text-green-600">${product.price.toFixed(2)}</span>
          <a 
            href={product.product_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors duration-300"
          >
            View Details
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;