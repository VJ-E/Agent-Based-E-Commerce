import dbConnect from '@/lib/db/mongoose';
import Order from '@/models/Order';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function OrdersPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('bentely_auth_token')?.value;
  
  if (!token) redirect('/login');
  
  const payload = await verifyToken(token);
  if (!payload) redirect('/login');

  await dbConnect();
  
  const orders = await Order.find({ userId: payload.userId })
    .sort({ createdAt: -1 })
    .populate('items.productId')
    .lean();

  return (
    <div className="min-h-screen pt-12 px-6 flex flex-col items-center max-w-[1920px] mx-auto bg-transparent pb-24">
      <div className="w-full max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/account" className="text-zinc-400 hover:text-zinc-800 transition-colors bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-sm hover:shadow-md border border-zinc-100">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          </Link>
          <h1 className="text-4xl font-black text-zinc-800 font-[family-name:var(--font-body)] tracking-tight">Your Orders</h1>
        </div>
        
        {orders.length === 0 ? (
          <div className="clay-card rounded-[2rem] p-12 text-center">
            <h3 className="text-xl font-bold text-zinc-800 mb-2">No orders yet</h3>
            <p className="text-zinc-500 mb-6">Looks like you haven't made any purchases.</p>
            <Link href="/shop" className="clay-btn bg-green-500 text-white px-8 py-3 rounded-full font-bold shadow-md hover:scale-105 transition-all inline-block">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id.toString()} className="clay-card rounded-[2rem] p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-zinc-100 pb-4 gap-4">
                  <div>
                    <p className="text-sm text-zinc-500 font-bold uppercase tracking-wider">Order #{order._id.toString().slice(-8)}</p>
                    <p className="text-sm text-zinc-500 mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="px-4 py-1.5 rounded-full bg-green-50 text-green-700 font-bold text-xs uppercase tracking-wider border border-green-200">
                      {order.trackingStatus}
                    </div>
                    <Link href={`/account/orders/${order._id}/track`} className="text-green-600 hover:text-green-800 font-bold text-sm bg-green-50/50 px-4 py-1.5 rounded-full hover:bg-green-100 transition-colors">
                      Track Package
                    </Link>
                  </div>
                </div>

                <div className="space-y-4">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex gap-4 items-center">
                      <div className="w-16 h-16 rounded-xl bg-white border border-zinc-100 p-1 shrink-0">
                         {item.productId?.images?.[0]?.large && (
                           <img src={item.productId.images[0].large} alt={item.name} className="w-full h-full object-cover mix-blend-multiply" />
                         )}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-zinc-800 line-clamp-1">{item.name}</h4>
                        <p className="text-xs text-zinc-500 mt-1">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-zinc-800">₹{Math.round(item.priceAtPurchase * item.quantity).toLocaleString()}</p>
                        {order.trackingStatus === 'delivered' && (
                          <Link href={`/account/orders/${order._id}/review?product=${item.productId?._id}`} className="text-xs font-bold text-green-600 hover:underline mt-1 block">
                            Write Review
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-100 flex justify-between items-center">
                  <p className="font-bold text-zinc-600">Total</p>
                  <p className="text-xl font-black text-green-600">₹{Math.round(order.totalAmount).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
