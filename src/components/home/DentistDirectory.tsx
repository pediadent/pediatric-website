'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import Link from 'next/link'
import { StarIcon, MapPinIcon, PhoneIcon, GlobeAltIcon, ClockIcon, CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/solid'

interface Dentist {
  id: string
  name: string
  slug: string
  description: string | null
  about: string | null
  address: string | null
  phone: string | null
  website: string | null
  email: string | null
  rating: number | null
  image: string | null
  logo: string | null
  services: string | null
  workingHours: string | null
}

interface DentistDirectoryProps {
  dentists: Dentist[]
}

export function DentistDirectory({ dentists }: DentistDirectoryProps) {
  const [selectedDentist, setSelectedDentist] = useState<Dentist | null>(null)

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
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-pink-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-100 to-purple-100 text-purple-700 rounded-full text-sm font-bold mb-6 border border-purple-200 shadow-lg">
            <svg className="w-5 h-5 mr-2 text-red-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            🌟 Loved by families across Queens
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 mb-6">
            Pediatric Dentists in{' '}
            <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Queens, NY 🦷
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-medium">
            Complete directory of caring dental professionals who make every visit a positive experience for your little ones!
            ✨ Each dentist is verified and loved by local families.
          </p>
          <div className="mt-6 flex items-center justify-center space-x-2 text-lg font-semibold text-gray-700">
            <span className="inline-flex items-center px-4 py-2 bg-white rounded-full shadow-md border border-gray-200">
              📍 {dentists.length} Trusted Practices
            </span>
          </div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {dentists.map((dentist) => {
            const services = dentist.services ? JSON.parse(dentist.services) : []

            return (
              <motion.div
                key={dentist.id}
                variants={cardVariants}
                whileHover={{ y: -6, scale: 1.02, transition: { duration: 0.3 } }}
                className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl border border-neutral-200/50 overflow-hidden transition-all duration-300 flex flex-col h-full"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 rounded-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur"></div>

                <div className="relative p-6 flex flex-col flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h2 className="text-xl font-black text-neutral-900 mb-2 group-hover:text-blue-700 transition-colors line-clamp-2 min-h-[3.5rem]">
                        {dentist.name}
                      </h2>
                      {dentist.rating && (
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <StarIcon
                                key={i}
                                className={`h-4 w-4 ${
                                  i < Math.floor(dentist.rating!)
                                    ? 'text-yellow-500 fill-current'
                                    : 'text-gray-300 fill-current'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-bold text-neutral-800">
                            {dentist.rating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-200 to-purple-300 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                      <span className="text-3xl">🦷</span>
                    </div>
                  </div>

                  {services.length > 0 && (
                    <div className="mb-6 flex-1">
                      <div className="flex items-center space-x-2 mb-3">
                        <CheckCircleIcon className="h-4 w-4 text-blue-600" />
                        <h3 className="text-xs font-bold text-neutral-700 uppercase">Services</h3>
                      </div>
                      <div className="flex flex-wrap gap-2 min-h-[5rem]">
                        {services.slice(0, 4).map((service: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-200 h-fit"
                          >
                            {service}
                          </span>
                        ))}
                        {services.length > 4 && (
                          <span className="px-2 py-1 bg-neutral-100 text-neutral-600 text-xs font-semibold rounded-full h-fit">
                            +{services.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <motion.button
                    onClick={() => setSelectedDentist(dentist)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-center py-3 px-4 rounded-2xl font-bold text-sm transition-all duration-200 shadow-lg hover:shadow-xl mt-auto"
                  >
                    View Full Details →
                  </motion.button>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedDentist && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedDentist(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden relative"
            >
              <div className="overflow-y-auto max-h-[90vh]">
              <button
                onClick={() => setSelectedDentist(null)}
                className="absolute top-6 right-6 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors z-10"
              >
                <XMarkIcon className="h-6 w-6 text-gray-600" />
              </button>

              <div className="p-8">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1 pr-4">
                    <h2 className="text-4xl font-black text-neutral-900 mb-3">
                      {selectedDentist.name}
                    </h2>
                    {selectedDentist.rating && (
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon
                              key={i}
                              className={`h-6 w-6 ${
                                i < Math.floor(selectedDentist.rating!)
                                  ? 'text-yellow-500 fill-current'
                                  : 'text-gray-300 fill-current'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xl font-bold text-neutral-800">
                          {selectedDentist.rating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-200 to-purple-300 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                    <span className="text-5xl">🦷</span>
                  </div>
                </div>

                {selectedDentist.description && (
                  <p className="text-neutral-600 text-lg mb-8 leading-relaxed">
                    {selectedDentist.description}
                  </p>
                )}

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column - Contact Info */}
                  <div className="space-y-6">
                    {selectedDentist.address && (
                      <div className="flex items-start space-x-3">
                        <div className="p-3 bg-blue-50 rounded-xl flex-shrink-0">
                          <MapPinIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs font-bold text-neutral-500 uppercase mb-1">Address</div>
                          <span className="text-base text-neutral-700 leading-relaxed">
                            {selectedDentist.address}
                          </span>
                        </div>
                      </div>
                    )}

                    {selectedDentist.services && (
                      <div>
                        <div className="flex items-center space-x-2 mb-3">
                          <CheckCircleIcon className="h-6 w-6 text-blue-600" />
                          <h3 className="text-sm font-bold text-neutral-700 uppercase">All Services</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {JSON.parse(selectedDentist.services).map((service: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-3 py-2 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 text-sm font-semibold rounded-full border border-blue-200"
                            >
                              {service}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* CTA Button */}
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Link
                        href={`/${selectedDentist.slug}`}
                        className="block w-full bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700 text-white text-center py-5 px-6 rounded-2xl font-bold text-xl transition-all duration-200 shadow-lg hover:shadow-glow"
                      >
                        Visit Profile →
                      </Link>
                    </motion.div>
                  </div>

                  {/* Right Column - Office Hours */}
                  {selectedDentist.workingHours && (() => {
                    const workingHours = JSON.parse(selectedDentist.workingHours)
                    const hasInfo = 'info' in workingHours

                    return (
                      <div>
                        <div className="flex items-center space-x-2 mb-4">
                          <ClockIcon className="h-6 w-6 text-orange-600" />
                          <h3 className="text-sm font-bold text-neutral-700 uppercase">Office Hours</h3>
                        </div>
                        {hasInfo ? (
                          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 px-4 py-3 rounded-lg border border-orange-200">
                            <p className="text-neutral-700 text-sm">{workingHours.info}</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(workingHours).map(([day, hours]) => (
                              <div key={day} className="bg-gradient-to-r from-orange-50 to-yellow-50 px-3 py-2 rounded-lg border border-orange-200">
                                <div className="font-bold text-neutral-700 capitalize text-sm">{day}</div>
                                <div className="text-neutral-600 text-xs">{hours as string}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })()}
                </div>
              </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
