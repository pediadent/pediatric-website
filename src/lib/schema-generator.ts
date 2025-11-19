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
  author: {
    name: string
    url?: string
    image?: string
  }
  datePublished: string
  dateModified: string
  image?: {
    url: string
    width?: number
    height?: number
    caption?: string
  }
  publisher?: {
    name: string
    logo?: string
  }
}): SchemaType => ({
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: data.title,
  description: data.description,
  url: data.url,
  author: {
    '@type': 'Person',
    name: data.author.name,
    url: data.author.url,
    image: data.author.image
  },
  datePublished: data.datePublished,
  dateModified: data.dateModified,
  image: data.image ? {
    '@type': 'ImageObject',
    url: data.image.url,
    width: data.image.width,
    height: data.image.height,
    caption: data.image.caption
  } : undefined,
  publisher: data.publisher ? {
    '@type': 'Organization',
    name: data.publisher.name,
    logo: data.publisher.logo ? {
      '@type': 'ImageObject',
      url: data.publisher.logo
    } : undefined
  } : {
    '@type': 'Organization',
    name: 'Pediatric Dentist Queens NY',
    logo: {
      '@type': 'ImageObject',
      url: 'https://pediatricdentistinqueensny.com/logo.png'
    }
  },
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': data.url
  }
})

export const generateReviewSchema = (data: {
  title: string
  description: string
  url: string
  author: {
    name: string
    url?: string
    image?: string
  }
  datePublished: string
  dateModified?: string
  itemName: string
  itemImage?: string
  rating?: number
  worstRating?: number
  bestRating?: number
  image?: {
    url: string
    width?: number
    height?: number
  }
}): SchemaType => ({
  '@context': 'https://schema.org',
  '@type': 'Review',
  name: data.title,
  description: data.description,
  url: data.url,
  author: {
    '@type': 'Person',
    name: data.author.name,
    url: data.author.url,
    image: data.author.image
  },
  datePublished: data.datePublished,
  dateModified: data.dateModified,
  itemReviewed: {
    '@type': 'Product',
    name: data.itemName,
    image: data.itemImage
  },
  reviewRating: data.rating ? {
    '@type': 'Rating',
    ratingValue: data.rating,
    worstRating: data.worstRating || 1,
    bestRating: data.bestRating || 5
  } : undefined,
  image: data.image ? {
    '@type': 'ImageObject',
    url: data.image.url,
    width: data.image.width,
    height: data.image.height
  } : undefined,
  publisher: {
    '@type': 'Organization',
    name: 'Pediatric Dentist Queens NY',
    logo: {
      '@type': 'ImageObject',
      url: 'https://pediatricdentistinqueensny.com/logo.png'
    }
  }
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
  },
  sameAs: [
    'https://www.facebook.com/pediatricdentistqueensny',
    'https://twitter.com/pediatricqueens',
    'https://www.instagram.com/pediatricdentistqueensny',
    'https://www.wikidata.org/wiki/Q123456789' // Replace with actual Wikidata ID when available
  ]
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

export const generateFAQSchema = (faqs: Array<{ question: string; answer: string }>): SchemaType => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(faq => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer
    }
  }))
})

export const generateImageObjectSchema = (data: {
  url: string
  caption?: string
  width?: number
  height?: number
  author?: string
}): SchemaType => ({
  '@context': 'https://schema.org',
  '@type': 'ImageObject',
  url: data.url,
  contentUrl: data.url,
  caption: data.caption,
  width: data.width,
  height: data.height,
  author: data.author ? {
    '@type': 'Person',
    name: data.author
  } : undefined
})

export const generatePersonSchema = (data: {
  name: string
  url?: string
  image?: string
  jobTitle?: string
  description?: string
  sameAs?: string[]
}): SchemaType => ({
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: data.name,
  url: data.url,
  image: data.image,
  jobTitle: data.jobTitle,
  description: data.description,
  sameAs: data.sameAs
})

export const generateWebPageSchema = (data: {
  title: string
  description: string
  url: string
  datePublished?: string
  dateModified?: string
  breadcrumbs?: Array<{ name: string; url: string }>
}): SchemaType => ({
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: data.title,
  description: data.description,
  url: data.url,
  datePublished: data.datePublished,
  dateModified: data.dateModified,
  breadcrumb: data.breadcrumbs ? {
    '@type': 'BreadcrumbList',
    itemListElement: data.breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  } : undefined,
  isPartOf: {
    '@type': 'WebSite',
    name: 'Pediatric Dentist Queens NY',
    url: 'https://pediatricdentistinqueensny.com'
  }
})

export const generateMedicalBusinessSchema = (data: {
  name: string
  description: string
  url: string
  address?: {
    street: string
    city: string
    state: string
    zip: string
    country?: string
  }
  phone?: string
  email?: string
  image?: string
  rating?: {
    value: number
    count: number
  }
  priceRange?: string
  openingHours?: string[]
  geo?: {
    latitude: number
    longitude: number
  }
}): SchemaType => ({
  '@context': 'https://schema.org',
  '@type': ['Dentist', 'MedicalBusiness', 'LocalBusiness'],
  name: data.name,
  description: data.description,
  url: data.url,
  image: data.image,
  telephone: data.phone,
  email: data.email,
  priceRange: data.priceRange || '$$',
  address: data.address ? {
    '@type': 'PostalAddress',
    streetAddress: data.address.street,
    addressLocality: data.address.city,
    addressRegion: data.address.state,
    postalCode: data.address.zip,
    addressCountry: data.address.country || 'US'
  } : undefined,
  geo: data.geo ? {
    '@type': 'GeoCoordinates',
    latitude: data.geo.latitude,
    longitude: data.geo.longitude
  } : undefined,
  aggregateRating: data.rating ? {
    '@type': 'AggregateRating',
    ratingValue: data.rating.value,
    reviewCount: data.rating.count,
    worstRating: 1,
    bestRating: 5
  } : undefined,
  openingHoursSpecification: data.openingHours?.map(hours => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: hours.split(':')[0],
    opens: hours.split(':')[1]?.split('-')[0]?.trim(),
    closes: hours.split(':')[1]?.split('-')[1]?.trim()
  })),
  medicalSpecialty: 'Pediatric Dentistry'
})