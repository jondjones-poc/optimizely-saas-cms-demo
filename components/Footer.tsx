'use client'

import { motion } from 'framer-motion'
import { Mail, ArrowRight } from 'lucide-react'

const Footer = () => {
  const footerLinks = {
    about: ['About', 'Concept', 'Buy', 'Sell', 'Resources', 'Contact'],
    legal: ['Legal notices', 'Confidentiality', 'Credits']
  }

  return (
    <footer className="bg-phamily-darkGray text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Newsletter Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h3 className="text-2xl font-bold mb-4">Stay up to date</h3>
          <p className="text-white/80 mb-8">
            Every month, our best advice and the dates of upcoming events.
          </p>
          <div className="max-w-md mx-auto flex gap-4">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-4 py-3 rounded-full border border-white/20 bg-white/10 text-white placeholder-white/60 focus:outline-none focus:border-phamily-lightBlue transition-colors duration-300"
            />
            <button className="bg-phamily-blue text-white px-6 py-3 rounded-full font-semibold hover:bg-phamily-lightBlue transition-colors duration-300">
              Subscribe
            </button>
          </div>
        </motion.div>

        {/* Project CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h3 className="text-2xl font-bold mb-4">And your project?</h3>
          <p className="text-white/80 mb-6">
            We are available to take stock of your wishes & ambitions.
          </p>
          <button className="inline-flex items-center gap-2 bg-phamily-orange text-white px-6 py-3 rounded-full font-semibold hover:bg-orange-600 transition-colors duration-300">
            Exchange with an advisor
            <ArrowRight size={20} />
          </button>
        </motion.div>

        {/* Footer Links */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <h4 className="text-lg font-semibold mb-4">About</h4>
            <ul className="space-y-2">
              {footerLinks.about.map((link, index) => (
                <li key={index}>
                  <a
                    href="#"
                    className="text-white/80 hover:text-white transition-colors duration-300"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link, index) => (
                <li key={index}>
                  <a
                    href="#"
                    className="text-white/80 hover:text-white transition-colors duration-300"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl font-bold text-white">SaaSCMS</h1>
          </div>
          <div className="text-white/60 text-sm">
            © 2025 SaaSCMS, all rights reserved.
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
