import localFont from 'next/font/local';
import './globals.css';
import Navbar from '@/components/Navbar';
import { CartProvider } from '@/components/CartProvider';
import CartSidebar from '@/components/CartSidebar';

const gondens = localFont({ 
  src: './fonts/Gondens DEMO.otf',
  variable: '--font-logo',
  display: 'swap',
});

const openSans = localFont({ 
  src: [
    {
      path: './fonts/OpenSans-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/OpenSans-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-body',
  display: 'swap',
});

export const metadata = {
  title: 'Bentely | AI E-Commerce',
  description: 'Premium Agent-Based E-Commerce Platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${openSans.variable} ${gondens.variable} font-sans text-zinc-700 antialiased selection:bg-green-500/30 selection:text-green-900 bg-zinc-50 relative`}>
        {/* Geometric Matte Grid Background */}
        <div className="fixed inset-0 z-[-1] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#d4d4d8 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
           <div className="absolute inset-0 bg-gradient-to-b from-transparent to-zinc-50/80"></div>
        </div>
        <CartProvider>
          <Navbar />
          <CartSidebar />
          <main className="relative z-10 pt-20">
            {children}
          </main>
        </CartProvider>
      </body>
    </html>
  );
}
