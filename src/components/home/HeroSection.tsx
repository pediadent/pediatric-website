'use client'

import { motion } from 'framer-motion'
import { MagnifyingGlassIcon, SparklesIcon, HeartIcon, StarIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'

export function HeroSection() {
  const [searchFocused, setSearchFocused] = useState(false)

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Floating Shapes */}
        <motion.div
          animate={{
            y: [0, -30, 0],
            rotate: [0, 10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-80 blur-sm"
        />
        <motion.div
          animate={{
            y: [0, 20, 0],
            rotate: [0, -15, 0],
            scale: [1, 0.9, 1]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-32 right-20 w-16 h-16 bg-gradient-to-br from-green-400 to-cyan-500 rounded-2xl opacity-70 blur-sm"
        />
        <motion.div
          animate={{
            y: [0, -15, 0],
            x: [0, 10, 0],
            rotate: [0, 20, 0]
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-32 left-20 w-24 h-24 bg-gradient-to-br from-pink-400 to-purple-600 rounded-3xl opacity-60 blur-sm"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-white/10 via-transparent to-white/5"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        {/* Trust Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center px-6 py-3 bg-white/90 backdrop-blur-md rounded-full text-purple-600 font-semibold text-sm shadow-lg border border-white/20 mb-8"
        >
          <SparklesIcon className="w-5 h-5 mr-2 text-yellow-500" />
          ✨ Trusted by 15,000+ Happy Families in Queens
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight"
        >
          Find Amazing{' '}
          <span className="relative inline-block">
            <span className="bg-gradient-to-r from-yellow-300 via-pink-300 to-cyan-300 bg-clip-text text-transparent">
              Pediatric Dentists
            </span>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 1.5 }}
              className="absolute -bottom-2 left-0 right-0 h-2 bg-gradient-to-r from-yellow-400 to-pink-400 rounded-full"
            />
          </span>
          <br />
          <span className="text-white/95">in Queens! 🦷✨</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl sm:text-2xl text-white/90 mb-12 max-w-4xl mx-auto leading-relaxed font-medium"
        >
          Discover caring, skilled pediatric dentists who make dental visits{' '}
          <span className="text-yellow-300 font-bold">fun and stress-free</span> for your children!
          🌟 Expert care with a smile! 😊
        </motion.p>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="max-w-3xl mx-auto mb-16"
        >
          <div className={`relative group transition-all duration-300 ${searchFocused ? 'scale-105' : ''}`}>
            <div className="absolute -inset-3 bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 rounded-3xl blur opacity-60 group-hover:opacity-80 transition duration-300"></div>
            <div className="relative bg-white rounded-2xl shadow-2xl border border-white/20">
              <MagnifyingGlassIcon className="absolute left-6 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
              <input
                type="text"
                placeholder="🔍 Search by name, location, or what your child needs..."
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="w-full pl-16 pr-40 py-6 text-lg rounded-2xl border-none focus:ring-4 focus:ring-purple-300 focus:outline-none placeholder-gray-400 bg-white font-medium"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-xl font-bold text-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg"
              >
                Find Now! 🚀
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16"
        >
          {[
            {
              icon: "🏥",
              title: "Local Experts",
              description: "Queens-based pediatric specialists",
              gradient: "from-blue-400 to-cyan-500",
              bgGradient: "from-blue-100 to-cyan-100"
            },
            {
              icon: "⭐",
              title: "Real Reviews",
              description: "Honest feedback from parents",
              gradient: "from-yellow-400 to-orange-500",
              bgGradient: "from-yellow-100 to-orange-100"
            },
            {
              icon: "💝",
              title: "Kid-Friendly",
              description: "Making dental visits fun!",
              gradient: "from-pink-400 to-purple-500",
              bgGradient: "from-pink-100 to-purple-100"
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 + index * 0.1 }}
              whileHover={{ y: -8, scale: 1.05 }}
              className="group"
            >
              <div className={`relative p-8 bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/30 transition-all duration-300 group-hover:shadow-2xl group-hover:bg-white`}>
                <div className="text-4xl mb-4 text-center">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-center font-medium">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <motion.button
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.95 }}
            className="group relative inline-flex items-center px-12 py-5 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 text-white font-black text-xl rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300"
          >
            <span className="relative z-10 flex items-center">
              🎯 Explore All Dentists
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="ml-2"
              >
                →
              </motion.span>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 via-pink-600 to-purple-700 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-300"></div>
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}