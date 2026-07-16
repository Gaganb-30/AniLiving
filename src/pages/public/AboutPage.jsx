import { motion } from 'framer-motion';
const AboutPage = () => (
  <div className="container-custom section-padding">
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="max-w-3xl mx-auto">
        <div className="section-title"><h2>About AniLiving</h2></div>
        <div className="bg-white rounded-2xl shadow-soft p-8 md:p-12 prose prose-lg max-w-none text-text-light leading-relaxed">
          <div className="text-center mb-8"><span className="text-6xl">🐾</span></div>
          <p className="text-lg"><strong className="text-text">AniLiving</strong> was born from a simple belief: every pet deserves the best. We are a premium pet supplies brand dedicated to providing high-quality, thoughtfully curated products for your beloved companions.</p>
          <h3 className="text-text font-bold text-xl mt-8 mb-4">Our Mission</h3>
          <p>To make premium pet care accessible to every pet parent in India. We carefully select each product in our catalog, ensuring it meets our high standards for quality, safety, and comfort.</p>
          <h3 className="text-text font-bold text-xl mt-8 mb-4">Why Choose Us?</h3>
          <ul className="space-y-2">
            <li><strong className="text-text">Premium Quality:</strong> Every product is quality-checked before listing.</li>
            <li><strong className="text-text">Wide Selection:</strong> From food to accessories, we cover all your pet's needs.</li>
            <li><strong className="text-text">Fast Delivery:</strong> Quick dispatch and doorstep delivery across India.</li>
            <li><strong className="text-text">Customer First:</strong> Easy returns, responsive support, and hassle-free shopping.</li>
          </ul>
          <h3 className="text-text font-bold text-xl mt-8 mb-4">Our Promise</h3>
          <p>We're committed to growing with the pet parent community. Whether you have a dog, cat, bird, fish, or any other companion, AniLiving is your trusted partner in providing the care they deserve.</p>
          <p className="mt-6 text-primary font-semibold text-center text-lg">Everything Your Pet Deserves. 🐾</p>
        </div>
      </div>
    </motion.div>
  </div>
);
export default AboutPage;
