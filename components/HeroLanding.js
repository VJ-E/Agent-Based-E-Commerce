'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

export default function HeroLanding() {
  const containerRef = useRef(null);
  
  // Track scroll position within this component using window scroll
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Fade out and translate up the main text as user scrolls down
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, -100]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);

  // Image parallax effect
  const imageY1 = useTransform(scrollYProgress, [0, 1], [0, 250]);
  const imageY2 = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const imageY3 = useTransform(scrollYProgress, [0, 1], [0, 300]);

  return (
    <div ref={containerRef} className="relative w-full h-[150vh]">
      {/* Sticky container holds the layout while scrolling */}
      <div className="sticky top-20 h-[calc(100vh-5rem)] w-full overflow-hidden flex items-center justify-center bg-zinc-50 border-b border-zinc-200/50">
        
        {/* Background gradient blob */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-green-200/40 rounded-full blur-[100px] -z-10 mix-blend-multiply opacity-50" />

        <motion.div 
          style={{ opacity, y, scale }}
          className="text-center z-10 px-6 max-w-4xl mx-auto flex flex-col items-center"
        >
          <div className="inline-block mb-8 px-5 py-2 rounded-full bg-green-100 text-green-700 font-[family-name:var(--font-body)] font-black tracking-[0.2em] text-sm shadow-[inset_2px_2px_4px_rgba(255,255,255,1),inset_-2px_-2px_4px_rgba(0,0,0,0.05)] border border-green-50">
            A NEW ERA OF CLAYMORPHISM
          </div>
          <h1 className="text-7xl md:text-9xl font-black text-zinc-900 tracking-tighter leading-[0.9] font-[family-name:var(--font-logo)] mb-8 drop-shadow-sm lowercase">
            Welcome to <br/><span className="text-green-500">Bentely</span>.
          </h1>
          <p className="text-xl md:text-2xl text-zinc-500 font-[family-name:var(--font-body)] max-w-2xl leading-relaxed font-medium">
            Discover premium AI shopping agents and seamless e-commerce experiences crafted for modern lifestyles. 
          </p>
          <button className="clay-btn mt-12 px-12 py-5 text-2xl font-[family-name:var(--font-body)] tracking-wide group shadow-green-500/20 text-green-700 font-black">
            Explore Deals <span className="inline-block group-hover:translate-x-2 transition-transform">→</span>
          </button>
        </motion.div>

        {/* Floating Decorative Images (Parallax) */}
        <motion.div 
          style={{ y: imageY1 }}
          className="absolute left-10 lg:left-[10%] top-[10%] w-48 h-64 md:w-72 md:h-96 clay-card overflow-hidden hidden md:block rotate-[-6deg]"
        >
          <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600&h=800" alt="Hot Deal 1" className="w-full h-full object-cover mix-blend-multiply hover:scale-110 transition-transform duration-700" />
        </motion.div>

        <motion.div 
          style={{ y: imageY2 }}
          className="absolute right-10 lg:right-[15%] bottom-[15%] w-56 h-56 md:w-80 md:h-80 clay-card rounded-[3rem] overflow-hidden hidden lg:block rotate-[4deg]"
        >
          <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600&h=600" alt="Hot Deal 2" className="w-full h-full object-cover mix-blend-multiply hover:scale-110 transition-transform duration-700" />
        </motion.div>

        <motion.div 
          style={{ y: imageY3 }}
          className="absolute right-[5%] top-[25%] w-32 h-32 md:w-48 md:h-48 bg-white rounded-full shadow-[20px_20px_40px_rgba(0,0,0,0.05),-20px_-20px_40px_rgba(255,255,255,1)] flex items-center justify-center font-[family-name:var(--font-body)] font-black text-green-500 text-4xl rotate-[12deg] z-20"
        >
          -40%
        </motion.div>

      </div>
    </div>
  );
}
