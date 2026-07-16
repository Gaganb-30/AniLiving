import { motion } from 'framer-motion';
const faqData = [
  { q: 'How do I place an order?', a: 'Browse our products, add items to your cart, proceed to checkout, fill in your shipping address, choose your payment method (Razorpay or Cash on Delivery), and place your order.' },
  { q: 'What payment methods do you accept?', a: 'We accept all major payment methods through Razorpay including UPI, Credit/Debit Cards, Net Banking, Wallets, and EMI. We also offer Cash on Delivery (COD).' },
  { q: 'What is your return policy?', a: 'We offer a 7-day easy return policy. If you are not satisfied with your purchase, you can initiate a return within 7 days of delivery.' },
  { q: 'How long does delivery take?', a: 'We typically dispatch orders within 1-2 business days. Delivery takes 3-7 business days depending on your location.' },
  { q: 'Do you offer free shipping?', a: 'Yes! We offer free shipping on all prepaid orders. For COD orders, a nominal shipping charge may apply.' },
  { q: 'How can I track my order?', a: 'You can track your order using the order number provided in your confirmation email. Visit our Track Order page and enter your order number.' },
  { q: 'Can I cancel my order?', a: 'Orders can be cancelled before they are shipped. Once shipped, you can initiate a return after delivery.' },
  { q: 'Is COD available in my area?', a: 'COD availability depends on your pincode. You can check COD availability during checkout.' },
];
const FAQPage = () => (
  <div className="container-custom section-padding">
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="section-title"><h2>Frequently Asked Questions</h2><p>Find answers to common questions about AniLiving.</p></div>
      <div className="max-w-3xl mx-auto space-y-4">
        {faqData.map((faq, i) => (
          <details key={i} className="bg-white rounded-2xl shadow-soft group">
            <summary className="p-6 cursor-pointer font-semibold text-text flex items-center justify-between hover:text-primary transition-colors">
              {faq.q}
              <span className="text-primary text-xl group-open:rotate-45 transition-transform">+</span>
            </summary>
            <div className="px-6 pb-6 text-sm text-text-light leading-relaxed">{faq.a}</div>
          </details>
        ))}
      </div>
    </motion.div>
  </div>
);
export default FAQPage;
