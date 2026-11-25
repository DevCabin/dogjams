import React from 'react';
import { useParams, Link } from 'react-router-dom';
import products from '../data/products.json';

const FALLBACK_IMG = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"%3E%3Crect width="400" height="400" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="%239ca3af"%3ENo Image%3C/text%3E%3C/svg%3E';

const ProductDetail = () => {
  const { id } = useParams();
  const product = products.find(p => p.id === id);

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <Link to="/" className="text-blue-600 hover:underline">← Back to all products</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-extrabold tracking-tight text-gray-900 hover:opacity-80">
            DogJams
          </Link>
          <span className="text-sm text-gray-500">Pet Costumes</span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Link to="/" className="text-blue-600 hover:underline mb-6 inline-block">← Back to all products</Link>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="bg-gray-100">
              <img
                src={product.image_urls[0] || FALLBACK_IMG}
                alt={product.title}
                className="w-full h-96 object-cover"
                onError={(e) => { e.target.src = FALLBACK_IMG; }}
              />
            </div>
            <div className="p-8 flex flex-col justify-center">
              <h1 className="text-3xl font-bold mb-4">{product.title}</h1>
              <p className="text-gray-600 mb-6 text-lg">{product.description}</p>
              <span className="text-4xl font-bold text-green-600 mb-8">${product.price.toFixed(2)}</span>
              <a
                href={product.product_url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white text-center font-semibold px-8 py-4 rounded-lg transition-colors duration-300"
              >
                Buy on TEMU
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetail;
