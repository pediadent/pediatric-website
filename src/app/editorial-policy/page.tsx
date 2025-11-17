import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Editorial Policy - Pediatric Dentist in Queens NY',
  description: 'Our commitment to accurate, trustworthy dental health information for Queens families. Learn about our editorial standards and review process.',
}

export default function EditorialPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Our Editorial Policy: A Commitment from Dr. Mary G. Trice
        </h1>

        <div className="bg-blue-50 border-l-4 border-blue-600 p-6 mb-12">
          <p className="text-blue-900 font-bold text-lg mb-2">
            👋 Hello, I'm Dr. Mary G. Trice
          </p>
          <p className="text-blue-800 mb-2">
            I'm the founder of Pediatric Dentist in Queens NY and the author and clinical reviewer for the content on this site.
          </p>
        </div>

        <div className="prose prose-lg max-w-none">
          <p className="text-lg text-gray-700 leading-relaxed mb-2">
            This page exists for one reason: to earn and maintain your trust.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed mb-2">
            As a parent and a healthcare professional, I know the internet is filled with health information, and it can be difficult to know who to believe.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed mb-2">
            I believe transparency is the foundation of that trust.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed mb-2">
            This policy is my commitment to giving you a clear, honest look at the principles, standards, and processes that guide every piece of content we publish.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed mb-2">
            Our core mission is to be the most reliable, empathetic, and useful resource for parents navigating children's dental health in Queens.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed mb-8">
            This policy is the framework I use to ensure my team and I live up to that promise every single day.
          </p>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">My Guiding Editorial Principles</h2>

          <p className="text-lg text-gray-700 leading-relaxed mb-2">
            Every article, guide, and review on this site is shaped by a core set of principles.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            These are the pillars of my work:
          </p>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Service to the Reader First</h3>
            <p className="text-gray-700 leading-relaxed">
              My primary allegiance is to you, the parents and caregivers of Queens. Every topic we choose and every sentence we write is guided by the question: "Is this genuinely helpful, useful, and empowering for our readers?" Your needs are prioritized above all else.
            </p>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-8 mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Unwavering Commitment to Accuracy</h3>
            <p className="text-gray-700 leading-relaxed">
              When it comes to your child's health, accuracy is an ethical obligation. I am rigorously committed to providing information that is precise, evidence-based, and reflective of the current consensus in the pediatric dental field.
            </p>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-8 mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Empathy and Understanding</h3>
            <p className="text-gray-700 leading-relaxed">
              We are parents, too. I approach our content with a deep understanding of the anxiety and stress that can accompany healthcare decisions. My goal is to use a tone that is supportive and reassuring, breaking down complex topics into clear, practical advice.
            </p>
          </div>

          <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-8 mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Radical Transparency</h3>
            <p className="text-gray-700 leading-relaxed">
              You have a right to know who is providing your information and how our work is funded. I am open about my process and our use of affiliate links to support our mission.
            </p>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">Our Content Creation & Verification Process</h2>

          <p className="text-lg text-gray-700 leading-relaxed mb-8">
            To ensure our content meets the high standards I set, my team and I follow a meticulous process for every article.
          </p>

          <div className="space-y-6 mb-12">
            <div className="border-l-4 border-blue-600 pl-6 py-2">
              <h4 className="text-xl font-bold text-gray-900 mb-2">1. Topic Selection</h4>
              <p className="text-gray-700 mb-2">
                Our ideas come directly from the community we serve.
              </p>
              <p className="text-gray-700">
                We listen to your questions and identify common points of confusion to create the definitive resource to address them.
              </p>
            </div>

            <div className="border-l-4 border-purple-600 pl-6 py-2">
              <h4 className="text-xl font-bold text-gray-900 mb-2">2. Diligent Research & Sourcing</h4>
              <p className="text-gray-700 mb-2">
                Once a topic is chosen, we conduct in-depth research.
              </p>
              <p className="text-gray-700 mb-2">
                All medical claims are sourced from highly reputable, evidence-based institutions, including the <strong>American Dental Association (ADA)</strong>, the <strong>American Academy of Pediatric Dentistry (AAPD)</strong>, and peer-reviewed scientific journals.
              </p>
              <p className="text-gray-700">
                I do not present personal opinions as medical facts.
              </p>
            </div>

            <div className="border-l-4 border-orange-600 pl-6 py-2">
              <h4 className="text-xl font-bold text-gray-900 mb-2">3. Writing & Clinical Review</h4>
              <p className="text-gray-700 mb-2">
                After an article is written for clarity and empathy, I personally review every single piece.
              </p>
              <p className="text-gray-700">
                As a pediatric dentist, I verify every factual claim, statistic, and medical statement against the source material to ensure its clinical accuracy and reliability.
              </p>
            </div>

            <div className="border-l-4 border-green-600 pl-6 py-2">
              <h4 className="text-xl font-bold text-gray-900 mb-2">4. Regular Content Updates</h4>
              <p className="text-gray-700 mb-2">
                The world of healthcare is always changing.
              </p>
              <p className="text-gray-700 mb-2">
                Our work isn't done once an article is published.
              </p>
              <p className="text-gray-700">
                We have a system to periodically review our existing content to ensure it remains accurate, fresh, and relevant.
              </p>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">Our Policy on Product Reviews & Affiliate Links</h2>

          <p className="text-lg text-gray-700 leading-relaxed mb-2">
            We review dental products to help parents make informed decisions.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed mb-2">
            My commitment to editorial independence is paramount.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed mb-2">
            Products are chosen for review based on our independent research into what is effective and well-regarded in the market.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed mb-2">
            Our writers and I form our opinions before any affiliate links are added.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed mb-2">
            These links, which may earn us a small commission at no extra cost to you, are a business function that helps fund our free resources.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed mb-2">
            They are kept separate from our content creation process to prevent bias.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            Our readers' trust is worth more than any commission.
          </p>

          <div className="bg-yellow-50 border-l-4 border-yellow-600 p-6 mb-8">
            <p className="text-gray-800 italic">
              (We are a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com and affiliated sites.)
            </p>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">Ethics, Corrections, and AI Policy</h2>

          <div className="bg-red-50 border-l-4 border-red-600 rounded-xl p-8 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Corrections</h3>
            <p className="text-gray-700 leading-relaxed mb-2">
              I am human, and despite my best efforts, I may occasionally make a mistake.
            </p>
            <p className="text-gray-700 leading-relaxed mb-2">
              When I do, I am committed to correcting it promptly and transparently.
            </p>
            <p className="text-gray-700 leading-relaxed">
              If you believe you have found an error, please contact me directly via our Contact Us page.
            </p>
          </div>

          <div className="bg-purple-50 border-l-4 border-purple-600 rounded-xl p-8 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Artificial Intelligence (AI) Policy</h3>
            <p className="text-gray-700 leading-relaxed mb-2">
              I believe in using the best tools to help.
            </p>
            <p className="text-gray-700 leading-relaxed mb-2">
              My team and I may use AI software to assist with brainstorming or checking grammar.
            </p>
            <p className="text-gray-700 leading-relaxed">
              However, AI is not the author. Every article is fully researched, written, and edited by our human team members, and all medical guidance is personally approved by me.
            </p>
          </div>

          <p className="text-lg text-gray-700 leading-relaxed mb-2">
            Thank you for taking the time to read our editorial policy.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed mb-8">
            I hope it gives you confidence in the quality and integrity of our work. Your trust is the measure of our success.
          </p>

          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 mt-12">
            <p className="text-lg !text-white mb-4">
              Sincerely,
            </p>
            <p className="text-2xl font-bold !text-white">
              Dr. Mary G. Trice
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
