'use client';
import Link from 'next/link';
import { useCart } from './CartProvider';

export default function MiniProductCard({ product }) {
  const { addToCart } = useCart();
  const finalPrice = product.isDeal 
    ? product.price * (1 - product.discountPercentage / 100) 
    : product.price;

  return (
    <Link href={`/product/${product._id}`} className="flex flex-col p-3 bg-white rounded-2xl border border-zinc-100 shadow-sm hover:shadow-md hover:border-green-200 transition-all group min-w-[150px] w-[150px] sm:min-w-[180px] sm:w-[180px] cursor-pointer no-underline relative shrink-0 snap-center">
      
      <h4 className="text-[13px] sm:text-sm font-bold text-zinc-800 line-clamp-1 m-0 mb-2 font-[family-name:var(--font-body)] leading-tight text-center">{product.name}</h4>
      
      <div className="w-full aspect-square shrink-0 rounded-xl overflow-hidden bg-zinc-50 border border-zinc-100 flex items-center justify-center p-2 mb-3">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-full w-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform"
        />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-3 text-center w-full">
          <div className="text-[10px] font-bold text-green-600 mb-1 uppercase tracking-wider truncate w-full" title={product.category}>
            {product.category?.split(' > ').pop()}
          </div>
          <h3 className="text-xs font-bold text-zinc-800 leading-tight mb-2 line-clamp-2" title={product.name}>{product.name}</h3>
      </div>
      <div className="flex flex-col mt-auto items-center">
        <div className="flex items-center gap-1.5 mb-2 h-5">
          {product.isDeal ? (
            <>
              <span className="text-[10px] text-red-500 font-bold bg-red-50 px-1.5 py-0.5 rounded leading-none">-{product.discountPercentage}%</span>
              <span className="text-[13px] sm:text-sm font-black text-zinc-900 m-0 leading-none">₹{Math.round(finalPrice).toLocaleString()}</span>
            </>
          ) : (
             <span className="text-[13px] sm:text-sm font-black text-zinc-900 m-0 leading-none">₹{product.price.toLocaleString()}</span>
          )}
        </div>
        
        <button 
          onClick={(e) => { 
            e.preventDefault(); 
            addToCart(product, 'Default');
          }}
          className="w-full py-1.5 rounded-full bg-green-50 text-green-700 text-xs font-bold hover:bg-green-500 hover:text-white transition-colors border border-green-100 shadow-sm active:scale-95 flex items-center justify-center gap-1 font-[family-name:var(--font-body)]"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Add
        </button>
      </div>
    </Link>
  );
}
