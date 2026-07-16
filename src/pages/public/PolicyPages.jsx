import { motion } from 'framer-motion';

/** Reusable policy page wrapper */
const PolicyPage = ({ title, children }) => (
  <div className="container-custom section-padding">
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="max-w-3xl mx-auto">
        <div className="section-title"><h2>{title}</h2></div>
        <div className="bg-white rounded-2xl shadow-soft p-8 md:p-12 text-text-light text-sm leading-relaxed space-y-5">
          {children}
        </div>
      </div>
    </motion.div>
  </div>
);

export const PrivacyPolicyPage = () => (
  <PolicyPage title="Privacy Policy">
    <p><strong className="text-text">Effective Date:</strong> July 2026</p>
    <p>AniLiving ("we", "our", "us") respects your privacy and is committed to protecting the personal information you share with us. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website aniliving.com.</p>
    <h3 className="text-text font-bold text-lg mt-6">Information We Collect</h3>
    <ul className="list-disc pl-5 space-y-1"><li>Personal identification: Name, email, phone number, shipping address</li><li>Payment information: Processed securely through Razorpay (we do not store card details)</li><li>Usage data: Browser type, IP address, pages visited, time spent</li><li>Order information: Products purchased, order history, reviews</li></ul>
    <h3 className="text-text font-bold text-lg mt-6">How We Use Your Information</h3>
    <ul className="list-disc pl-5 space-y-1"><li>To process and deliver your orders</li><li>To send order confirmations and updates</li><li>To improve our website and services</li><li>To respond to your inquiries</li><li>To send promotional emails (with your consent)</li></ul>
    <h3 className="text-text font-bold text-lg mt-6">Data Security</h3>
    <p>We implement industry-standard security measures to protect your data. All payment transactions are processed securely through Razorpay's PCI-DSS compliant gateway.</p>
    <h3 className="text-text font-bold text-lg mt-6">Contact Us</h3>
    <p>For privacy-related queries, contact us at <strong className="text-primary">support@aniliving.com</strong></p>
  </PolicyPage>
);

export const RefundPolicyPage = () => (
  <PolicyPage title="Refund Policy">
    <p>At AniLiving, we want you to be completely satisfied with your purchase. If you're not happy, we're here to help.</p>
    <h3 className="text-text font-bold text-lg mt-6">Eligibility for Refund</h3>
    <ul className="list-disc pl-5 space-y-1"><li>Request must be made within 7 days of delivery</li><li>Product must be unused and in original packaging</li><li>Products damaged during transit are eligible for immediate replacement or refund</li><li>Perishable items (food, treats) are non-refundable unless defective</li></ul>
    <h3 className="text-text font-bold text-lg mt-6">Refund Process</h3>
    <ul className="list-disc pl-5 space-y-1"><li>Contact us at support@aniliving.com with your order number</li><li>We will review your request within 24-48 hours</li><li>Approved refunds are processed within 5-7 business days</li><li>Refunds are credited to the original payment method</li></ul>
    <h3 className="text-text font-bold text-lg mt-6">Non-Refundable Items</h3>
    <p>Gift cards, customized products, and items on final sale are not eligible for refunds.</p>
  </PolicyPage>
);

export const ShippingPolicyPage = () => (
  <PolicyPage title="Shipping Policy">
    <p>AniLiving is committed to delivering your orders quickly and safely across India.</p>
    <h3 className="text-text font-bold text-lg mt-6">Shipping Charges</h3>
    <ul className="list-disc pl-5 space-y-1"><li><strong className="text-text">Prepaid Orders:</strong> Free shipping on all prepaid orders</li><li><strong className="text-text">COD Orders:</strong> A shipping fee may apply based on location</li></ul>
    <h3 className="text-text font-bold text-lg mt-6">Delivery Timeline</h3>
    <ul className="list-disc pl-5 space-y-1"><li>Order processing: 1-2 business days</li><li>Delivery: 3-7 business days (metro cities: 3-4 days, other areas: 5-7 days)</li></ul>
    <h3 className="text-text font-bold text-lg mt-6">Order Tracking</h3>
    <p>You will receive a tracking number via email once your order is shipped. You can track your order on our website.</p>
  </PolicyPage>
);

export const CancellationPolicyPage = () => (
  <PolicyPage title="Cancellation Policy">
    <p>We understand plans can change. Here's our cancellation policy:</p>
    <h3 className="text-text font-bold text-lg mt-6">Before Shipping</h3>
    <p>Orders can be cancelled anytime before they are shipped. Full refund will be processed.</p>
    <h3 className="text-text font-bold text-lg mt-6">After Shipping</h3>
    <p>Once an order is shipped, it cannot be cancelled. You may return the product after delivery under our Return Policy.</p>
    <h3 className="text-text font-bold text-lg mt-6">How to Cancel</h3>
    <p>Log into your account, go to My Orders, and click "Cancel Order". Alternatively, email us at support@aniliving.com.</p>
  </PolicyPage>
);

export const TermsPage = () => (
  <PolicyPage title="Terms & Conditions">
    <p>By using the AniLiving website (aniliving.com), you agree to the following terms and conditions.</p>
    <h3 className="text-text font-bold text-lg mt-6">Use of Website</h3>
    <p>You agree to use this website for lawful purposes only. You must be at least 18 years of age or have parental consent to make purchases.</p>
    <h3 className="text-text font-bold text-lg mt-6">Product Information</h3>
    <p>We strive to provide accurate product descriptions and images. However, slight variations may occur. Product availability is subject to change.</p>
    <h3 className="text-text font-bold text-lg mt-6">Pricing</h3>
    <p>All prices are in Indian Rupees (INR) and include applicable taxes unless stated otherwise. We reserve the right to change prices without prior notice.</p>
    <h3 className="text-text font-bold text-lg mt-6">Intellectual Property</h3>
    <p>All content on this website, including logos, images, and text, is the property of AniLiving and is protected by copyright laws.</p>
    <h3 className="text-text font-bold text-lg mt-6">Limitation of Liability</h3>
    <p>AniLiving shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or services.</p>
  </PolicyPage>
);

export const DisclaimerPage = () => (
  <PolicyPage title="Disclaimer">
    <p>The information provided on aniliving.com is for general informational purposes only. While we strive to keep the information up to date and accurate, we make no representations or warranties of any kind about the completeness, accuracy, or suitability of the information, products, or services.</p>
    <p>Product images are for illustration purposes and may slightly differ from the actual product. We recommend reading product descriptions carefully before making a purchase.</p>
    <p>AniLiving is not responsible for any adverse reactions or health issues arising from the use of products purchased from our store. Always consult with a veterinarian before introducing new products to your pet.</p>
  </PolicyPage>
);
