import React from 'react';
import ProductCard from './ProductCard';
import products from '../data/products.json';

const ProductGrid = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
            DogJams
          </h1>
          <span className="text-sm text-gray-500">Pet Costumes</span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-center mb-2">Dog Costumes</h2>
        <p className="text-center text-gray-500 mb-8">
          {products.length} products found
        </p>

        {products.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            No products yet. Add some via the Chrome extension or API.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ProductGrid;