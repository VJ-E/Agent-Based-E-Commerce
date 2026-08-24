'use client';

import { useState, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function WriteReview({ params }) {
  const { id: orderId } = use(params);
  const searchParams = useSearchParams();
  const productId = searchParams.get('product');
  
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, productId, rating, comment })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.error || 'Failed to submit review');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen pt-28 px-6 flex flex-col items-center max-w-[1920px] mx-auto bg-transparent text-center">
         <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white text-3xl mb-6">✓</div>
         <h1 className="text-3xl font-black text-zinc-800 font-[family-name:var(--font-body)] mb-4">Review Submitted!</h1>
         <p className="text-zinc-500 mb-8 max-w-md">Thank you for sharing your experience. Your review helps other shoppers make informed decisions.</p>
         <Link href="/account" className="clay-btn bg-green-500 text-white px-8 py-3 rounded-full font-bold">Back to Account</Link>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] pt-12 px-6 flex flex-col items-center max-w-2xl mx-auto bg-transparent">
      <h1 className="text-3xl font-black text-zinc-800 font-[family-name:var(--font-body)] tracking-tight mb-8 w-full text-left">Write a Review</h1>
      
      <div className="w-full clay-card rounded-[2rem] p-8 md:p-10">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-sm font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-zinc-700 mb-4 pl-2">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all ${
                    rating >= star 
                      ? 'bg-yellow-400 text-white shadow-[0_4px_10px_rgba(250,204,21,0.4)] scale-110' 
                      : 'bg-zinc-100 text-zinc-300 hover:bg-zinc-200'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-zinc-700 mb-2 pl-2">Your Review</label>
            <textarea 
              required
              rows={5}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="clay-input w-full px-5 py-4 bg-white/50 resize-none" 
              placeholder="What did you like or dislike about this product?"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-4 py-4 rounded-full bg-green-500 text-white font-black text-lg shadow-[0_10px_20px_rgba(34,197,94,0.3),inset_2px_2px_4px_rgba(255,255,255,0.4),inset_-2px_-2px_4px_rgba(0,0,0,0.2)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70 flex justify-center items-center h-14"
          >
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  );
}
