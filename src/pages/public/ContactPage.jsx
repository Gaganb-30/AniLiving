import { motion } from 'framer-motion';
import { HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker } from 'react-icons/hi';
const ContactPage = () => (
  <div className="container-custom section-padding">
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="section-title"><h2>Contact Us</h2><p>We'd love to hear from you. Get in touch!</p></div>
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-soft p-8 space-y-6">
          <h3 className="font-bold text-text text-lg">Send Us a Message</h3>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <input placeholder="Your Name" className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:border-primary focus:outline-none" />
            <input placeholder="Email Address" type="email" className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:border-primary focus:outline-none" />
            <input placeholder="Phone Number" className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:border-primary focus:outline-none" />
            <textarea placeholder="Your Message" rows="4" className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:border-primary focus:outline-none resize-none" />
            <button type="submit" className="btn-primary w-full py-3">Send Message</button>
          </form>
        </div>
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-soft p-8">
            <h3 className="font-bold text-text text-lg mb-5">Get in Touch</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3"><HiOutlineMail className="w-5 h-5 text-primary mt-0.5 shrink-0" /><div><p className="font-medium text-text text-sm">Email</p><p className="text-sm text-text-muted">support@aniliving.com</p></div></div>
              <div className="flex items-start gap-3"><HiOutlinePhone className="w-5 h-5 text-primary mt-0.5 shrink-0" /><div><p className="font-medium text-text text-sm">Phone</p><p className="text-sm text-text-muted">+91 XXXXXXXXXX</p></div></div>
              <div className="flex items-start gap-3"><HiOutlineLocationMarker className="w-5 h-5 text-primary mt-0.5 shrink-0" /><div><p className="font-medium text-text text-sm">Address</p><p className="text-sm text-text-muted">India</p></div></div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-soft p-8">
            <h3 className="font-bold text-text text-lg mb-3">Business Hours</h3>
            <p className="text-sm text-text-light">Monday - Saturday: 9:00 AM - 7:00 PM IST</p>
            <p className="text-sm text-text-light">Sunday: Closed</p>
          </div>
        </div>
      </div>
    </motion.div>
  </div>
);
export default ContactPage;
