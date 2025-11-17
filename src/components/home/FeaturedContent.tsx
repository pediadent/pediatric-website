'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { CalendarDaysIcon, UserIcon, StarIcon } from '@heroicons/react/24/outline'
import { formatDate } from '@/lib/utils'

interface Article {
  id: string
  title: string
  slug: string
  excerpt: string | null
  featuredImage: string | null
  publishedAt: Date | null
  author: { name: string; slug: string }
  category: { name: string; slug: string }
}

interface Review {
  id: string
  title: string
  slug: string
  excerpt: string | null
  featuredImage: string | null
  rating: number | null
  publishedAt: Date | null
  author: { name: string; slug: string }
  primaryReviewer?: { name: string; slug: string } | null
  category: { name: string; slug: string }
}

interface FeaturedContentProps {
  articles: Article[]
  reviews: Review[]
}

export function FeaturedContent({ articles, reviews }: FeaturedContentProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  }

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto">
        {/* Latest Articles */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-100 to-blue-100 text-blue-700 rounded-full text-sm font-bold mb-6 border border-blue-200 shadow-lg">
              <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              📚 Expert knowledge for parents
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 mb-6">
              Latest{' '}
              <span className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                Articles 📝
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-medium">
              Expert insights and tips for pediatric dental care! ✨ Stay informed with the latest advice from professionals.
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {articles.map((article) => (
              <motion.article
                key={article.id}
                variants={cardVariants}
                whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.3 } }}
                className="group relative bg-white rounded-3xl shadow-elegant border border-neutral-200/50 overflow-hidden hover:shadow-elegant-lg transition-all duration-300"
              >
                {/* Gradient overlay on hover */}
                <div className="absolute -inset-1 bg-gradient-to-r from-green-200 via-blue-200 to-purple-200 rounded-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur"></div>

                <div className="relative">
                  <div className="relative h-56 bg-gradient-to-br from-green-50 via-white to-blue-50 overflow-hidden">
                    {article.featuredImage ? (
                      <Image
                        src={article.featuredImage}
                        alt={article.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="w-24 h-24 bg-gradient-to-br from-green-200 to-blue-300 rounded-full flex items-center justify-center shadow-lg">
                          <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                      </div>
                    )}

                    {/* Category badge */}
                    <div className="absolute top-4 left-4">
                      <div className="bg-gradient-to-r from-green-100 to-blue-100 text-green-700 px-4 py-2 rounded-full text-sm font-bold border border-green-200 shadow-lg backdrop-blur-sm">
                        📚 {article.category.name}
                      </div>
                    </div>
                  </div>

                  <div className="p-8">
                    <h3 className="text-2xl font-bold text-neutral-900 mb-3 line-clamp-2 group-hover:text-green-700 transition-colors">
                      <Link
                        href={`/${article.slug}/`}
                        className="hover:text-green-600 transition-colors"
                      >
                        {article.title}
                      </Link>
                    </h3>

                    {article.excerpt && (
                      <p className="text-neutral-600 text-base mb-6 line-clamp-3 leading-relaxed">
                        {article.excerpt}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-sm text-neutral-500 mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-50 rounded-xl">
                          <UserIcon className="h-4 w-4 text-green-600" />
                        </div>
                        <span className="font-medium">{article.author.name}</span>
                      </div>
                      {article.publishedAt && (
                        <div className="flex items-center space-x-2">
                          <CalendarDaysIcon className="h-4 w-4 text-neutral-400" />
                          <span>{formatDate(article.publishedAt)}</span>
                        </div>
                      )}
                    </div>

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Link
                        href={`/${article.slug}/`}
                        className="block w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white text-center py-4 px-6 rounded-2xl font-semibold transition-all duration-200 shadow-lg hover:shadow-glow group-hover:shadow-xl"
                      >
                        <span className="relative z-10">Read Article</span>
                      </Link>
                    </motion.div>
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/oral-health-tips/"
                className="group inline-flex items-center px-10 py-5 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold text-lg rounded-2xl shadow-elegant-lg hover:shadow-glow transition-all duration-300"
              >
                <span className="relative z-10">View All Articles</span>
                <motion.div
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="ml-3 relative z-10"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Featured Reviews */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-700 rounded-full text-sm font-bold mb-6 border border-orange-200 shadow-lg">
              <StarIcon className="w-5 h-5 mr-2 text-yellow-500 fill-current" />
              ⭐ Trusted recommendations
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 mb-6">
              Featured{' '}
              <span className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
                Reviews ⭐
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-medium">
              Honest reviews of dental products and services! 🎯 Helping parents make informed decisions for their children.
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {reviews.map((review) => (
              <motion.article
                key={review.id}
                variants={cardVariants}
                whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.3 } }}
                className="group relative bg-white rounded-3xl shadow-elegant border border-neutral-200/50 overflow-hidden hover:shadow-elegant-lg transition-all duration-300"
              >
                {/* Gradient overlay on hover */}
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-200 via-orange-200 to-red-200 rounded-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur"></div>

                <div className="relative">
                  <div className="relative h-56 bg-gradient-to-br from-yellow-50 via-white to-orange-50 overflow-hidden">
                    {review.featuredImage ? (
                      <Image
                        src={review.featuredImage}
                        alt={review.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="w-24 h-24 bg-gradient-to-br from-yellow-200 to-orange-300 rounded-full flex items-center justify-center shadow-lg">
                          <StarIcon className="w-12 h-12 text-yellow-600 fill-current" />
                        </div>
                      </div>
                    )}

                    {/* Category and Rating badges */}
                    <div className="absolute top-4 left-4">
                      <div className="bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-bold border border-orange-200 shadow-lg backdrop-blur-sm">
                        ⭐ {review.category.name}
                      </div>
                    </div>
                    {review.rating && (
                      <div className="absolute top-4 right-4">
                        <div className="flex items-center space-x-1 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full shadow-lg border border-white/50">
                          <StarIcon className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-bold text-neutral-800">
                            {review.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-8">
                    <h3 className="text-2xl font-bold text-neutral-900 mb-3 line-clamp-2 group-hover:text-orange-700 transition-colors">
                      <Link
                        href={`/${review.slug}/`}
                        className="hover:text-orange-600 transition-colors"
                      >
                        {review.title}
                      </Link>
                    </h3>

                    {review.excerpt && (
                      <p className="text-neutral-600 text-base mb-6 line-clamp-3 leading-relaxed">
                        {review.excerpt}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-sm text-neutral-500 mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-yellow-50 rounded-xl">
                          <UserIcon className="h-4 w-4 text-yellow-600" />
                        </div>
                        <span className="font-medium">{review.primaryReviewer?.name ?? review.author.name}</span>
                      </div>
                      {review.publishedAt && (
                        <div className="flex items-center space-x-2">
                          <CalendarDaysIcon className="h-4 w-4 text-neutral-400" />
                          <span>{formatDate(review.publishedAt)}</span>
                        </div>
                      )}
                    </div>

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Link
                        href={`/${review.slug}/`}
                        className="block w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white text-center py-4 px-6 rounded-2xl font-semibold transition-all duration-200 shadow-lg hover:shadow-glow group-hover:shadow-xl"
                      >
                        <span className="relative z-10">Read Review</span>
                      </Link>
                    </motion.div>
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/reviews/"
                className="group inline-flex items-center px-10 py-5 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-bold text-lg rounded-2xl shadow-elegant-lg hover:shadow-glow transition-all duration-300"
              >
                <span className="relative z-10">View All Reviews</span>
                <motion.div
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="ml-3 relative z-10"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
