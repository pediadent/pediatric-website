import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us - Pediatric Dentist in Queens NY',
  description: 'Learn about our mission to help Queens families find trusted pediatric dental care. Our story started with a parent\'s late-night search for a dentist.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">About Us – Our Story</h1>

        <div className="prose prose-lg max-w-none">
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            It was 9 PM on a Sunday night, and I was frantically Googling "pediatric dentist near me in Queens" for what felt like the hundredth time. My daughter had been complaining about tooth pain all weekend, and I couldn't find a dentist who could see her quickly. The websites I found were either outdated, confusing, or didn't give me the information I actually needed.
          </p>

          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            That frustrating night led to the creation of this website.
          </p>

          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            As I talked to other parents in Queens, I realized I wasn't alone. So many of us were struggling with the same issues—finding dentists who spoke our language, navigating insurance paperwork, or locating offices that were sensory-friendly for kids with special needs. We needed a resource that actually understood what Queens families go through.
          </p>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">Our Mission</h2>

          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            This website was built on three simple principles:
          </p>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">1. Community First</h3>
            <p className="text-gray-700 leading-relaxed">
              Everything we do is designed to help Queens families. When we make decisions about what to include on this site, we think about what would actually be helpful to our neighbors and friends.
            </p>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-8 mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">2. Transparency</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We're upfront about how this website is funded. Yes, we use affiliate links, which means we might earn a small commission when you purchase products through our recommendations. But here's the thing: those affiliate links don't cost you anything extra, and we only recommend products we genuinely believe in.
            </p>
            <p className="text-gray-700 leading-relaxed">
              We participate in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com.
            </p>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-8 mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">3. Empowering Parents</h3>
            <p className="text-gray-700 leading-relaxed">
              We believe that dental visits shouldn't be mysterious or scary. Our goal is to give you simple, actionable advice that helps you feel confident about your child's oral health. No medical jargon, no confusing technical terms—just straightforward information that makes sense.
            </p>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">A Love Letter to Queens</h2>

          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            This website is a love letter to our home borough. It's our pledge to you to provide a service that is authentic, helpful, and trustworthy. Whether you're a new parent navigating your first dental appointment or a veteran looking for specialized care, we're here to help.
          </p>

          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            Thank you for trusting us to be part of your family's healthcare journey. We don't take that responsibility lightly.
          </p>

          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-8 mt-12">
            <p className="text-xl font-semibold text-center">
              From our family to yours, thank you for being part of our community.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
