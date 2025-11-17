'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDownIcon } from '@heroicons/react/24/outline'

const faqs = [
  {
    question: "At what age should my child first visit a pediatric dentist?",
    answer: "The American Academy of Pediatric Dentistry recommends that children visit a dentist by their first birthday or within six months of their first tooth appearing. Early visits help establish a dental home and prevent future dental problems."
  },
  {
    question: "How often should my child see a pediatric dentist?",
    answer: "Most children should visit a pediatric dentist every six months for routine cleanings and check-ups. However, some children may need more frequent visits based on their oral health needs and risk factors."
  },
  {
    question: "What makes pediatric dentists different from general dentists?",
    answer: "Pediatric dentists have additional training specifically focused on treating children from infancy through adolescence. They understand child development, behavior management, and are trained to handle the unique dental needs of growing children."
  },
  {
    question: "How can I prepare my child for their first dental visit?",
    answer: "Read books about going to the dentist, play pretend dentist at home, and speak positively about the experience. Avoid using words like 'hurt' or 'pain.' Most pediatric dental offices are designed to be child-friendly and welcoming."
  },
  {
    question: "What should I do if my child has a dental emergency?",
    answer: "For dental emergencies like knocked-out teeth, severe pain, or trauma, contact your pediatric dentist immediately. Many offices have emergency contact numbers. For severe injuries, visit the emergency room first, then follow up with your dentist."
  },
  {
    question: "Are pediatric dental treatments covered by insurance?",
    answer: "Most dental insurance plans cover routine pediatric dental care including cleanings, exams, and preventive treatments. Coverage varies by plan, so check with your insurance provider about specific benefits and limitations."
  }
]

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-sm font-bold mb-6 border border-purple-200 shadow-lg">
            <svg className="w-5 h-5 mr-2 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            ❓ Got questions? We have answers
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 mb-6">
            Frequently Asked{' '}
            <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 bg-clip-text text-transparent">
              Questions 💬
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-medium">
            Common questions about pediatric dental care in Queens, NY! 🦷 Everything you need to know in one place.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
              className="relative bg-white rounded-3xl shadow-elegant border border-neutral-200/50 overflow-hidden hover:shadow-elegant-lg transition-all duration-300"
            >
              {/* Gradient accent */}
              <div className={`absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b ${
                index % 3 === 0 ? 'from-purple-500 to-pink-500' :
                index % 3 === 1 ? 'from-blue-500 to-purple-500' :
                'from-pink-500 to-red-500'
              }`}></div>

              <button
                onClick={() => toggleFAQ(index)}
                className="w-full text-left px-8 py-6 bg-white hover:bg-gradient-to-r hover:from-purple-50/30 hover:to-pink-50/30 transition-all duration-200 flex items-center justify-between"
              >
                <span className="text-lg font-bold text-gray-900 pr-4">
                  {faq.question}
                </span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className={`p-2 rounded-full ${
                    openIndex === index
                      ? 'bg-gradient-to-r from-purple-100 to-pink-100'
                      : 'bg-neutral-100'
                  } transition-colors duration-200`}
                >
                  <ChevronDownIcon className={`h-5 w-5 ${
                    openIndex === index ? 'text-purple-600' : 'text-neutral-500'
                  } flex-shrink-0 transition-colors duration-200`} />
                </motion.div>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-8 py-6 bg-gradient-to-r from-purple-50/50 to-pink-50/50 border-t border-neutral-200">
                      <p className="text-neutral-700 text-base leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-purple-100 via-pink-100 to-red-100 rounded-3xl p-12 border border-purple-200 shadow-elegant">
            <h3 className="text-3xl font-black text-gray-900 mb-4">
              Still have questions? 🤔
            </h3>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              We&apos;re here to help! Reach out to us and we&apos;ll get back to you as soon as possible.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <a
                href="mailto:pediatricdentistinqueensny@gmail.com"
                className="inline-flex items-center px-10 py-5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-lg rounded-2xl shadow-elegant-lg hover:shadow-glow transition-all duration-300"
              >
                <svg className="mr-3 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Contact Us
                <motion.div
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="ml-3"
                >
                  →
                </motion.div>
              </a>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}