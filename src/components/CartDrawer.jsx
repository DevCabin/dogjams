import React from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { getProductSlug } from '../utils/slugify';

const FALLBACK_IMG = 'data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" width=\"400\" height=\"400\" viewBox=\"0 0 400 400\"%3E%3Crect width=\"400\" height=\"400\" fill=\"%23f3f4f6\"/%3E%3Ctext x=\"50%25\" y=\"50%25\" dominant-baseline=\"middle\" text-anchor=\"middle\" font-family=\"sans-serif\" font-size=\"18\" fill=\"%239ca3af\"%3ENo Image%3C/text%3E%3C/svg%3E';

const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY || '';
const CHECKOUT_ENDPOINT = import.meta.env.VITE_CHECKOUT_ENDPOINT || '/api/checkout';

const CartDrawer = () => {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, totalItems, totalPrice, clearCart } = useCart();

  const handleCheckout = async () => {
    if (!STRIPE_PUBLIC_KEY) {
      alert('Stripe is not configured.');
      return;
    }

    try {
      const stripe = await loadStripe(STRIPE_PUBLIC_KEY);
      const response = await fetch(CHECKOUT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(item => ({
            id: item.id,
            title: item.title,
            price: item.price,
            quantity: item.quantity,
            image_url: item.image_urls?.[0] || '',
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Checkout session failed');
      }

      const { sessionId } = await response.json();
      await stripe.redirectToCheckout({ sessionId });
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Checkout failed.');
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-all duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-orange-50 shadow-2xl z-50 transform transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-6 border-b border-orange-100">
            <h2 className="text-2xl font-black text-gray-900">
              Your Cart <span className="text-indigo-600">({totalItems})</span>
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 scrollbar-hide">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="bg-white p-6 rounded-3xl shadow-sm mb-4">
                   <svg className="w-16 h-16 text-gray-200" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 18c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4zM17 18c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4z" />
                  </svg>
                </div>
                <p className="text-xl font-bold text-gray-800">Your cart is empty</p>
                <button
                  onClick={() => setIsOpen(false)}
                  className="mt-4 text-indigo-600 font-bold hover:underline"
                >
                  Continue shopping
                </button>
              </div>
            ) : (
              items.map(item => (
                <div key={item.id} className="flex gap-4 bg-white p-4 rounded-3xl shadow-sm border border-orange-50">
                  <Link to={`/products/${getProductSlug(item)}`} onClick={() => setIsOpen(false)}>
                    <img
                      src={item.image_urls?.[0] || FALLBACK_IMG}
                      alt={item.title}
                      className="w-24 h-24 object-cover rounded-2xl bg-gray-100"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/products/${getProductSlug(item)}`}
                      onClick={() => setIsOpen(false)}
                      className="font-bold text-gray-900 text-lg truncate block hover:text-indigo-600 transition-colors"
                    >
                      {item.title}
                    </Link>
                    <p className="text-indigo-600 font-black text-lg mt-1">
                      ${item.price.toFixed(2)}
                    </p>
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center bg-gray-100 rounded-full p-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white hover:shadow-sm transition-all"
                        >
                          −
                        </button>
                        <span className="mx-3 font-bold text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white hover:shadow-sm transition-all"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="ml-auto text-sm font-medium text-red-400 hover:text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-6 border-t border-orange-100 space-y-4 bg-white rounded-t-3xl">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">Subtotal</span>
                <span className="text-2xl font-black text-gray-900">${totalPrice.toFixed(2)}</span>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-100 transition-all active:scale-95"
              >
                Checkout with Stripe
              </button>
              <button
                onClick={clearCart}
                className="w-full text-gray-400 hover:text-gray-600 text-sm font-medium transition-colors"
              >
                Clear everything
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartDrawer;
