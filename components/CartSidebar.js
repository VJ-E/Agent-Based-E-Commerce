'use client';
import { useCart } from './CartProvider';

export default function CartSidebar() {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, cartTotal } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] overflow-hidden">
      <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsCartOpen(false)} />

      <div className="absolute inset-y-0 right-0 max-w-md w-full bg-zinc-50 shadow-[-20px_0_40px_rgba(0,0,0,0.1)] flex flex-col transform transition-transform duration-300 border-l border-white/50">
        <div className="p-6 border-b border-zinc-200/50 flex items-center justify-between bg-white/50 backdrop-blur-md">
          <h2 className="text-xl font-black text-zinc-800 font-[family-name:var(--font-body)]">Your Cart</h2>
          <button onClick={() => setIsCartOpen(false)} className="text-zinc-500 hover:text-green-600 transition-colors p-2 bg-white rounded-full shadow-sm hover:scale-105 active:scale-95">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.03),inset_-4px_-4px_8px_rgba(255,255,255,1)]">
                <svg className="w-10 h-10 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-zinc-500 font-medium">Your cart is empty.</p>
              <button onClick={() => setIsCartOpen(false)} className="mt-4 text-green-600 hover:text-green-700 font-semibold text-sm">Continue Shopping</button>
            </div>
          ) : (
            cart.map((item, idx) => {
              const price = item.isDeal ? item.price * (1 - item.discountPercentage / 100) : item.price;
              return (
                <div key={`${item._id}-${idx}`} className="flex gap-4 p-4 rounded-3xl clay-card">
                  <div className="w-20 h-20 rounded-[1.2rem] bg-white flex-shrink-0 overflow-hidden relative shadow-inner border border-zinc-100 p-2">
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover mix-blend-multiply" />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-start">
                      <h3 className="text-sm font-bold text-zinc-800 line-clamp-2 pr-2 leading-tight">{item.name}</h3>
                      <p className="text-sm font-black text-green-600">₹{Math.round(price).toLocaleString()}</p>
                    </div>
                    {item.color && <p className="text-[11px] font-bold text-zinc-500 mt-1 uppercase tracking-wider">Color: <span className="text-zinc-800">{item.color}</span></p>}

                    <div className="mt-auto pt-3 flex items-center justify-between">
                      <div className="flex items-center clay-input rounded-full overflow-hidden w-fit">
                        <button onClick={() => updateQuantity(item._id, item.color, item.quantity - 1)} className="px-3 py-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors font-black">-</button>
                        <span className="px-2 text-sm font-bold text-zinc-800">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item._id, item.color, item.quantity + 1)} className="px-3 py-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors font-black">+</button>
                      </div>
                      <button onClick={() => removeFromCart(item._id, item.color)} className="text-[11px] uppercase tracking-wider font-bold text-red-500 hover:text-red-600 transition-colors bg-red-50 px-2 py-1 rounded-md">Remove</button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-6 border-t border-zinc-200/50 bg-white/80 backdrop-blur-lg rounded-t-3xl shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
            <div className="flex justify-between text-base font-medium text-zinc-500 mb-2">
              <p>Taxes</p>
              <p>Calculated at checkout</p>
            </div>
            <div className="flex justify-between text-xl font-black text-zinc-900 mb-6 font-[family-name:var(--font-body)]">
              <p>Subtotal</p>
              <p className="text-green-600">₹{Math.round(cartTotal).toLocaleString()}</p>
            </div>
            <a href="/checkout" onClick={() => setIsCartOpen(false)} className="clay-btn w-full py-4 text-lg font-black tracking-wide block text-center">
              Secure Checkout
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
