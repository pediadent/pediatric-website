'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Pediatric Dentist List', href: '/' },
  { name: 'Blog', href: '/oral-health-tips/' },
  { name: 'Latest News', href: '/news/' },
  { name: 'Product Reviews', href: '/reviews/' },
  { name: 'Dental Salaries', href: '/salary/' },
  { name: 'About', href: '/about-us/' },
  { name: 'Contact', href: '/contact-us/', submenu: [
    { name: 'Write for Us', href: '/health-write-for-us/' },
    { name: 'Editorial Policy', href: '/editorial-policy/' },
    { name: 'Privacy Policy', href: '/privacy-policy/' },
    { name: 'Disclaimer', href: '/our-disclaimer/' },
    { name: 'Terms', href: '/terms-and-conditions/' },
  ]},
]

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  return (
    <nav className="bg-white/95 backdrop-blur-xl shadow-elegant border-b border-neutral-200/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-glow transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <span className="text-3xl">🦷</span>
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 blur-md"></div>
              </div>
              <div className="hidden sm:block">
                <span className="text-2xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Pediatric Dentist
                </span>
                <div className="text-sm font-bold bg-gradient-to-r from-pink-600 to-orange-500 bg-clip-text text-transparent flex items-center">
                  📍 Queens, NY
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navigation.map((item, index) => {
              const isActive = pathname === item.href
              const hasSubmenu = item.submenu && item.submenu.length > 0

              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative group"
                >
                  <Link
                    href={item.href}
                    className={cn(
                      'relative px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-200 inline-block whitespace-nowrap',
                      isActive
                        ? 'bg-gradient-to-r from-blue-100 to-purple-100 text-purple-700 shadow-md'
                        : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-purple-600'
                    )}
                  >
                    {item.name}
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl -z-10"
                        initial={false}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </Link>

                  {/* Dropdown Menu */}
                  {hasSubmenu && (
                    <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="py-2">
                        {item.submenu.map((subItem) => (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-purple-600 transition-colors"
                          >
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>

          {/* Mobile menu button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-3 rounded-2xl bg-gradient-to-r from-blue-100 to-purple-100 text-purple-700 hover:from-blue-200 hover:to-purple-200 transition-all duration-200 shadow-md"
          >
            {isOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </motion.button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden border-t border-neutral-200 bg-gradient-to-br from-blue-50 to-purple-50"
          >
            <div className="px-4 py-6 space-y-3">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                const hasSubmenu = item.submenu && item.submenu.length > 0

                return (
                  <div key={item.name}>
                    <motion.div whileTap={{ scale: 0.95 }}>
                      <Link
                        href={item.href}
                        onClick={() => !hasSubmenu && setIsOpen(false)}
                        className={cn(
                          'block px-6 py-4 text-base font-bold rounded-2xl transition-all duration-200 shadow-md',
                          isActive
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 hover:text-purple-700'
                        )}
                      >
                        {item.name}
                      </Link>
                    </motion.div>

                    {/* Mobile Submenu */}
                    {hasSubmenu && (
                      <div className="mt-2 ml-4 space-y-2">
                        {item.submenu.map((subItem) => (
                          <motion.div key={subItem.name} whileTap={{ scale: 0.95 }}>
                            <Link
                              href={subItem.href}
                              onClick={() => setIsOpen(false)}
                              className="block px-6 py-3 text-sm font-medium rounded-xl bg-gray-50 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-purple-600 transition-all duration-200"
                            >
                              {subItem.name}
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
              <motion.div whileTap={{ scale: 0.95 }}>
                <Link
                  href="/contact"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700 text-white px-6 py-4 rounded-2xl text-base font-bold shadow-lg transition-all duration-200"
                >
                  ✨ Find a Dentist
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}