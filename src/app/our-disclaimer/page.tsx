import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Disclaimer - Pediatric Dentist in Queens NY',
  description: 'Important legal disclaimer and disclosures about our website. Please read carefully before using our content.',
}

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Website Disclaimer & Disclosures
        </h1>

        <div className="bg-red-50 border-l-4 border-red-600 p-6 mb-12">
          <p className="text-red-900 font-bold text-lg mb-2">
            ⚠️ Important: Please Read Carefully
          </p>
          <p className="text-red-800">
            This website provides general educational information only and is NOT a substitute for professional medical advice, diagnosis, or treatment.
          </p>
        </div>

        <div className="prose prose-lg max-w-none">
          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">
            1. Not Medical Advice
          </h2>

          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            The content on Pediatric Dentist in Queens NY is provided for <strong>general educational purposes only</strong>. While we strive for accuracy and work with qualified dental professionals, this website cannot and does not provide specific medical advice tailored to your child's individual circumstances.
          </p>

          <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-8 mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              This Website Is Not a Substitute for Professional Medical Advice
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong>Always consult a qualified dentist or physician</strong> before making any decisions about your child's dental health. Only a professional who examines your child in person can give you a real diagnosis and appropriate treatment recommendations.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Our goal is to help you become a more informed and confident parent, but we cannot replace the expertise of your child's healthcare providers.
            </p>
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mb-4">Medical Emergencies</h3>

          <div className="bg-red-50 border-2 border-red-500 rounded-xl p-6 mb-8">
            <p className="text-red-900 font-bold mb-2">
              🚨 If your child is experiencing a dental emergency:
            </p>
            <ul className="list-disc list-inside space-y-2 text-red-800">
              <li>Do NOT rely on this website for emergency medical guidance</li>
              <li>Call your dentist immediately</li>
              <li>If after hours, go to an emergency room or call 911</li>
              <li>For severe bleeding, trauma, or difficulty breathing, call 911 immediately</li>
            </ul>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">
            2. Affiliate Disclosure
          </h2>

          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            This website participates in affiliate marketing programs, including the Amazon Services LLC Associates Program. This means:
          </p>

          <ul className="list-disc list-inside space-y-3 mb-8 text-gray-700">
            <li>When you click on certain links and make a purchase, we may earn a small commission</li>
            <li>This commission comes <strong>at no additional cost to you</strong></li>
            <li>We only recommend products we genuinely believe are beneficial</li>
            <li>Our editorial content is not influenced by potential earnings</li>
            <li>Affiliate relationships are always clearly disclosed</li>
          </ul>

          <div className="bg-blue-50 rounded-xl p-6 mb-8">
            <p className="text-blue-900 font-semibold mb-2">Our Promise:</p>
            <p className="text-gray-700">
              Readers' trust is our most valuable asset. We will never compromise the integrity of our content for commercial gain. If we recommend a product, it's because we believe it will genuinely help Queens families.
            </p>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">
            3. Directory Listings & External Links
          </h2>

          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            Our directory of pediatric dentists in Queens is provided as an informational resource. Important disclaimers:
          </p>

          <div className="bg-gray-50 rounded-xl p-8 mb-8">
            <h4 className="font-bold text-gray-900 mb-4">Directory Information</h4>
            <ul className="list-disc list-inside space-y-3 text-gray-700">
              <li>Listings are <strong>informational only</strong> and do not constitute endorsements</li>
              <li>We do our best to keep information current, but practices may change hours, locations, or services without notice</li>
              <li>Always verify information directly with the dental practice before visiting</li>
              <li>We are not responsible for the quality of care provided by listed dentists</li>
              <li>Some listings may include paid placements (clearly marked when applicable)</li>
            </ul>
          </div>

          <h4 className="text-xl font-bold text-gray-900 mb-4">External Links</h4>

          <p className="text-gray-700 leading-relaxed mb-6">
            This website contains links to external websites for your convenience and information. We have no control over and assume no responsibility for:
          </p>

          <ul className="list-disc list-inside space-y-2 mb-8 text-gray-700">
            <li>The content of external websites</li>
            <li>Privacy practices of external websites</li>
            <li>Services or products offered by external websites</li>
            <li>The accuracy or reliability of external website information</li>
          </ul>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">
            4. Limitation of Liability
          </h2>

          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            To the fullest extent permitted by law:
          </p>

          <div className="bg-gray-50 border border-gray-300 rounded-xl p-8 mb-8">
            <ul className="list-disc list-inside space-y-3 text-gray-700">
              <li>This website is provided "AS IS" without warranties of any kind</li>
              <li>We make no guarantees about the accuracy, completeness, or timeliness of content</li>
              <li>We are not liable for any decisions made based on information from this website</li>
              <li>We are not responsible for any damages arising from your use of this website</li>
              <li>Your use of this website is at your own risk</li>
            </ul>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">
            5. Content Accuracy & Updates
          </h2>

          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            While we work diligently to provide accurate information:
          </p>

          <ul className="list-disc list-inside space-y-3 mb-8 text-gray-700">
            <li>Medical guidelines and best practices evolve over time</li>
            <li>We update content regularly but cannot guarantee all information is current</li>
            <li>Always check the "last reviewed" date on articles</li>
            <li>Consult current medical guidelines and your dentist for the latest recommendations</li>
          </ul>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">
            6. Copyright & Intellectual Property
          </h2>

          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            All original content on this website (text, images, graphics, logos) is protected by copyright and owned by Pediatric Dentist in Queens NY or licensed to us. You may:
          </p>

          <ul className="list-disc list-inside space-y-3 mb-6 text-gray-700">
            <li>View and print content for personal, non-commercial use</li>
            <li>Share links to our content on social media</li>
          </ul>

          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            You may NOT:
          </p>

          <ul className="list-disc list-inside space-y-3 mb-8 text-gray-700">
            <li>Reproduce, republish, or redistribute our content without permission</li>
            <li>Use our content for commercial purposes</li>
            <li>Remove copyright notices or attributions</li>
            <li>Claim our content as your own</li>
          </ul>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">
            7. Changes to This Disclaimer
          </h2>

          <p className="text-lg text-gray-700 leading-relaxed mb-8">
            We may update this disclaimer from time to time. Changes will be posted on this page with an updated revision date. Continued use of the website after changes constitutes acceptance of the updated disclaimer.
          </p>

          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-8 mt-12">
            <h3 className="text-2xl font-bold mb-4">Questions About This Disclaimer?</h3>
            <p className="text-lg mb-4">
              If you have questions or concerns about this disclaimer, please contact us:
            </p>
            <p className="text-lg">
              <strong>Email:</strong> <a href="mailto:hello@pediatricdentistinqueensny.com" className="underline">hello@pediatricdentistinqueensny.com</a><br />
              <strong>Phone:</strong> +1 917-965-8301
            </p>
            <p className="text-sm mt-6 opacity-90">
              Last Updated: January 2025
            </p>
          </div>

          <div className="mt-12 p-6 bg-green-50 border-l-4 border-green-600 rounded">
            <p className="text-green-900 font-semibold mb-2">
              ✓ Your Privacy & Trust Matter
            </p>
            <p className="text-green-800">
              We take your trust seriously. While these legal disclaimers are necessary, our commitment to serving Queens families with honest, helpful dental health information remains our top priority.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
