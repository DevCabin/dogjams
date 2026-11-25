import React from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';

const FALLBACK_IMG = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"%3E%3Crect width="400" height="400" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="%239ca3af"%3ENo Image%3C/text%3E%3C/svg%3E';

const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY || '';
const CHECKOUT_ENDPOINT = import.meta.env.VITE_CHECKOUT_ENDPOINT || '/api/checkout';

const CartDrawer = () => {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, totalItems, totalPrice, clearCart } = useCart();

  const handleCheckout = async () => {
    if (!STRIPE_PUBLIC_KEY) {
      alert('Stripe is not configured. Add VITE_STRIPE_PUBLIC_KEY to your environment.');
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
      alert('Checkout failed. Make sure your checkout endpoint is running.');
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h2 className="text-xl font-bold">Your Cart ({totalItems})</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-800 text-2xl leading-none"
            >
              &times;
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {items.length === 0 ? (
              <div className="text-center text-gray-500 py-12">
                <p className="text-lg mb-2">Your cart is empty</p>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-blue-600 hover:underline"
                >
                  Continue shopping
                </button>
              </div>
            ) : (
              items.map(item => (
                <div key={item.id} className="flex gap-4 bg-gray-50 rounded-lg p-3">
                  <Link to={`/product/${item.id}`} onClick={() => setIsOpen(false)}>
                    <img
                      src={item.image_urls?.[0] || FALLBACK_IMG}
                      alt={item.title}
                      className="w-20 h-20 object-cover rounded-md bg-gray-200"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/product/${item.id}`}
                      onClick={() => setIsOpen(false)}
                      className="font-semibold text-sm truncate block hover:text-blue-600"
                    >
                      {item.title}
                    </Link>
                    <p className="text-green-600 font-bold text-sm mt-1">
                      ${item.price.toFixed(2)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-sm"
                      >
                        &minus;
                      </button>
                      <span className="text-sm font-medium w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-sm"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="ml-auto text-red-500 hover:text-red-700 text-xs underline"
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
            <div className="border-t px-6 py-4 space-y-3">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Checkout with Stripe
              </button>
              <button
                onClick={clearCart}
                className="w-full text-gray-500 hover:text-gray-700 text-sm underline"
              >
                Clear cart
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartDrawer;
