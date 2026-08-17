'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import SidebarFilter from '@/components/SidebarFilter';
import HeroLanding from '@/components/HeroLanding';

function Storefront() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatState, setChatState] = useState('closed'); // 'closed', 'open', 'maximized'

  useEffect(() => {
    setLoading(true);
    fetch(`/api/products?${searchParams.toString()}`)
      .then(res => res.json())
      .then(data => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load products", err);
        setLoading(false);
      });
  }, [searchParams]);

  return (
    <>
      {/* Scroll Animated Hero Landing */}
      <HeroLanding />

      <div className="flex max-w-[1920px] mx-auto min-h-screen pt-12 relative z-10 bg-transparent">
        <SidebarFilter categories={['Electronics', 'Clothing', 'Furniture', 'Accessories', 'Sports', 'Home & Kitchen']} />
        
        {/* Main Content Area */}
        <main className="flex-1 lg:ml-0 p-6 lg:p-8 w-full">
          {/* Page Header */}
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="font-[family-name:var(--font-body)] text-4xl font-black text-zinc-800 tracking-tight">Discover</h1>
            <p className="text-zinc-500 mt-2 font-[family-name:var(--font-body)]">Latest trends and essentials just for you.</p>
          </div>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8 animate-pulse pb-24">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="clay-card rounded-2xl h-[380px]"></div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8 pb-24">
            {products.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 clay-card rounded-3xl pb-24">
             <h3 className="text-xl font-bold text-zinc-800">No products found</h3>
             <p className="mt-2 text-zinc-500">Try adjusting your filters or search query.</p>
          </div>
        )}
      </main>
      </div>
      
      {/* AI Shopping Assistant Widget */}
      {chatState === 'closed' ? (
        <button 
          onClick={() => setChatState('open')} 
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-green-500 text-white flex items-center justify-center shadow-[0_10px_20px_rgba(34,197,94,0.3),inset_2px_2px_4px_rgba(255,255,255,0.4),inset_-2px_-2px_4px_rgba(0,0,0,0.2)] hover:shadow-[0_12px_24px_rgba(34,197,94,0.4)] hover:bg-green-400 hover:scale-105 transition-all border-none font-black text-2xl font-[family-name:var(--font-logo)] cursor-pointer active:scale-95"
        >
          B
        </button>
      ) : (
        <>
          {chatState === 'open' && (
            <div className="fixed inset-0 z-40" onClick={() => setChatState('closed')} />
          )}
          
          <div className={`fixed z-50 flex flex-col items-end transition-all duration-300 ${
            chatState === 'maximized' ? 'top-20 bottom-0 left-0 right-0' : 'bottom-6 right-6'
          }`}>
            <div className={`clay-card flex flex-col overflow-hidden transition-all duration-300 shadow-[0_20px_50px_rgba(0,0,0,0.1)] ${
              chatState === 'maximized' ? 'w-full h-full rounded-none' : 'w-80 sm:w-96 h-[450px] rounded-3xl border border-white'
            }`}>
              {/* Header */}
              <div className="bg-green-50/80 backdrop-blur-md p-4 border-b border-white flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  {chatState === 'maximized' ? (
                    <button onClick={() => setChatState('closed')} className="flex items-center gap-2 text-green-700 hover:text-green-800 font-bold font-[family-name:var(--font-body)] hover:bg-green-100 px-3 py-1.5 rounded-full transition-colors">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                      Back to Home
                    </button>
                  ) : (
                    <>
                      <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center shadow-inner font-black text-lg font-[family-name:var(--font-logo)]">B</div>
                      <span className="font-[family-name:var(--font-body)] font-bold text-sm text-green-700 tracking-wide">SHOPPING ASSISTANT</span>
                    </>
                  )}
                </div>
                {chatState !== 'maximized' && (
                  <div className="flex items-center gap-1">
                    <button onClick={() => setChatState('maximized')} className="text-green-600 hover:bg-green-100 w-8 h-8 flex items-center justify-center rounded-full transition-colors font-black">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9"></polyline><line x1="9" y1="15" x2="21" y2="3"></line><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="3" y2="21"></line></svg>
                    </button>
                    <button onClick={() => setChatState('closed')} className="text-zinc-400 hover:text-red-500 hover:bg-red-50 w-8 h-8 flex items-center justify-center rounded-full transition-colors font-black">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                  </div>
                )}
              </div>
              {/* Chat Area */}
              <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4 bg-zinc-50/50">
                <div className="flex items-start gap-2 max-w-[85%]">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0 border border-green-200">
                    <span className="text-green-600 text-lg font-[family-name:var(--font-logo)]">B</span>
                  </div>
                  <div className="bg-white p-3 rounded-2xl rounded-tl-sm shadow-sm border border-zinc-100 text-sm text-zinc-700 font-[family-name:var(--font-body)]">
                      Hi there! Looking for anything specific today? I can help you find deals or recommend products based on your style.
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 ml-10">
                  <button className="px-3 py-1.5 bg-white border border-green-200 rounded-full text-xs font-medium text-green-700 hover:bg-green-50 transition-colors shadow-sm">Find tech deals</button>
                  <button className="px-3 py-1.5 bg-white border border-green-200 rounded-full text-xs font-medium text-green-700 hover:bg-green-50 transition-colors shadow-sm">Gift ideas</button>
                </div>
              </div>
              {/* Input Area */}
              <div className="p-3 bg-white border-t border-zinc-100">
                <div className="relative flex items-center">
                  <input className="clay-input w-full py-2.5 pl-4 pr-10 text-sm text-zinc-700 placeholder-zinc-400 bg-zinc-50" placeholder="Ask me anything..." type="text"/>
                  <button className="absolute right-2 text-green-600 p-1.5 hover:bg-green-50 rounded-full transition-colors flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="h-[100vh] flex items-center justify-center text-green-600 font-black text-xl">Loading Bentely...</div>}>
      <Storefront />
    </Suspense>
  );
}
