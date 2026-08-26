import connectToDatabase from '@/lib/db/mongoose';
import Product from '@/models/Product';
import Review from '@/models/Review';
import ProductCard from '@/components/ProductCard';
import AddToCartClient from '@/components/AddToCartClient';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }) {
  const { id } = await params;
  await connectToDatabase();
  const product = await Product.findById(id).catch(() => null);
  if (!product) return { title: 'Product Not Found' };
  return { title: `${product.name} | AgentShop` };
}

export default async function ProductDetails({ params }) {
  const { id } = await params;
  await connectToDatabase();
  const product = await Product.findById(id).catch(() => null);
  
  if (!product) {
    notFound();
  }

  const baseCategory = product.category ? product.category.split(' > ')[0] : '';
  const relatedProducts = await Product.find({
    category: { $regex: baseCategory ? `^${baseCategory}` : '', $options: 'i' },
    _id: { $ne: product._id }
  }).limit(4);

  const finalPrice = product.isDeal 
    ? product.price * (1 - product.discountPercentage / 100) 
    : product.price;

  const reviews = await Review.find({ productId: product._id }).populate('userId', 'name').sort({ createdAt: -1 }).lean();

  return (
    <div className="h-[calc(100vh-5rem)] overflow-y-auto custom-scrollbar pb-20 w-full max-w-[1920px] mx-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <nav className="text-sm font-bold text-zinc-400 mb-8 flex items-center space-x-2 font-[family-name:var(--font-body)]">
          <Link href="/" className="hover:text-green-600 transition-colors bg-white px-3 py-1.5 rounded-full shadow-sm border border-zinc-100">Home</Link>
          <span>/</span>
          <Link href={`/?category=${product.category}`} className="hover:text-green-600 transition-colors bg-white px-3 py-1.5 rounded-full shadow-sm border border-zinc-100">{product.category}</Link>
          <span>/</span>
          <span className="text-zinc-800 truncate max-w-xs">{product.name}</span>
        </nav>

        <div className="clay-card rounded-[3rem] p-6 md:p-12 flex flex-col lg:flex-row gap-12 mb-16 relative">
          <div className="w-full lg:w-1/2">
            <div className="aspect-square rounded-[2rem] bg-white shadow-[inset_4px_4px_8px_rgba(0,0,0,0.03),inset_-4px_-4px_8px_rgba(255,255,255,1)] overflow-hidden relative border border-zinc-100 flex items-center justify-center p-8">
               {product.isDeal && (
                <div className="absolute top-6 left-6 bg-red-50 border border-red-100 text-red-600 text-sm font-black px-4 py-1.5 rounded-full z-10 shadow-sm">
                  SALE {product.discountPercentage}%
                </div>
               )}
               <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover mix-blend-multiply relative z-10 hover:scale-105 transition-transform duration-700" />
            </div>
          </div>
          
          <div className="w-full lg:w-1/2 flex flex-col justify-center">
            <p className="text-sm font-bold tracking-widest uppercase text-green-600 mb-2 font-[family-name:var(--font-body)] truncate" title={product.category}>{product.category?.split(' > ').pop()}</p>
            <h1 className="text-3xl md:text-5xl font-black text-zinc-900 mb-4 tracking-tight leading-tight font-[family-name:var(--font-body)]">{product.name}</h1>
            
            {/* Reviews Section */}
            {product.rating > 0 && (
              <div className="flex items-center gap-2 mb-6">
                <div className="flex text-yellow-400 text-lg">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>{i < Math.round(product.rating) ? '★' : '☆'}</span>
                  ))}
                </div>
                <span className="text-zinc-500 font-bold font-[family-name:var(--font-body)]">{product.rating}</span>
                <span className="text-zinc-400 text-sm ml-2">({product.reviewCount} reviews)</span>
              </div>
            )}
            
            <div className="flex items-end space-x-4 mb-6">
              {product.isDeal ? (
                <>
                  <span className="text-4xl font-black text-zinc-900">₹{Math.round(finalPrice).toLocaleString()}</span>
                  <span className="text-xl text-zinc-400 line-through mb-1">₹{product.price.toLocaleString()}</span>
                </>
              ) : (
                <span className="text-4xl font-black text-zinc-900">₹{product.price.toLocaleString()}</span>
              )}
            </div>

            <p className="text-zinc-500 text-lg mb-8 leading-relaxed font-[family-name:var(--font-body)]">
              {product.description}
            </p>

            {product.features && product.features.length > 0 && (
              <div className="mb-8 font-[family-name:var(--font-body)]">
                <h3 className="font-bold text-zinc-800 mb-3 uppercase tracking-widest text-sm">Key Features</h3>
                <ul className="list-disc pl-5 text-zinc-600 space-y-2">
                  {product.features.slice(0, 5).map((feature, idx) => (
                    <li key={idx}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 mb-8 border-y border-zinc-200/50 py-6">
              <div className="flex-1">
                <p className="text-sm text-zinc-400 mb-1 font-bold uppercase tracking-widest">Availability</p>
                <p className="font-black text-zinc-800 text-lg">{product.stockCount > 0 ? `${product.stockCount} in stock` : 'Out of stock'}</p>
              </div>
              <div className="flex-1">
                <p className="text-sm text-zinc-400 mb-1 font-bold uppercase tracking-widest">Brand</p>
                <p className="font-black text-zinc-800 text-lg">{product.brandName || product.metadata?.brand || 'Amazon'}</p>
              </div>
            </div>

            <AddToCartClient product={JSON.parse(JSON.stringify(product))} finalPrice={finalPrice} />
          </div>
        </div>

        {/* Written Reviews Section */}
        <div className="mb-16">
           <h2 className="text-2xl font-black text-zinc-800 mb-6 font-[family-name:var(--font-body)]">Customer Reviews</h2>
           {reviews.length === 0 ? (
             <div className="clay-card rounded-2xl p-8 text-center bg-white/50">
               <p className="text-zinc-500">No written reviews yet. Be the first to review after purchasing!</p>
             </div>
           ) : (
             <div className="space-y-4">
               {reviews.map(review => (
                 <div key={review._id.toString()} className="clay-card rounded-2xl p-6">
                   <div className="flex items-center justify-between mb-4">
                     <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-black">
                         {review.userId?.name?.charAt(0) || 'A'}
                       </div>
                       <div>
                         <p className="font-bold text-zinc-800">{review.userId?.name || 'Anonymous'}</p>
                         <p className="text-xs text-zinc-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                       </div>
                     </div>
                     <div className="flex text-yellow-400 text-lg">
                       {[...Array(5)].map((_, i) => (
                         <span key={i}>{i < review.rating ? '★' : '☆'}</span>
                       ))}
                     </div>
                   </div>
                   <p className="text-zinc-700 text-sm leading-relaxed">{review.comment}</p>
                 </div>
               ))}
             </div>
           )}
        </div>

        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-black text-zinc-800 mb-6 font-[family-name:var(--font-body)]">You might also like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map(p => (
                <ProductCard key={p._id} product={JSON.parse(JSON.stringify(p))} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
