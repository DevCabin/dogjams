import React from 'react';

const ProductCard = ({ product }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <img 
        src={product.image_urls[0] || 'https://via.placeholder.com/300'} 
        alt={product.title}
        className="w-full h-48 object-cover"
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