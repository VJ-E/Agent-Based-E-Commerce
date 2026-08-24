import dbConnect from '@/lib/db/mongoose';
import Order from '@/models/Order';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function TrackOrder({ params }) {
  const { id } = await params;
  
  const cookieStore = await cookies();
  const token = cookieStore.get('bentely_auth_token')?.value;
  if (!token) redirect('/login');
  
  const payload = await verifyToken(token);
  if (!payload) redirect('/login');

  await dbConnect();
  
  const order = await Order.findOne({ _id: id, userId: payload.userId }).lean();
  if (!order) redirect('/account');

  // Hardcode statuses for UI
  const steps = [
    { id: 'processing', label: 'Order Placed', desc: 'We have received your order' },
    { id: 'shipped', label: 'Shipped', desc: 'Your order is on the way' },
    { id: 'out_for_delivery', label: 'Out for Delivery', desc: 'Arriving today' },
    { id: 'delivered', label: 'Delivered', desc: 'Package has been delivered' },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === order.trackingStatus);
  const activeStep = currentStepIndex >= 0 ? currentStepIndex : 0;

  return (
    <div className="min-h-[80vh] pt-12 px-6 flex flex-col items-center max-w-4xl mx-auto bg-transparent">
      <div className="w-full mb-8 flex justify-between items-center">
        <div>
           <h1 className="text-3xl font-black text-zinc-800 font-[family-name:var(--font-body)] tracking-tight">Track Package</h1>
           <p className="text-zinc-500 mt-1">Order #{order._id.toString().slice(-8)}</p>
        </div>
        <Link href="/account" className="text-green-600 font-bold hover:bg-green-50 px-4 py-2 rounded-full transition-colors">
           Back to Account
        </Link>
      </div>
      
      <div className="w-full clay-card rounded-[2rem] p-8 md:p-12">
         
         <div className="relative pt-10 pb-16">
            {/* Connecting Line */}
            <div className="absolute top-14 left-[10%] right-[10%] h-1.5 bg-zinc-100 rounded-full">
              <div 
                className="absolute top-0 left-0 h-full bg-green-500 rounded-full transition-all duration-1000 ease-in-out"
                style={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }}
              ></div>
            </div>

            <div className="relative flex justify-between z-10">
              {steps.map((step, idx) => {
                const isCompleted = idx <= activeStep;
                const isActive = idx === activeStep;
                
                return (
                  <div key={step.id} className="flex flex-col items-center w-1/4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-md transition-all duration-500 ${
                      isCompleted 
                        ? 'bg-green-500 text-white shadow-green-500/40 ring-4 ring-green-100' 
                        : 'bg-white text-zinc-400 border-2 border-zinc-200'
                    } ${isActive ? 'scale-125' : ''}`}>
                      {isCompleted ? '✓' : idx + 1}
                    </div>
                    <div className="mt-4 text-center">
                      <p className={`text-sm font-bold ${isCompleted ? 'text-zinc-800' : 'text-zinc-400'}`}>{step.label}</p>
                      <p className="text-[11px] text-zinc-500 mt-1 hidden md:block">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
         </div>

         <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-6 mt-8">
            <h3 className="font-bold text-zinc-800 mb-4 text-lg">Delivery Information</h3>
            <div className="grid md:grid-cols-2 gap-6">
               <div>
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-1">Carrier</p>
                  <p className="text-zinc-800 font-medium">Bentely Express Logistics</p>
               </div>
               <div>
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-1">Tracking Number</p>
                  <p className="text-zinc-800 font-medium font-mono">BEX-{order._id.toString().substring(0,10).toUpperCase()}</p>
               </div>
               <div>
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-1">Estimated Delivery</p>
                  <p className="text-green-600 font-bold">
                    {order.trackingStatus === 'delivered' ? 'Delivered' : 'Today by 8:00 PM'}
                  </p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
