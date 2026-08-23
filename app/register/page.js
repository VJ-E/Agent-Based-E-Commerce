'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        window.location.href = '/shop';
      } else {
        setError(data.error || 'Failed to register');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-20 px-6 bg-transparent">
      <div className="w-full max-w-md clay-card rounded-[2rem] p-8 md:p-10 relative overflow-hidden">
        {/* Background Decorative Blob */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-green-400 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob"></div>
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-green-200 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob animation-delay-2000"></div>
        
        <div className="relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-zinc-800 font-[family-name:var(--font-body)] tracking-tight">Create Account</h1>
            <p className="text-zinc-500 mt-2">Join Bentely and start shopping</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-sm font-bold text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-zinc-700 mb-2 pl-2">Full Name</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="clay-input w-full px-5 py-4 bg-white/50" 
                placeholder="John Doe"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-zinc-700 mb-2 pl-2">Email Address</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="clay-input w-full px-5 py-4 bg-white/50" 
                placeholder="you@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-zinc-700 mb-2 pl-2">Password</label>
              <input 
                type="password" 
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="clay-input w-full px-5 py-4 bg-white/50" 
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-4 py-4 rounded-full bg-green-500 text-white font-black text-lg shadow-[0_10px_20px_rgba(34,197,94,0.3),inset_2px_2px_4px_rgba(255,255,255,0.4),inset_-2px_-2px_4px_rgba(0,0,0,0.2)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70 flex justify-center items-center h-14"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                'Sign Up'
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm font-medium text-zinc-500">
            Already have an account?{' '}
            <Link href="/login" className="text-green-600 font-bold hover:underline">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
