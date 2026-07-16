import { motion } from 'framer-motion';
import { HiOutlineHeart, HiOutlineShoppingBag, HiOutlineStar, HiOutlineTruck, HiOutlineShieldCheck } from 'react-icons/hi';

const ProductDetailPage = () => (
  <div className="container-custom section-padding">
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      {/* Product Images */}
      <div>
        <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
          <div className="h-[400px] bg-accent-light flex items-center justify-center text-[120px]">🦮</div>
        </div>
        <div className="flex gap-3 mt-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-20 h-20 bg-white rounded-xl shadow-soft flex items-center justify-center text-3xl cursor-pointer hover:ring-2 ring-primary transition-all">🦮</div>
          ))}
        </div>
      </div>

      {/* Product Info */}
      <div>
        <nav className="text-sm text-text-muted mb-4">Home / Leashes / Premium Nylon Dog Leash</nav>
        <h1 className="text-2xl md:text-3xl font-bold text-text mb-2">Premium Nylon Dog Leash</h1>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex text-primary">{'★★★★★'}</div>
          <span className="text-sm text-text-muted">(128 reviews)</span>
          <span className="text-sm text-success font-medium">In Stock</span>
        </div>
        <div className="flex items-baseline gap-3 mb-6">
          <span className="text-3xl font-extrabold text-text">₹399</span>
          <span className="text-lg text-text-muted line-through">₹599</span>
          <span className="text-sm font-semibold text-success bg-success/10 px-2 py-0.5 rounded-full">33% off</span>
        </div>
        <p className="text-text-light leading-relaxed mb-6">Strong, comfortable and stylish nylon leash designed for everyday walks. Features a padded handle for maximum grip and a durable metal clasp.</p>

        {/* Attributes */}
        <div className="space-y-4 mb-6">
          <div><span className="text-sm font-semibold text-text">Color:</span>
            <div className="flex gap-2 mt-2">
              {['bg-black', 'bg-red-500', 'bg-blue-500'].map((c) => (
                <button key={c} className={`w-8 h-8 rounded-full ${c} border-2 border-transparent hover:border-primary transition-colors`} />
              ))}
            </div>
          </div>
          <div><span className="text-sm font-semibold text-text">Size:</span>
            <div className="flex gap-2 mt-2">
              {['Small', 'Medium', 'Large'].map((s) => (
                <button key={s} className="px-4 py-2 border border-border rounded-lg text-sm hover:border-primary hover:text-primary transition-colors">{s}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mb-8">
          <button className="btn-primary flex-1 py-3.5 text-base"><HiOutlineShoppingBag className="w-5 h-5" /> Add to Cart</button>
          <button className="btn-secondary py-3.5 px-5"><HiOutlineHeart className="w-5 h-5" /></button>
        </div>

        {/* Trust badges */}
        <div className="border-t border-border-light pt-6 space-y-3">
          {[
            { icon: HiOutlineTruck, text: 'Free delivery on prepaid orders' },
            { icon: HiOutlineShieldCheck, text: '7-day easy returns' },
            { icon: HiOutlineStar, text: 'Premium quality guarantee' },
          ].map((b, i) => (
            <div key={i} className="flex items-center gap-3 text-sm text-text-light">
              <b.icon className="w-5 h-5 text-primary shrink-0" />{b.text}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  </div>
);

export default ProductDetailPage;
