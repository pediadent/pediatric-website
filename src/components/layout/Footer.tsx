'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

const navigation = {
  main: [
    { name: 'Home', href: '/' },
    { name: 'Blog', href: '/oral-health-tips/' },
    { name: 'Latest News', href: '/news/' },
    { name: 'Product Reviews', href: '/reviews/' },
    { name: 'Dental Salaries', href: '/salary/' },
    { name: 'About Us', href: '/about-us/' },
    { name: 'Contact Us', href: '/contact-us/' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy-policy/' },
    { name: 'Terms & Conditions', href: '/terms-and-conditions/' },
    { name: 'Editorial Policy', href: '/editorial-policy/' },
    { name: 'Our Disclaimer', href: '/our-disclaimer/' },
    { name: 'Health Write for Us', href: '/health-write-for-us/' },
  ],
}

export function Footer() {
  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-64 h-64 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="lg:col-span-1 text-center md:text-left"
          >
            <Link href="/" className="flex items-center space-x-3 mb-6 group justify-center md:justify-start">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl">🦷</span>
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 blur-lg"></div>
              </div>
              <div>
                <div className="text-xl font-black bg-gradient-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent">
                  Pediatric Dentist
                </div>
                <div className="text-sm font-bold bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent">
                  📍 Queens, NY
                </div>
              </div>
            </Link>
            <p className="text-gray-300 text-sm mb-6 leading-relaxed">
              Your trusted source for finding qualified pediatric dentists in Queens, New York.
              Expert reviews, helpful resources, and comprehensive directory. ✨
            </p>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-start space-x-2 justify-center md:justify-start">
                <span className="text-blue-400">📍</span>
                <div>
                  <p>80-12 165th St 5th Floor</p>
                  <p>Queens, New York 11432</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 mt-3 justify-center md:justify-start">
                <span className="text-purple-400">✉️</span>
                <a href="mailto:pediatricdentistinqueensny@gmail.com" className="hover:text-white transition-colors break-all">
                  pediatricdentistinqueensny@gmail.com
                </a>
              </div>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-center md:text-left"
          >
            <h3 className="text-lg font-black mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Quick Links
            </h3>
            <ul className="space-y-3 flex flex-col items-center md:items-start">
              {navigation.main.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="group flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium"
                  >
                    <span className="text-pink-400 group-hover:translate-x-1 transition-transform duration-200">→</span>
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Legal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-center md:text-left"
          >
            <h3 className="text-lg font-black mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Legal & Resources
            </h3>
            <ul className="space-y-3 flex flex-col items-center md:items-start">
              {navigation.legal.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="group flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium"
                  >
                    <span className="text-purple-400 group-hover:translate-x-1 transition-transform duration-200">→</span>
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="border-t border-white/10 pt-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
              <p className="text-gray-400 text-sm font-medium">
                © {new Date().getFullYear()} Pediatric Dentist Queens NY. All rights reserved.
              </p>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <span className="px-3 py-1 bg-white/10 rounded-full">Made with ❤️ in Queens</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-2xl px-4 py-2">
              <span className="text-yellow-400">🔒</span>
              <p className="text-gray-300 text-xs font-medium">
                Contains affiliate links - We may earn from purchases
              </p>
            </div>
          </div>
        </motion.div>

        {/* Affiliate Disclosure */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <div className="max-w-4xl mx-auto px-6 py-4 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl">
            <p className="text-xs text-gray-400 leading-relaxed">
              Pediatric Dentist in Queens NY is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for website owners to earn advertising fees by advertising and linking to amazon.com, and any other website that may be affiliated with Amazon Service LLC Associates Program. Amazon, the Amazon logo, AmazonSupply, and the AmazonSupply logo are trademarks of Amazon.com, Inc. or its affiliates.
            </p>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}