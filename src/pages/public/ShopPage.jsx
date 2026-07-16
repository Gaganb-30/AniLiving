import { motion } from 'framer-motion';

const ShopPage = () => {
  return (
    <div className="container-custom section-padding">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="section-title text-left">
          <h2>All Products</h2>
          <p className="mx-0">Browse our complete collection of premium pet supplies.</p>
        </div>
        <div className="flex gap-8">
          {/* Filters sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="bg-white rounded-2xl shadow-soft p-6 sticky top-24 space-y-6">
              <div>
                <h3 className="font-semibold text-text mb-3">Categories</h3>
                <div className="space-y-2 text-sm text-text-light">
                  {['All Products', 'Leashes', 'Bowls', 'Collars', 'Toys', 'Beds'].map((c) => (
                    <label key={c} className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">
                      <input type="checkbox" className="accent-primary" />
                      {c}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-text mb-3">Price Range</h3>
                <div className="flex gap-2">
                  <input type="number" placeholder="Min" className="w-full px-3 py-2 border border-border rounded-lg text-sm" />
                  <input type="number" placeholder="Max" className="w-full px-3 py-2 border border-border rounded-lg text-sm" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-text mb-3">Rating</h3>
                <div className="space-y-2 text-sm text-text-light">
                  {[4, 3, 2, 1].map((r) => (
                    <label key={r} className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">
                      <input type="checkbox" className="accent-primary" />
                      <span className="text-primary">{'★'.repeat(r)}{'☆'.repeat(5 - r)}</span> & up
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Product grid placeholder */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-text-muted">Showing 0 products</p>
              <select className="px-4 py-2 border border-border rounded-lg text-sm bg-white">
                <option>Sort by: Newest</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Rating</option>
                <option>Popular</option>
              </select>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-soft overflow-hidden animate-pulse">
                  <div className="h-44 bg-accent-light" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-accent rounded w-3/4" />
                    <div className="h-3 bg-accent rounded w-1/2" />
                    <div className="h-5 bg-accent rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-center text-text-muted mt-10 text-sm">Products will load from the API once connected to the backend.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ShopPage;
