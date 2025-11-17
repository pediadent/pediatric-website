'use client'

import { motion } from 'framer-motion'

export function InfoSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="prose prose-lg max-w-none"
        >
          {/* Main Heading */}
          <div className="mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-6">
              What is a Pediatric Dentist and what do they do?
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Pediatric dentists look into the oral health and the tooth problems of children from the early stage of infancy to the teens. They are specialized to look after the children's teeth, mouth, and gums in the early years.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              After completing their dental school, pediatric dentists undergo additional training for two to three years to specialize in treating children. This specialized training helps them understand the unique dental needs of growing children.
            </p>
          </div>

          {/* Benefits Section */}
          <div className="mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
              Benefits that Pediatric dentists offer to children:
            </h3>
            <ul className="space-y-3 text-lg text-gray-700">
              <li className="flex items-start">
                <span className="text-blue-600 font-bold mr-3">•</span>
                <span>Understand children's feelings and emotions during dental visits</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 font-bold mr-3">•</span>
                <span>Specialize in young jaw and teeth care</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 font-bold mr-3">•</span>
                <span>Help with habits like thumb sucking and pacifier use</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 font-bold mr-3">•</span>
                <span>Understand growth and developmental phases of children</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 font-bold mr-3">•</span>
                <span>Create a comfortable, child-friendly environment</span>
              </li>
            </ul>
          </div>

          {/* Patient Ages Section */}
          <div className="mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
              How old are Pediatric dentists' patients?
            </h3>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              Pediatric dentists typically see children from 6 months to 13-14 years of age. It is recommended that children first visit a pediatric dentist when their first tooth appears or by their first birthday.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Early dental visits help establish good oral hygiene habits and allow the dentist to detect any potential problems early on.
            </p>
          </div>

          {/* Types of Treatments Section */}
          <div className="mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
              Types of Treatments Provided:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ul className="space-y-3 text-lg text-gray-700">
                <li className="flex items-start">
                  <span className="text-purple-600 font-bold mr-3">✓</span>
                  <span>Oral examinations</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 font-bold mr-3">✓</span>
                  <span>Preventive dental care</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 font-bold mr-3">✓</span>
                  <span>Counseling for infant oral habits</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 font-bold mr-3">✓</span>
                  <span>Correcting improper bites</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 font-bold mr-3">✓</span>
                  <span>Repairing cavities and tooth decay</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 font-bold mr-3">✓</span>
                  <span>Dental cleaning and fluoride treatments</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 font-bold mr-3">✓</span>
                  <span>Digital X-rays</span>
                </li>
              </ul>
              <ul className="space-y-3 text-lg text-gray-700">
                <li className="flex items-start">
                  <span className="text-purple-600 font-bold mr-3">✓</span>
                  <span>Laser dentistry</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 font-bold mr-3">✓</span>
                  <span>Tooth-colored fillings</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 font-bold mr-3">✓</span>
                  <span>Stainless steel crowns</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 font-bold mr-3">✓</span>
                  <span>Early orthodontic care</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 font-bold mr-3">✓</span>
                  <span>Tooth extractions</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 font-bold mr-3">✓</span>
                  <span>Dental sealants</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 font-bold mr-3">✓</span>
                  <span>Space maintainers</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Difference Section */}
          <div className="mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
              What is the difference between a Pediatric Dentist and a Regular Dentist?
            </h3>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              While both pediatric dentists and regular dentists are qualified to treat patients of all ages, pediatric dentists have additional specialized training focused specifically on children's dental needs.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              Pediatric dentists understand child psychology and behavior management techniques, making dental visits less stressful for children. Their offices are designed to be welcoming and fun for kids, with child-sized equipment and colorful, engaging environments.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              They also have expertise in treating dental issues unique to children, such as teething problems, thumb-sucking habits, and the transition from baby teeth to permanent teeth.
            </p>
          </div>

          {/* Finding the Right Dentist Section */}
          <div className="mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
              How to Find the Right Pediatric Dentist in Queens, NY?
            </h3>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              Finding the right pediatric dentist for your child is an important decision. Here are some tips to help you choose:
            </p>
            <ul className="space-y-3 text-lg text-gray-700">
              <li className="flex items-start">
                <span className="text-pink-600 font-bold mr-3">→</span>
                <span>Look for board-certified pediatric dentists with proper credentials</span>
              </li>
              <li className="flex items-start">
                <span className="text-pink-600 font-bold mr-3">→</span>
                <span>Read reviews and testimonials from other parents</span>
              </li>
              <li className="flex items-start">
                <span className="text-pink-600 font-bold mr-3">→</span>
                <span>Visit the office to check if it's child-friendly and welcoming</span>
              </li>
              <li className="flex items-start">
                <span className="text-pink-600 font-bold mr-3">→</span>
                <span>Consider location and office hours for convenience</span>
              </li>
              <li className="flex items-start">
                <span className="text-pink-600 font-bold mr-3">→</span>
                <span>Verify insurance acceptance and payment options</span>
              </li>
              <li className="flex items-start">
                <span className="text-pink-600 font-bold mr-3">→</span>
                <span>Ask about emergency care availability</span>
              </li>
            </ul>
          </div>
        </motion.div>
      </div>
    </section>
  )
}