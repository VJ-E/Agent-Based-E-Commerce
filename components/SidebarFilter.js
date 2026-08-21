'use client';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SidebarFilter({ categories }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentCategory = searchParams.get('category') || 'All';
  const isDeal = searchParams.get('isDeal') === 'true';

  const updateFilters = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'All') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    if (key === 'category') params.delete('q');
    
    router.push(`/?${params.toString()}`, { scroll: false });
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 rounded-[2rem] bg-zinc-50 shadow-[20px_0_40px_rgba(0,0,0,0.03),inset_4px_4px_8px_rgba(255,255,255,1),inset_-4px_-4px_8px_rgba(0,0,0,0.05)] h-[calc(100vh-6rem)] sticky top-24 border border-white/50 z-40 mx-6 mb-10">
      <div className="p-6 border-b border-zinc-200/50">
        <h2 className="font-[family-name:var(--font-body)] text-lg font-bold text-zinc-800">Filters</h2>
        <p className="font-[family-name:var(--font-body)] text-xs text-zinc-500 mt-1">Refine your search</p>
      </div>

      <nav className="flex flex-col gap-2 p-6 flex-1 font-[family-name:var(--font-body)] text-sm">
        <div className="mb-4">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Categories</h3>
          {['All', ...categories].map((cat) => (
            <button
              key={cat}
              onClick={() => updateFilters('category', cat)}
              className={`w-full flex items-center gap-3 rounded-xl p-3 transition-all ${
                currentCategory === cat 
                  ? 'bg-green-50 text-green-700 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05),inset_-2px_-2px_4px_rgba(255,255,255,1)] font-semibold' 
                  : 'text-zinc-600 hover:bg-zinc-100 hover:translate-x-1 active:scale-95'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="mb-4">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Offers</h3>
          <label className="flex items-center space-x-3 cursor-pointer group p-2">
            <input 
              type="checkbox" 
              checked={isDeal}
              onChange={(e) => updateFilters('isDeal', e.target.checked ? 'true' : '')}
              className="w-5 h-5 rounded border-zinc-300 text-green-500 focus:ring-green-500 shadow-inner cursor-pointer"
            />
            <span className={`text-sm font-medium ${isDeal ? 'text-green-700 font-bold' : 'text-zinc-600 group-hover:text-zinc-900'}`}>
              Today's Deals
            </span>
          </label>
        </div>

        <div>
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Price Range</h3>
          <div className="grid grid-cols-2 gap-3">
            <input 
              type="number" 
              placeholder="Min" 
              className="clay-input w-full text-sm p-3"
              onBlur={(e) => updateFilters('minPrice', e.target.value)}
            />
            <input 
              type="number" 
              placeholder="Max" 
              className="clay-input w-full text-sm p-3"
              onBlur={(e) => updateFilters('maxPrice', e.target.value)}
            />
          </div>
        </div>
      </nav>
      <div className="p-6 mt-auto">
        <button onClick={() => router.push('/', { scroll: false })} className="w-full py-3 px-4 rounded-xl text-zinc-600 bg-zinc-100 hover:bg-zinc-200 transition-colors font-semibold text-sm shadow-sm active:scale-95">Reset All</button>
      </div>
    </aside>
  );
}
