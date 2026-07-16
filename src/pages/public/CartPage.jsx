import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiOutlineTrash, HiOutlinePlus, HiOutlineMinus, HiOutlineArrowRight, HiOutlineHeart } from 'react-icons/hi';

const CartPage = () => (
  <div className="container-custom section-padding">
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="text-2xl font-bold text-text mb-8">Shopping Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {/* Sample cart item */}
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-2xl shadow-soft p-5 flex gap-5">
              <div className="w-24 h-24 bg-accent-light rounded-xl flex items-center justify-center text-4xl shrink-0">🦮</div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-text truncate">Premium Nylon Dog Leash</h3>
                <p className="text-sm text-text-muted mt-0.5">Color: Black | Size: Medium</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="font-bold text-text">₹399</span>
                  <span className="text-sm text-text-muted line-through">₹599</span>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-border rounded-lg overflow-hidden">
                    <button className="p-2 hover:bg-accent-light transition-colors"><HiOutlineMinus className="w-4 h-4" /></button>
                    <span className="px-4 text-sm font-semibold">1</span>
                    <button className="p-2 hover:bg-accent-light transition-colors"><HiOutlinePlus className="w-4 h-4" /></button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-text-muted hover:text-primary transition-colors"><HiOutlineHeart className="w-5 h-5" /></button>
                    <button className="p-2 text-text-muted hover:text-error transition-colors"><HiOutlineTrash className="w-5 h-5" /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <p className="text-center text-sm text-text-muted mt-6">Cart items will load dynamically from the API.</p>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-2xl shadow-soft p-6 h-fit sticky top-24">
          <h3 className="font-bold text-text text-lg mb-5">Order Summary</h3>
          <div className="space-y-3 text-sm mb-5">
            <div className="flex justify-between text-text-light"><span>Subtotal (2 items)</span><span className="text-text font-medium">₹798</span></div>
            <div className="flex justify-between text-text-light"><span>Shipping</span><span className="text-success font-medium">Free</span></div>
            <div className="flex justify-between text-text-light"><span>Tax (GST 18%)</span><span className="text-text font-medium">₹143.64</span></div>
          </div>
          <div className="border-t border-border-light pt-4 mb-5">
            <div className="flex justify-between font-bold text-text text-lg"><span>Total</span><span>₹941.64</span></div>
          </div>
          <div className="flex gap-2 mb-5">
            <input type="text" placeholder="Coupon code" className="flex-1 px-4 py-2.5 border border-border rounded-lg text-sm" />
            <button className="px-4 py-2.5 bg-secondary text-white rounded-lg text-sm font-semibold hover:bg-secondary-dark transition-colors">Apply</button>
          </div>
          <Link to="/checkout" className="btn-primary w-full py-3.5 text-base">Proceed to Checkout <HiOutlineArrowRight className="w-5 h-5" /></Link>
        </div>
      </div>
    </motion.div>
  </div>
);

export default CartPage;
