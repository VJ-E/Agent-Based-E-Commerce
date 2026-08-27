'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function ChangePasswordPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData(e.target);
    const currentPassword = formData.get('currentPassword');
    const newPassword = formData.get('newPassword');
    const confirmPassword = formData.get('confirmPassword');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setSuccess('Password updated successfully!');
        e.target.reset();
      } else {
        setError(data.error || 'Failed to update password');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-12 px-6 flex flex-col items-center max-w-[1920px] mx-auto bg-transparent pb-24">
      <div className="w-full max-w-xl">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/account" className="text-zinc-400 hover:text-zinc-800 transition-colors bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-sm hover:shadow-md border border-zinc-100">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          </Link>
          <h1 className="text-4xl font-black text-zinc-800 font-[family-name:var(--font-body)] tracking-tight">Change Password</h1>
        </div>

        <div className="clay-card rounded-[2rem] p-8 sm:p-12">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-sm font-bold text-center">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-600 rounded-2xl text-sm font-bold text-center">
              {success}
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-zinc-700 mb-2 font-[family-name:var(--font-body)]">Current Password</label>
              <input 
                type="password" 
                name="currentPassword"
                required 
                className="clay-input w-full px-4 py-3 text-zinc-800 font-medium" 
                placeholder="Enter current password"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-zinc-700 mb-2 font-[family-name:var(--font-body)]">New Password</label>
              <input 
                type="password" 
                name="newPassword"
                required 
                className="clay-input w-full px-4 py-3 text-zinc-800 font-medium" 
                placeholder="At least 6 characters"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-zinc-700 mb-2 font-[family-name:var(--font-body)]">Confirm New Password</label>
              <input 
                type="password" 
                name="confirmPassword"
                required 
                className="clay-input w-full px-4 py-3 text-zinc-800 font-medium" 
                placeholder="Repeat new password"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 mt-4 rounded-2xl bg-zinc-900 text-white font-black text-lg shadow-[0_10px_20px_rgba(0,0,0,0.1)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70 flex justify-center items-center"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
