import { motion } from 'framer-motion';
import Seo, { faqSchema, breadcrumbSchema } from '../../components/seo/Seo';
const faqData = [
  { q: 'How do I place an order?', a: 'Browse our products, add items to your cart, proceed to checkout, fill in your shipping address, complete your payment via Razorpay, and place your order.' },
  { q: 'What payment methods do you accept?', a: 'We accept all major payment methods online through Razorpay including UPI, Credit/Debit Cards, Net Banking, Wallets, and EMI.' },
  { q: 'What is your exchange and replacement policy?', a: 'While we do not offer refunds or returns for change of mind, eligible products can be exchanged or replaced within 7 days of delivery if they are damaged in transit, defective, or incorrect.' },
  { q: 'How long does delivery take?', a: 'We typically dispatch orders within 1-2 business days. Delivery takes 3-7 business days depending on your location.' },
  { q: 'Do you offer free shipping?', a: 'Yes! We offer free shipping on all orders.' },
  { q: 'How can I track my order?', a: 'You can track your order using the order number provided in your confirmation email. Visit our Track Order page and enter your order number.' },
  { q: 'Can I cancel my order?', a: 'Orders can be cancelled before they are shipped. Once shipped, eligible products can be exchanged or replaced after delivery under our Exchange & Replacement Policy.' },
  // { q: 'Is COD available in my area?', a: 'Cash on Delivery is currently unavailable. We accept all major online payment options securely via Razorpay.' },
];
const FAQPage = () => (
  <div className="container-custom section-padding">
    {/* FAQPage structured data makes these questions eligible for rich results */}
    <Seo
      title="Frequently Asked Questions"
      description="Answers to common questions about ordering, payment, delivery, exchanges and replacements at AniLiving."
      canonical="/faq"
      jsonLd={[
        faqSchema(faqData.map((f) => ({ question: f.q, answer: f.a }))),
        breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'FAQ', path: '/faq' }]),
      ]}
    />
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
