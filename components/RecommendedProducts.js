'use client';
import { useEffect, useState } from 'react';
import MiniProductCard from './MiniProductCard';

export default function RecommendedProducts({ userId, currentProductId = null }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        setLoading(true);
        // 1. Fetch recommended Product IDs from our Next.js API proxy
        let url = `/api/recommendations/${userId}`;
        if (currentProductId) {
          url += `?current_product_id=${currentProductId}`;
        }
        
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch recommendations');
        
        const data = await res.json();
        const recommendedIds = data.recommendations;
        
        if (!recommendedIds || recommendedIds.length === 0) {
          setLoading(false);
          return;
        }

        // 2. Fetch full product details from our Next.js API
        const productRes = await fetch(`/api/products?ids=${recommendedIds.join(',')}`);
        const productData = await productRes.json();
        
        // 3. Sort the products to match the exact order returned by the Flask API (since order matters for relevance)
        const sortedProducts = recommendedIds
          .map(id => productData.find(p => p._id === id))
          .filter(Boolean); // Remove any nulls if a product was deleted
          
        setProducts(sortedProducts);
      } catch (error) {
        console.error("Error loading recommendations:", error);
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      fetchRecommendations();
    }
  }, [userId, currentProductId]);

  if (loading) {
    return (
      <div className="w-full py-12">
        <h2 className="text-2xl font-black text-zinc-800 mb-6 px-6 lg:px-8 font-[family-name:var(--font-body)]">Recommended for You</h2>
        <div className="flex overflow-x-auto gap-4 px-6 lg:px-8 pb-8 snap-x" style={{ scrollbarWidth: 'none' }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
             <div key={i} className="min-w-[150px] sm:min-w-[180px] h-[250px] bg-zinc-100 rounded-2xl animate-pulse shrink-0 snap-start border border-zinc-200"></div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <div className="w-full py-12">
      <h2 className="text-2xl font-black text-zinc-800 mb-6 px-6 lg:px-8 font-[family-name:var(--font-body)]">Recommended for You</h2>
      
      {/* Horizontal scrolling container */}
      <div className="flex overflow-x-auto gap-4 px-6 lg:px-8 pb-8 snap-x w-full" style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
        {products.map(product => (
          <MiniProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
}
