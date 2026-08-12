'use client';
import Link from 'next/link';
import { useCart } from './CartProvider';

export default function Navbar() {
  const { cartCount, setIsCartOpen } = useCart();

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md shadow-[0_10px_20px_rgba(0,0,0,0.05),inset_4px_4px_8px_rgba(255,255,255,0.8),inset_-4px_-4px_8px_rgba(0,0,0,0.02)] transition-all">
      <div className="flex justify-between items-center px-6 h-20 w-full max-w-[1920px] mx-auto">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-black shadow-lg shadow-green-500/30 group-hover:scale-105 transition-transform text-xl font-[family-name:var(--font-logo)]">
              B
            </div>
            <span className="text-2xl font-black text-green-600 tracking-tight font-[family-name:var(--font-logo)] pt-1">Bentely</span>
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="hidden lg:flex items-center gap-6 ml-8 font-bold text-sm text-zinc-600 font-[family-name:var(--font-body)]">
          <Link href="/" className="hover:text-green-600 transition-colors">Home</Link>
          <Link href="/?category=All" className="hover:text-green-600 transition-colors">Categories</Link>
          <Link href="/?isDeal=true" className="hover:text-green-600 transition-colors text-red-500 flex items-center gap-1">
            Deals
          </Link>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-xl mx-8 hidden md:block">
          <form action="/" method="GET" className="relative flex items-center">
            <svg className="absolute left-4 w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              name="q"
              className="clay-input w-full py-3 pl-12 pr-4 text-sm text-zinc-700 placeholder-zinc-400 focus:ring-0"
              placeholder="Search for products, brands and more..."
              type="text"
            />
          </form>
        </div>

        {/* Trailing Actions */}
        <div className="flex items-center gap-4">
          <Link href="/?isDeal=true" className="text-sm font-bold text-green-600 hover:text-green-700 transition-colors mr-2">Flash Deals</Link>
          <button className="p-3 rounded-full text-zinc-500 hover:text-green-500 hover:scale-105 active:scale-95 transition-all flex items-center justify-center bg-transparent hover:bg-zinc-50">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>
          <button onClick={() => setIsCartOpen(true)} className="p-3 rounded-full text-zinc-500 hover:text-green-500 hover:scale-105 active:scale-95 transition-all flex items-center justify-center bg-transparent hover:bg-zinc-50 relative">
            {/* <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg> */}
            <span className="absolute top-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center text-[10px] text-white font-bold">
              {cartCount}
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
}
