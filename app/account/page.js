import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import LogoutButton from '@/components/LogoutButton';

export default async function AccountPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('bentely_auth_token')?.value;
  
  if (!token) redirect('/login');
  
  const payload = await verifyToken(token);
  if (!payload) redirect('/login');

  return (
    <div className="min-h-screen pt-12 px-6 flex flex-col items-center max-w-[1920px] mx-auto bg-transparent pb-24">
      <div className="w-full max-w-5xl">
        <div className="mb-12">
          <h1 className="text-4xl font-black text-zinc-800 font-[family-name:var(--font-body)] tracking-tight">My Account</h1>
          <p className="text-zinc-500 mt-2 text-lg">Welcome back, <span className="font-bold text-zinc-800">{payload.name}</span></p>
        </div>
        
        {payload.role === 'admin' && (
          <div className="mb-12">
            <h2 className="text-xl font-bold text-zinc-800 mb-6 font-[family-name:var(--font-body)]">Admin Tools</h2>
            <Link href="/admin" className="clay-card rounded-[2rem] p-8 flex items-center gap-6 hover:border-green-300 transition-colors group cursor-pointer block text-left w-full">
              <div className="w-16 h-16 rounded-full bg-zinc-900 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform shrink-0">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-zinc-800 group-hover:text-green-600 transition-colors">Merchant Control Plane</h3>
                <p className="text-zinc-500 mt-1">Manage orders, view logs, and configure agent capabilities.</p>
              </div>
            </Link>
          </div>
        )}

        <h2 className="text-xl font-bold text-zinc-800 mb-6 font-[family-name:var(--font-body)]">Account Settings</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Link href="/account/orders" className="clay-card rounded-[2rem] p-8 flex items-center gap-6 hover:border-green-300 transition-colors group cursor-pointer block text-left w-full h-full">
            <div className="w-16 h-16 rounded-full bg-green-50 text-green-600 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform shrink-0">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 16.2A23.84 23.84 0 0 1 12 22a23.84 23.84 0 0 1-8-5.8"></path><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path><rect width="20" height="14" x="2" y="5" rx="2"></rect></svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-zinc-800 group-hover:text-green-600 transition-colors">Your Orders</h3>
              <p className="text-zinc-500 mt-1">Track, review, or buy things again.</p>
            </div>
          </Link>

          <Link href="/account/password" className="clay-card rounded-[2rem] p-8 flex items-center gap-6 hover:border-blue-300 transition-colors group cursor-pointer block text-left w-full h-full">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform shrink-0">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-zinc-800 group-hover:text-blue-500 transition-colors">Change Password</h3>
              <p className="text-zinc-500 mt-1">Update your password to keep your account secure.</p>
            </div>
          </Link>

          <Link href="/account/api-keys" className="clay-card rounded-[2rem] p-8 flex items-center gap-6 hover:border-purple-300 transition-colors group cursor-pointer block text-left w-full h-full">
            <div className="w-16 h-16 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform shrink-0">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path></svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-zinc-800 group-hover:text-purple-600 transition-colors">AI API Keys</h3>
              <p className="text-zinc-500 mt-1">Configure your personal Groq API Key</p>
            </div>
          </Link>
          
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
