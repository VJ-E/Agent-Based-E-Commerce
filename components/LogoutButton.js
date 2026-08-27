'use client';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      // Redirect to home and force a hard refresh to clear state
      window.location.href = '/';
    } catch (err) {
      console.error('Failed to logout', err);
    }
  };

  return (
    <button onClick={handleLogout} className="clay-card rounded-[2rem] p-8 flex items-center gap-6 hover:border-red-300 transition-colors group cursor-pointer block text-left w-full h-full">
      <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform shrink-0">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
      </div>
      <div>
        <h3 className="text-xl font-bold text-zinc-800 group-hover:text-red-500 transition-colors">Log Out</h3>
        <p className="text-zinc-500 mt-1">Sign out of your account.</p>
      </div>
    </button>
  );
}
