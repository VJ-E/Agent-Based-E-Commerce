'use client';
import Link from 'next/link';
import { useCart } from './CartProvider';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const finalPrice = product.isDeal 
    ? product.price * (1 - product.discountPercentage / 100) 
    : product.price;

  return (
    <Link href={`/product/${product._id}`} className="clay-card p-4 flex flex-col group cursor-pointer relative h-full">
      {product.isDeal && (
        <div className="absolute top-6 left-6 z-10 px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-bold tracking-wide shadow-sm border border-red-100">SALE {product.discountPercentage}%</div>
      )}
      
      <div className="w-full aspect-square rounded-[1.5rem] overflow-hidden mb-4 bg-white shadow-inner relative flex items-center justify-center p-6 border border-zinc-100">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-full w-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="flex flex-col flex-1 px-2">
        <div className="text-xs font-[family-name:var(--font-body)] font-bold text-green-600 mb-1 uppercase tracking-wider truncate" title={product.category}>
          {product.category?.split(' > ').pop()}
        </div>
        <h3 className="font-[family-name:var(--font-body)] font-bold text-lg text-zinc-800 leading-tight mb-2 line-clamp-2">{product.name}</h3>
        
        <div className="mt-auto flex items-end justify-between pt-4">
           <div>
             {product.isDeal ? (
               <div className="flex flex-col">
                 <span className="text-xs text-zinc-400 line-through">₹{product.price.toLocaleString()}</span>
                 <span className="font-[family-name:var(--font-body)] font-extrabold text-xl text-zinc-900">₹{Math.round(finalPrice).toLocaleString()}</span>
               </div>
             ) : (
               <span className="font-[family-name:var(--font-body)] font-extrabold text-xl text-zinc-900">₹{product.price.toLocaleString()}</span>
             )}
           </div>
           <button 
             onClick={(e) => { 
               e.preventDefault(); 
               addToCart(product, 'Default');
             }}
             className="clay-btn px-6 py-2.5 text-sm flex items-center gap-2"
           >
              Add
           </button>
        </div>
      </div>
    </Link>
  );
}
