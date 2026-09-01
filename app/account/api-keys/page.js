'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ApiKeysPage() {
  const [apiKey, setApiKey] = useState('');
  const [hasKey, setHasKey] = useState(false);
  const [maskedKey, setMaskedKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetch('/api/auth/api-keys')
      .then(res => res.json())
      .then(data => {
        if (data.hasKey) {
          setHasKey(true);
          setMaskedKey(data.maskedKey);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!apiKey.trim()) return;

    setSaving(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await fetch('/api/auth/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey, action: 'save' })
      });

      if (res.ok) {
        setMessage({ text: 'API Key saved successfully.', type: 'success' });
        setHasKey(true);
        setMaskedKey(apiKey.substring(0, 4) + '********' + apiKey.substring(apiKey.length - 4));
        setApiKey('');
      } else {
        const data = await res.json();
        setMessage({ text: data.error || 'Failed to save API key.', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'An unexpected error occurred.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await fetch('/api/auth/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete' })
      });

      if (res.ok) {
        setMessage({ text: 'API Key removed.', type: 'success' });
        setHasKey(false);
        setMaskedKey('');
      } else {
        setMessage({ text: 'Failed to remove API key.', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'An unexpected error occurred.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-zinc-500">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-8 pt-24 min-h-screen">
      <Link href="/account" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-800 transition-colors mb-8 font-semibold">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        Back to Dashboard
      </Link>

      <div className="clay-card p-8">
        <h1 className="text-3xl font-black text-zinc-800 mb-2">AI API Keys</h1>
        <p className="text-zinc-500 mb-8">
          The Bentely Shopping Assistant uses Groq to power its fast AI reasoning. 
          You can provide your own API key to bypass system rate limits and get faster, uninterrupted service.
        </p>

        {message.text && (
          <div className={`p-4 rounded-xl mb-6 font-semibold ${message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
            {message.text}
          </div>
        )}

        {hasKey ? (
          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-6 mb-6">
            <h3 className="font-bold text-zinc-800 mb-2">Active API Key</h3>
            <p className="text-zinc-500 font-mono tracking-wider mb-6 bg-white p-3 rounded-lg border border-zinc-100 shadow-inner">
              {maskedKey}
            </p>
            <div className="flex gap-4">
              <button 
                onClick={handleDelete}
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-colors disabled:opacity-50"
              >
                {saving ? 'Removing...' : 'Remove Key'}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-bold text-zinc-700 mb-2">Groq API Key</label>
              <input 
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="gsk_..."
                className="clay-input w-full p-4 font-mono"
                required
              />
            </div>
            <button 
              type="submit"
              disabled={saving || !apiKey.trim()}
              className="clay-btn py-4 mt-2 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save API Key'}
            </button>
          </form>
        )}
        
        <div className="mt-8 pt-6 border-t border-zinc-100 text-sm text-zinc-500">
          <p>Don't have a key? Get one for free at <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="text-green-600 font-bold hover:underline">console.groq.com</a>.</p>
        </div>
      </div>
    </div>
  );
}
