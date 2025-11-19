import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { StarIcon, MapPinIcon, PhoneIcon, GlobeAltIcon, ClockIcon, EnvelopeIcon } from '@heroicons/react/24/solid'
import { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const dentist = await prisma.dentistDirectory.findUnique({
    where: { slug }
  })

  if (!dentist) {
    return {
      title: 'Dentist Not Found'
    }
  }

  return {
    title: dentist.seoTitle || `${dentist.name} - Pediatric Dentist in Queens NY`,
    description: dentist.seoDescription || dentist.description || `Find information about ${dentist.name}, a trusted pediatric dentist in Queens, NY.`,
    robots: {
      index: !dentist.isNoIndex,
      follow: !dentist.isNoFollow,
    }
  }
}

export default async function DentistPage({ params }: PageProps) {
  const { slug } = await params
  const dentist = await prisma.dentistDirectory.findUnique({
    where: { slug }
  })

  if (!dentist || !dentist.isActive) {
    notFound()
  }

  const services = dentist.services ? JSON.parse(dentist.services) : []
  const workingHours = dentist.workingHours ? JSON.parse(dentist.workingHours) : {}

  const { generateMedicalBusinessSchema, generateBreadcrumbSchema } = await import('@/lib/schema-generator')
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://pediatricdentistinqueensny.com'
  const dentistUrl = `${baseUrl}/dentist/${dentist.slug}/`

  // Parse address for schema
  const addressParts = dentist.address ? {
    street: dentist.address.split(',')[0]?.trim() || '',
    city: 'Queens',
    state: 'NY',
    zip: dentist.address.match(/\d{5}/)?.[0] || '',
    country: 'US'
  } : undefined

  // Medical Business Schema
  const businessSchema = dentist.schema ? JSON.parse(dentist.schema) : generateMedicalBusinessSchema({
    name: dentist.name,
    description: dentist.description || `${dentist.name} - Pediatric Dentist in Queens, NY`,
    url: dentistUrl,
    address: addressParts,
    phone: dentist.phone || undefined,
    email: dentist.email || undefined,
    image: dentist.image || dentist.logo || undefined,
    rating: dentist.rating ? {
      value: dentist.rating,
      count: 1
    } : undefined,
    priceRange: dentist.priceRange || undefined,
    openingHours: workingHours ? Object.entries(workingHours).map(([day, hours]: [string, any]) =>
      `${day}:${hours.open || ''}-${hours.close || ''}`
    ) : undefined
  })

  // Breadcrumb Schema
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: baseUrl },
    { name: 'Dentist Directory', url: `${baseUrl}/` },
    { name: dentist.name, url: dentistUrl }
  ])

  const schemas = [businessSchema, breadcrumbSchema]

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 py-16">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {dentist.name}
            </h1>

            {dentist.rating && (
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(dentist.rating!)
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-lg font-semibold text-gray-700">
                  {dentist.rating.toFixed(1)}
                </span>
              </div>
            )}

            {dentist.description && (
              <p className="text-lg text-gray-700 leading-relaxed">
                {dentist.description}
              </p>
            )}
          </div>

          {/* Contact Information */}
          <div className="bg-blue-50 rounded-xl p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Information</h2>
            <div className="space-y-3">
              {dentist.address && (
                <div className="flex items-start space-x-3">
                  <MapPinIcon className="h-5 w-5 text-blue-600 mt-1" />
                  <span className="text-gray-700">{dentist.address}</span>
                </div>
              )}

              {dentist.phone && (
                <div className="flex items-center space-x-3">
                  <PhoneIcon className="h-5 w-5 text-blue-600" />
                  <a
                    href={`tel:${dentist.phone}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {dentist.phone}
                  </a>
                </div>
              )}

              {dentist.email && (
                <div className="flex items-center space-x-3">
                  <EnvelopeIcon className="h-5 w-5 text-blue-600" />
                  <a
                    href={`mailto:${dentist.email}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {dentist.email}
                  </a>
                </div>
              )}

              {dentist.website && (
                <div className="flex items-center space-x-3">
                  <GlobeAltIcon className="h-5 w-5 text-blue-600" />
                  <a
                    href={dentist.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Visit Website
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Services */}
          {services.length > 0 && (
            <div className="bg-green-50 rounded-xl p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Services Offered</h2>
              <div className="flex flex-wrap gap-2">
                {services.map((service: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-4 py-2 bg-white text-green-700 text-sm font-semibold rounded-full border border-green-200"
                  >
                    {service}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Working Hours */}
          {Object.keys(workingHours).length > 0 && (
            <div className="bg-purple-50 rounded-xl p-6">
              <div className="flex items-center space-x-2 mb-4">
                <ClockIcon className="h-6 w-6 text-purple-600" />
                <h2 className="text-2xl font-bold text-gray-900">Working Hours</h2>
              </div>
              <div className="space-y-2">
                {Object.entries(workingHours).map(([day, hours]) => (
                  <div key={day} className="flex justify-between items-center">
                    <span className="text-gray-900 font-medium capitalize">{day}</span>
                    <span className="text-gray-700">{hours as string}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
