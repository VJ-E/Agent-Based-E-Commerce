'use client';

import { useCart } from '@/components/CartProvider';
import { useAuth } from '@/components/AuthProvider';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Checkout() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      const payload = {
        agentId: user._id, // Used for session mapping
        userId: user._id, // Used for user association
        items: cart.map(item => ({ productId: item._id, quantity: item.quantity }))
      };

      // Reuse the headless checkout API, but since it's a manual UI checkout we can send it directly
      const res = await fetch('/api/llm/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        clearCart();
        router.push('/account');
      } else {
        setError(data.reason || 'Payment failed');
      }
    } catch (err) {
      setError('An unexpected error occurred during payment.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null; // Middleware will redirect, but just in case
  
  if (cart.length === 0) {
    return (
      <div className="min-h-screen pt-28 px-6 flex flex-col items-center max-w-[1920px] mx-auto bg-transparent text-center">
         <h1 className="text-3xl font-black text-zinc-800 font-[family-name:var(--font-body)] mb-4">Your cart is empty</h1>
         <p className="text-zinc-500 mb-8">Add some items before checking out.</p>
         <button onClick={() => router.push('/shop')} className="clay-btn bg-green-500 text-white px-8 py-3 rounded-full font-bold">Go to Shop</button>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] pt-12 px-6 flex flex-col items-center max-w-4xl mx-auto bg-transparent">
      <h1 className="text-3xl md:text-4xl font-black text-zinc-800 font-[family-name:var(--font-body)] tracking-tight mb-8 w-full text-left">Secure Checkout</h1>
      
      <div className="w-full grid md:grid-cols-2 gap-8">
        <div className="clay-card rounded-[2rem] p-8 space-y-6">
          <h2 className="text-xl font-bold text-zinc-800 border-b pb-4">Order Summary</h2>
          <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
            {cart.map((item, idx) => {
              const price = item.isDeal ? item.price * (1 - item.discountPercentage / 100) : item.price;
              return (
                <div key={`${item._id}-${idx}`} className="flex gap-4 items-center">
                  <div className="w-16 h-16 rounded-xl bg-white border border-zinc-100 p-1 flex-shrink-0">
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover mix-blend-multiply" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-zinc-700 line-clamp-1">{item.name}</h3>
                    <p className="text-xs text-zinc-500 mt-1">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-bold text-zinc-800">₹{Math.round(price * item.quantity).toLocaleString()}</p>
                </div>
              );
            })}
          </div>
          <div className="pt-4 border-t flex justify-between items-center text-xl font-black text-zinc-900">
            <span>Total</span>
            <span className="text-green-600">₹{Math.round(cartTotal).toLocaleString()}</span>
          </div>
        </div>

        <div className="space-y-6">
          <div className="clay-card rounded-[2rem] p-8">
             <h2 className="text-xl font-bold text-zinc-800 mb-6">Payment Method</h2>
             <div className="p-4 border-2 border-green-500 bg-green-50 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">✓</div>
                   <div>
                     <p className="font-bold text-zinc-800">Bentely Pay</p>
                     <p className="text-xs text-green-700 font-medium">1-Click Checkout</p>
                   </div>
                </div>
             </div>
             
             {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-sm font-bold text-center">
                  {error}
                </div>
              )}

             <button 
                onClick={handlePayment} 
                disabled={loading}
                className="w-full mt-6 py-4 rounded-full bg-zinc-900 text-white font-black text-lg shadow-[0_10px_20px_rgba(0,0,0,0.2)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70 flex justify-center items-center"
              >
                {loading ? 'Processing...' : `Pay ₹${Math.round(cartTotal).toLocaleString()}`}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
