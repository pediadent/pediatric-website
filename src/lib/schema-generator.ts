// Schema generation utilities for different content types

export interface SchemaType {
  '@context': string
  '@type': string
  [key: string]: unknown
}

export const generateBlogPostSchema = (data: {
  title: string
  description: string
  url: string
  author: string
  datePublished: string
  dateModified: string
  image?: string
}): SchemaType => ({
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: data.title,
  description: data.description,
  url: data.url,
  author: {
    '@type': 'Person',
    name: data.author
  },
  datePublished: data.datePublished,
  dateModified: data.dateModified,
  image: data.image ? {
    '@type': 'ImageObject',
    url: data.image
  } : undefined
})

export const generateReviewSchema = (data: {
  title: string
  description: string
  url: string
  author: string
  datePublished: string
  itemName: string
  rating?: number
  worstRating?: number
  bestRating?: number
}): SchemaType => ({
  '@context': 'https://schema.org',
  '@type': 'Review',
  name: data.title,
  description: data.description,
  url: data.url,
  author: {
    '@type': 'Person',
    name: data.author
  },
  datePublished: data.datePublished,
  itemReviewed: {
    '@type': 'Thing',
    name: data.itemName
  },
  reviewRating: data.rating ? {
    '@type': 'Rating',
    ratingValue: data.rating,
    worstRating: data.worstRating || 1,
    bestRating: data.bestRating || 5
  } : undefined
})

export const generateDentistSchema = (data: {
  name: string
  description: string
  url: string
  address?: string
  phone?: string
  email?: string
  image?: string
  rating?: number
  priceRange?: string
}): SchemaType => ({
  '@context': 'https://schema.org',
  '@type': 'Dentist',
  name: data.name,
  description: data.description,
  url: data.url,
  address: data.address ? {
    '@type': 'PostalAddress',
    streetAddress: data.address
  } : undefined,
  telephone: data.phone,
  email: data.email,
  image: data.image,
  aggregateRating: data.rating ? {
    '@type': 'AggregateRating',
    ratingValue: data.rating,
    worstRating: 1,
    bestRating: 5
  } : undefined,
  priceRange: data.priceRange || '$$'
})

export const generateOrganizationSchema = (): SchemaType => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Pediatric Dentist Queens NY',
  url: 'https://pediatricdentistinqueensny.com',
  logo: 'https://pediatricdentistinqueensny.com/logo.png',
  description: 'Comprehensive directory and information about pediatric dentists in Queens, New York',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '80-12 165th St 5th Floor',
    addressLocality: 'Queens',
    addressRegion: 'NY',
    postalCode: '11432',
    addressCountry: 'US'
  },
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'pediatricdentistinqueensny@gmail.com',
    contactType: 'Customer Service'
  }
})

export const generateWebsiteSchema = (): SchemaType => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Pediatric Dentist Queens NY',
  url: 'https://pediatricdentistinqueensny.com',
  description: 'Find the best pediatric dentists in Queens, NY with reviews, directory, and dental care information',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://pediatricdentistinqueensny.com/search?q={search_term_string}',
    'query-input': 'required name=search_term_string'
  }
})

export const generateBreadcrumbSchema = (items: Array<{ name: string; url: string }>): SchemaType => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url
  }))
})