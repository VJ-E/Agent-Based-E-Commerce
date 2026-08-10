'use client';
import { useState } from 'react';
import { useCart } from './CartProvider';

export default function AddToCartClient({ product, finalPrice }) {
  const { addToCart } = useCart();
  const colors = ['Space Gray', 'Midnight Blue', 'Starlight Silver', 'Matte Black'];
  const [selectedColor, setSelectedColor] = useState(colors[0]);

  return (
    <div>
      <div className="mb-8">
        <h3 className="text-sm font-bold text-zinc-500 mb-3 uppercase tracking-widest font-[family-name:var(--font-body)]">Select Color: <span className="font-black text-green-600 ml-1">{selectedColor}</span></h3>
        <div className="flex flex-wrap gap-3">
          {colors.map(color => (
            <button 
              key={color}
              onClick={() => setSelectedColor(color)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all font-[family-name:var(--font-body)] ${
                selectedColor === color 
                  ? 'bg-green-50 text-green-700 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05),inset_-2px_-2px_4px_rgba(255,255,255,1)] border border-green-100' 
                  : 'bg-zinc-50 text-zinc-500 hover:bg-zinc-100 border border-transparent shadow-[4px_4px_8px_rgba(0,0,0,0.02),-4px_-4px_8px_rgba(255,255,255,0.8)]'
              }`}
            >
              {color}
            </button>
          ))}
        </div>
      </div>
      
      <button 
        onClick={() => addToCart(product, selectedColor)}
        className="clay-btn w-full py-4 text-lg font-[family-name:var(--font-body)]"
      >
        Add to Cart - ₹{Math.round(finalPrice).toLocaleString()}
      </button>
    </div>
  );
}
