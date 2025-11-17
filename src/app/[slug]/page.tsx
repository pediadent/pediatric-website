import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { PhoneIcon, GlobeAltIcon, MapPinIcon } from '@heroicons/react/24/solid'
import { Metadata } from 'next'
import Link from 'next/link'
import {
  ReviewContent,
  buildReviewMetadata,
  getReview as getPublishedReview
} from '@/app/reviews/[slug]/page'
import {
  ArticlePageContent,
  buildArticleMetadata,
  getArticle
} from '@/app/blog/[slug]/page'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const review = await getPublishedReview(slug)
  if (review) {
    return buildReviewMetadata(review)
  }

  const article = await getArticle(slug)
  if (article) {
    return buildArticleMetadata(article)
  }

  const dentist = await prisma.dentistDirectory.findUnique({
    where: { slug }
  })

  if (!dentist) {
    return {
      title: 'Content Not Found'
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const imageUrl = dentist.image ? `${baseUrl}${dentist.image}` : `${baseUrl}/og-default.jpg`

  return {
    title: dentist.seoTitle || `${dentist.name} - Pediatric Dentist in Queens NY`,
    description: dentist.seoDescription || dentist.description || `Find information about ${dentist.name}, a trusted pediatric dentist in Queens, NY.`,
    robots: {
      index: !dentist.isNoIndex,
      follow: !dentist.isNoFollow,
    },
    openGraph: {
      title: dentist.seoTitle || `${dentist.name} - Pediatric Dentist in Queens NY`,
      description: dentist.seoDescription || dentist.description || `Find information about ${dentist.name}, a trusted pediatric dentist in Queens, NY.`,
      url: `${baseUrl}/${dentist.slug}`,
      siteName: 'Pediatric Dentist Directory',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: dentist.name,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: dentist.seoTitle || `${dentist.name} - Pediatric Dentist in Queens NY`,
      description: dentist.seoDescription || dentist.description || `Find information about ${dentist.name}, a trusted pediatric dentist in Queens, NY.`,
      images: [imageUrl],
    },
  }
}

export default async function DentistPage({ params }: PageProps) {
  const { slug } = await params
  const review = await getPublishedReview(slug)

  if (review) {
    return <ReviewContent review={review} />
  }

  const article = await getArticle(slug)

  if (article) {
    return <ArticlePageContent article={article} />
  }

  const dentist = await prisma.dentistDirectory.findUnique({
    where: { slug }
  })

  if (!dentist || !dentist.isActive) {
    notFound()
  }

  const workingHours = dentist.workingHours ? JSON.parse(dentist.workingHours) : {}
  const gallery = dentist.gallery ? JSON.parse(dentist.gallery) : []

  // Get recent dentists for sidebar
  const recentDentists = await prisma.dentistDirectory.findMany({
    where: {
      isActive: true,
      NOT: { slug: dentist.slug }
    },
    take: 10,
    orderBy: { createdAt: 'desc' },
    select: {
      name: true,
      slug: true,
      address: true
    }
  })

  return (
    <>
      {dentist.schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: dentist.schema }}
        />
      )}

      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-16 overflow-hidden">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse delay-700"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              {/* Logo - Creative Floating Badge */}
              {dentist.logo && (
                <div className="order-first lg:order-last">
                  <div className="relative group">
                    {/* Glowing Background */}
                    <div className="absolute -inset-4 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 rounded-3xl blur-2xl opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>

                    {/* Logo Container */}
                    <div className="relative bg-white rounded-3xl p-6 shadow-2xl transform group-hover:scale-110 transition-transform duration-300">
                      <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <img
                        src={dentist.logo}
                        alt={`${dentist.name} logo`}
                        className="h-28 lg:h-32 w-auto object-contain"
                      />
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-center gap-2 text-gray-600">
                          <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm font-bold">Verified Clinic</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Title and Rating */}
              <div className="flex-1 text-center lg:text-left">
                <div className="inline-block mb-4">
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-semibold">
                    <svg className="w-5 h-5 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span>Top Rated Pediatric Dentist</span>
                  </div>
                </div>

                <h1 className="text-4xl lg:text-6xl font-black mb-4 leading-tight">
                  {dentist.name}
                </h1>

                {dentist.rating && (
                  <div className="flex items-center gap-2 text-center lg:text-left justify-center lg:justify-start">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-6 h-6 ${
                            i < Math.floor(dentist.rating!)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300 fill-current'
                          }`}
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-xl font-bold text-white">{dentist.rating.toFixed(1)}</span>
                    {dentist.reviewCount && (
                      <span className="text-white/80 text-sm">({dentist.reviewCount})</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <div className="flex-1 space-y-8">

              {/* About Section */}
              {dentist.about && (
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                  <div className="mb-6">
                    <div className="flex flex-col lg:flex-row items-center lg:items-start gap-3 lg:gap-4 text-center lg:text-left">
                      <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h2 className="text-[26px] lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">About Dentistry</h2>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-lg">{dentist.about}</p>
                </div>
              )}


              {/* Get In Touch - Call, Website Buttons */}
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl shadow-xl p-8 border border-cyan-100">
                <div className="mb-8">
                  <div className="flex flex-col lg:flex-row items-center lg:items-start gap-3 lg:gap-4 text-center lg:text-left">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <h2 className="text-[26px] lg:text-3xl font-bold text-gray-900">Get In Touch with Dentistry</h2>
                  </div>
                </div>
                <div className="flex flex-wrap gap-6">
                  {dentist.phone && (
                    <a
                      href={`tel:${dentist.phone}`}
                      className="group flex-1 min-w-[200px]"
                    >
                      <div className="bg-white hover:bg-gradient-to-br hover:from-cyan-500 hover:to-blue-600 border-2 border-cyan-200 hover:border-transparent rounded-2xl p-6 transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 group-hover:bg-white rounded-xl flex items-center justify-center transition-all">
                            <PhoneIcon className="h-8 w-8 text-white group-hover:text-cyan-600 transition-all" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-500 group-hover:text-white transition-all">Call Us</p>
                            <p className="text-lg font-bold text-gray-900 group-hover:text-white transition-all">{dentist.phone}</p>
                          </div>
                        </div>
                      </div>
                    </a>
                  )}

                  {dentist.website && (
                    <a
                      href={dentist.website.startsWith('http') ? dentist.website : `https://${dentist.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex-1 min-w-[200px]"
                    >
                      <div className="bg-white hover:bg-gradient-to-br hover:from-blue-500 hover:to-purple-600 border-2 border-blue-200 hover:border-transparent rounded-2xl p-6 transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 group-hover:bg-white rounded-xl flex items-center justify-center transition-all">
                            <GlobeAltIcon className="h-8 w-8 text-white group-hover:text-blue-600 transition-all" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-500 group-hover:text-white transition-all">Visit Website</p>
                            <p className="text-lg font-bold text-gray-900 group-hover:text-white transition-all truncate">Website</p>
                          </div>
                        </div>
                      </div>
                    </a>
                  )}
                </div>
              </div>

              {/* Contact Details */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="mb-8">
                  <div className="flex flex-col lg:flex-row items-center lg:items-start gap-3 lg:gap-4 text-center lg:text-left">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h2 className="text-[26px] lg:text-3xl font-bold text-gray-900">Dentistry Contact Details</h2>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Address */}
                  {dentist.address && (
                    <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border border-orange-100">
                      <div className="flex items-start gap-4">
                        <MapPinIcon className="h-7 w-7 text-orange-600 flex-shrink-0 mt-1" />
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-3">Address</h3>
                          <p className="text-gray-700 leading-relaxed">{dentist.address}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Email */}
                  {dentist.email && (
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100">
                      <div className="flex items-start gap-4">
                        <svg className="h-7 w-7 text-blue-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-3">Email</h3>
                          <a
                            href={`mailto:${dentist.email}`}
                            className="text-gray-700 hover:text-blue-600 transition-colors leading-relaxed"
                          >
                            {dentist.email}
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Timings */}
                  {Object.keys(workingHours).length > 0 && (
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                      <div className="flex items-start gap-4">
                        <svg className="h-7 w-7 text-green-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-gray-900 mb-3">Timings</h3>
                          {workingHours.info ? (
                            <p className="text-gray-700">{workingHours.info}</p>
                          ) : (
                            <div className="space-y-1.5 text-sm">
                              {Object.entries(workingHours).map(([day, hours]) => (
                                <div key={day} className="flex gap-2">
                                  <span className="font-bold text-gray-900 capitalize min-w-[90px]">{day}:</span>
                                  <span className="text-green-700 font-semibold">{hours as string}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Directions Map */}
              {(dentist.embeddedMap || dentist.address) && (
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                  <div className="mb-6">
                    <div className="flex flex-col lg:flex-row items-center lg:items-start gap-3 lg:gap-4 text-center lg:text-left">
                      <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                      </div>
                      <h2 className="text-[26px] lg:text-3xl font-bold text-gray-900">Location of Dentistry</h2>
                    </div>
                  </div>
                  <div className="relative w-full h-[450px] bg-gray-100 rounded-2xl overflow-hidden shadow-inner mb-6">
                    {dentist.embeddedMap ? (
                      <div dangerouslySetInnerHTML={{ __html: dentist.embeddedMap }} className="w-full h-full" />
                    ) : (
                      <iframe
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(dentist.address || '')}&output=embed`}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    )}
                  </div>
                  {dentist.directionsUrl && (
                    <a
                      href={dentist.directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-2xl hover:scale-105 mx-auto lg:mx-0"
                    >
                      <MapPinIcon className="h-6 w-6" />
                      Get Directions
                    </a>
                  )}
                </div>
              )}

              {/* Services */}
              {dentist.services && (
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                  <div className="mb-6">
                    <div className="flex flex-col lg:flex-row items-center lg:items-start gap-3 lg:gap-4 text-center lg:text-left">
                      <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                      </div>
                      <h2 className="text-[26px] lg:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Services Offered</h2>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-line">{dentist.services}</p>
                </div>
              )}

              {/* Dental Insurances */}
              {dentist.insurances && (
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                  <div className="mb-6">
                    <div className="flex flex-col lg:flex-row items-center lg:items-start gap-3 lg:gap-4 text-center lg:text-left">
                      <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <h2 className="text-[26px] lg:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Insurance Plans Accepted at Dentistry</h2>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-line">{dentist.insurances}</p>
                </div>
              )}

              {/* Gallery */}
              {gallery.length > 0 && (
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                  <div className="mb-6">
                    <div className="flex flex-col lg:flex-row items-center lg:items-start gap-3 lg:gap-4 text-center lg:text-left">
                      <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h2 className="text-[26px] lg:text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">Gallery</h2>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {gallery.map((imageUrl: string, idx: number) => (
                      <div key={idx} className="relative h-48 rounded-xl overflow-hidden border-2 border-gray-200 shadow-md hover:shadow-2xl hover:scale-105 transition-all">
                        <img
                          src={imageUrl}
                          alt={`${dentist.name} gallery ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Sidebar */}
            <aside className="lg:w-96 space-y-6">
              {/* Quick Contact Card */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 sticky top-24 z-10">
                <div className="flex items-center gap-3 mb-6 justify-center lg:justify-start">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Quick Contact</h3>
                </div>
                <div className="space-y-4">
                  {dentist.phone && (
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
                      <p className="text-xs font-bold text-gray-500 uppercase mb-2">Phone Number</p>
                      <a href={`tel:${dentist.phone}`} className="text-lg font-bold text-blue-600 hover:text-blue-700 transition-colors">
                        {dentist.phone}
                      </a>
                    </div>
                  )}
                  {dentist.website && (
                    <a
                      href={dentist.website.startsWith('http') ? dentist.website : `https://${dentist.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-3 w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-2xl hover:scale-105"
                    >
                      <GlobeAltIcon className="h-6 w-6" />
                      Visit Website
                    </a>
                  )}
                  {dentist.gmapLink && (
                    <a
                      href={dentist.gmapLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-3 w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-2xl hover:scale-105"
                    >
                      <MapPinIcon className="h-6 w-6" />
                      Google Maps
                    </a>
                  )}
                </div>
              </div>

              {/* More Dentists */}
              {recentDentists.length > 0 && (
                <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                  <div className="flex items-center gap-3 mb-6 justify-center lg:justify-start">
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">More Dentists</h3>
                  </div>
                  <div className="space-y-3">
                    {recentDentists.slice(0, 5).map((d) => (
                      <Link
                        key={d.slug}
                        href={`/${d.slug}`}
                        className="group block p-4 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-violet-50 hover:to-purple-50 rounded-xl border border-gray-200 hover:border-violet-300 transition-all hover:shadow-md"
                      >
                        <h4 className="text-sm font-bold text-gray-900 group-hover:text-violet-700 mb-2 line-clamp-1 transition-colors">
                          {d.name}
                        </h4>
                        {d.address && (
                          <p className="text-xs text-gray-600 group-hover:text-violet-600 line-clamp-1 transition-colors">{d.address}</p>
                        )}
                      </Link>
                    ))}
                  </div>
                  <Link
                    href="/"
                    className="block mt-6 text-center py-3 px-6 bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-2xl hover:scale-105"
                  >
                    View All Dentists →
                  </Link>
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>
    </>
  )
}
