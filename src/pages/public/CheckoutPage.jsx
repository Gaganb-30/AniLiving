import { motion } from 'framer-motion';
const CheckoutPage = () => (
  <div className="container-custom section-padding">
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="text-2xl font-bold text-text mb-8">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-soft p-6">
            <h2 className="font-bold text-text text-lg mb-4">Shipping Address</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['Full Name', 'Phone Number', 'Address Line 1', 'Address Line 2', 'City', 'State', 'Pincode'].map((f) => (
                <div key={f} className={f.includes('Address') ? 'md:col-span-2' : ''}>
                  <label className="text-sm font-medium text-text-light mb-1 block">{f}</label>
                  <input className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:border-primary focus:outline-none transition-colors" placeholder={f} />
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-soft p-6">
            <h2 className="font-bold text-text text-lg mb-4">Payment Method</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-4 border border-border rounded-xl cursor-pointer hover:border-primary transition-colors">
                <input type="radio" name="payment" defaultChecked className="accent-primary" /><span className="font-medium text-sm">Pay Online (Razorpay)</span>
                <span className="text-xs text-text-muted ml-auto">UPI, Cards, Wallets, NetBanking</span>
              </label>
              <label className="flex items-center gap-3 p-4 border border-border rounded-xl cursor-pointer hover:border-primary transition-colors">
                <input type="radio" name="payment" className="accent-primary" /><span className="font-medium text-sm">Cash on Delivery</span>
              </label>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-soft p-6 h-fit sticky top-24">
          <h3 className="font-bold text-text text-lg mb-5">Order Summary</h3>
          <div className="space-y-3 text-sm border-b border-border-light pb-4 mb-4">
            <div className="flex justify-between text-text-light"><span>Subtotal</span><span className="text-text font-medium">₹798</span></div>
            <div className="flex justify-between text-text-light"><span>Shipping</span><span className="text-success font-medium">Free</span></div>
            <div className="flex justify-between text-text-light"><span>Tax</span><span className="text-text font-medium">₹143.64</span></div>
          </div>
          <div className="flex justify-between font-bold text-text text-lg mb-6"><span>Total</span><span>₹941.64</span></div>
          <button className="btn-primary w-full py-3.5 text-base">Place Order</button>
        </div>
      </div>
    </motion.div>
  </div>
);
export default CheckoutPage;
