import Head from 'next/head'

interface SEOProps {
  title?: string
  description?: string
  robots?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  ogUrl?: string
  ogType?: string
  twitterCard?: string
  twitterTitle?: string
  twitterDescription?: string
  twitterImage?: string
  canonical?: string
  preloadUrls?: string[]
  prefetchUrls?: string[]
  schema?: object
}

export default function SEOHead({
  title = "Pediatric Dentist in Queens, NY - Find Top Child Dentists",
  description = "Find the best pediatric dentists in Queens, NY. Comprehensive directory, reviews, and dental care information for children.",
  robots = "index, follow",
  ogTitle,
  ogDescription,
  ogImage = "/images/default-og.jpg",
  ogUrl,
  ogType = "website",
  twitterCard = "summary_large_image",
  twitterTitle,
  twitterDescription,
  twitterImage,
  canonical,
  preloadUrls = [],
  prefetchUrls = [],
  schema
}: SEOProps) {
  const fullTitle = title.includes('|') ? title : `${title} | Pediatric Dentist Queens NY`
  const currentUrl = typeof window !== 'undefined' ? window.location.href : ''

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robots} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />

      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={ogTitle || fullTitle} />
      <meta property="og:description" content={ogDescription || description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={ogUrl || canonical || currentUrl} />
      <meta property="og:type" content={ogType} />

      {/* Twitter Meta Tags */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={twitterTitle || ogTitle || fullTitle} />
      <meta name="twitter:description" content={twitterDescription || ogDescription || description} />
      <meta name="twitter:image" content={twitterImage || ogImage} />

      {/* Canonical URL */}
      <link rel="canonical" href={canonical || currentUrl} />

      {/* Preload Resources */}
      {preloadUrls.map((url, index) => (
        <link key={index} rel="preload" href={url} as="image" />
      ))}

      {/* Prefetch Resources */}
      {prefetchUrls.map((url, index) => (
        <link key={index} rel="prefetch" href={url} />
      ))}

      {/* Structured Data */}
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      )}
    </Head>
  )
}