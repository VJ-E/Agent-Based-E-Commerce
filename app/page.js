import HeroLanding from '@/components/HeroLanding';
import Link from 'next/link';
import RecommendedProducts from '@/components/RecommendedProducts';

export default function Home() {
  return (
    <>
      <HeroLanding />
      <div className="flex flex-col items-center justify-center py-24 px-6 text-center max-w-4xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-black text-zinc-800 font-[family-name:var(--font-body)] mb-6">
          Ready to discover your next favorite item?
        </h2>
        <p className="text-xl text-zinc-500 mb-10 max-w-2xl font-[family-name:var(--font-body)]">
          Explore our fully conversational, AI-curated catalog featuring thousands of high-quality products.
        </p>
        <Link href="/shop" className="clay-btn bg-green-500 text-white text-xl py-4 px-12 rounded-full font-black tracking-wide shadow-[0_10px_20px_rgba(34,197,94,0.3),inset_2px_2px_4px_rgba(255,255,255,0.4),inset_-2px_-2px_4px_rgba(0,0,0,0.2)] hover:scale-105 active:scale-95 transition-all">
          Enter the Store
        </Link>
      </div>
      
      {/* Test User ID from our batch script seed */}
      <div className="max-w-[1920px] mx-auto w-full">
        <RecommendedProducts userId="12345" />
      </div>
    </>
  );
}
