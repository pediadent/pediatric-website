import { PrismaClient, ContentStatus, ContentType, Role, Category } from '@prisma/client'

const prisma = new PrismaClient()
const demoArticleSlug = 'comprehensive-guide-to-child-oral-health'
const demoArticlePublishedAt = new Date('2025-01-15T10:00:00.000Z')
const demoFeaturedImagePath = '/uploads/demo-article-hero.jpg'
const siteBaseUrl = 'https://pediatric-website.local'

async function main() {
  console.log('Start seeding...')

  const demoArticleContent = `
<h1>Pediatric Oral Health Milestones Your Family Should Know</h1>
<p>Understanding how your child's smile develops makes it easier to build habits that last a lifetime. This guide walks you through the key milestones from the first tooth to the teen years.</p>
<h2>Why Early Dental Visits Matter</h2>
<p>The American Academy of Pediatric Dentistry recommends scheduling the first dental visit by age one. These early appointments focus on:</p>
<ul>
  <li><strong>Monitoring tooth eruption:</strong> Tracking the order and timing of primary teeth.</li>
  <li><strong>Establishing preventive care:</strong> Learning brushing and fluoride routines tailored to each stage.</li>
  <li><strong>Reducing anxiety:</strong> Helping children feel comfortable in a dental setting.</li>
</ul>
<blockquote>
  <p>Daily habits form the foundation of lifelong oral health. Consistency beats perfection &ndash; especially for busy families.</p>
  <cite>&mdash; Dr. Amelia Rivera, DDS</cite>
</blockquote>
<h2>Milestone Timeline</h2>
<table>
  <thead>
    <tr>
      <th>Age Range</th>
      <th>Dental Focus</th>
      <th>At-Home Checklist</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>0 &ndash; 12 months</td>
      <td>Wipe gums, soothe teething discomfort</td>
      <td>Use a soft cloth after feedings and introduce a silicone brush</td>
    </tr>
    <tr>
      <td>1 &ndash; 3 years</td>
      <td>Brushing with training toothpaste</td>
      <td>Brush twice daily, schedule the first dental visit, limit sugary snacks</td>
    </tr>
    <tr>
      <td>4 &ndash; 7 years</td>
      <td>Mastering independent brushing</td>
      <td>Supervise technique, practice flossing, discuss sealants with your dentist</td>
    </tr>
    <tr>
      <td>8 &ndash; 12 years</td>
      <td>Tracking permanent teeth eruption</td>
      <td>Consider orthodontic evaluation, reinforce mouthguard use for sports</td>
    </tr>
  </tbody>
</table>
<h2>Home Care Essentials</h2>
<ol>
  <li>Use a pea-sized amount of fluoride toothpaste for children over age three.</li>
  <li>Replace toothbrushes every three months or after illness.</li>
  <li>Offer water between meals and reserve juice for mealtimes.</li>
  <li>Create a rewards chart to celebrate consistent brushing and flossing.</li>
</ol>
<p><strong>Downloadable resources:</strong> <a href="/downloads/child-brushing-chart.pdf">Parent brushing chart</a> and <a href="/downloads/first-dental-visit-checklist.pdf">first visit checklist</a>.</p>
`

  const demoArticleExcerpt =
    'A parent-friendly roadmap covering every oral health milestone from infancy through the teenage years, including prevention tips and visit checklists.'

  const demoUserPasswordHash = '$2b$10$s.1belmY6owJZDPoy4GueO4SLi2srj0z/7d3aO.sQJIfOiWBouD5K'

  const demoUser = await prisma.user.upsert({
    where: { email: 'content.manager@pediatric-website.local' },
    update: {
      name: 'Avery Collins',
      role: Role.ADMIN,
      password: demoUserPasswordHash
    },
    create: {
      name: 'Avery Collins',
      email: 'content.manager@pediatric-website.local',
      role: Role.ADMIN,
      password: demoUserPasswordHash
    }
  })

  const demoAuthorSchema = JSON.stringify(
    {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Dr. Amelia Rivera, DDS',
      jobTitle: 'Pediatric Dentist',
      url: `${siteBaseUrl}/authors/amelia-rivera-dds`,
      image: `${siteBaseUrl}/uploads/authors/amelia-rivera.jpg`,
      sameAs: [
        'https://www.linkedin.com/in/amelia-rivera-dds',
        'https://www.aapd.org/find-dentist/amelia-rivera'
      ]
    },
    null,
    2
  )

  const demoAuthor = await prisma.author.upsert({
    where: { slug: 'amelia-rivera-dds' },
    update: {
      name: 'Dr. Amelia Rivera, DDS',
      bio: 'Board-certified pediatric dentist providing evidence-based oral health guidance for families.',
      email: 'amelia.rivera@pediatric-website.local',
      website: `${siteBaseUrl}/experts/amelia-rivera`,
      avatar: '/uploads/authors/amelia-rivera.jpg',
      seoTitle: 'Dr. Amelia Rivera, DDS - Pediatric Dental Expert',
      seoDescription:
        'Dr. Amelia Rivera, DDS shares pediatric dentistry expertise, covering prevention, treatment, and at-home care for children.',
      featuredImage: '/uploads/authors/amelia-rivera-banner.jpg',
      isNoIndex: false,
      isNoFollow: false,
      schema: demoAuthorSchema
    },
    create: {
      slug: 'amelia-rivera-dds',
      name: 'Dr. Amelia Rivera, DDS',
      bio: 'Board-certified pediatric dentist providing evidence-based oral health guidance for families.',
      email: 'amelia.rivera@pediatric-website.local',
      website: `${siteBaseUrl}/experts/amelia-rivera`,
      avatar: '/uploads/authors/amelia-rivera.jpg',
      seoTitle: 'Dr. Amelia Rivera, DDS - Pediatric Dental Expert',
      seoDescription:
        'Dr. Amelia Rivera, DDS shares pediatric dentistry expertise, covering prevention, treatment, and at-home care for children.',
      featuredImage: '/uploads/authors/amelia-rivera-banner.jpg',
      isNoIndex: false,
      isNoFollow: false,
      schema: demoAuthorSchema
    }
  })

  const demoReviewer = await prisma.reviewer.upsert({
    where: { slug: 'amelia-rivera-dds' },
    update: {
      name: 'Dr. Amelia Rivera, DDS',
      title: 'Pediatric Dentist & Clinical Reviewer',
      credentials: 'Board-Certified Pediatric Dentist',
      bio: 'Clinical reviewer focused on evidence-based pediatric oral care recommendations.',
      description: 'Pediatric dental expert who verifies clinical accuracy for product reviews.',
      email: 'amelia.rivera@pediatric-website.local',
      website: `${siteBaseUrl}/reviewers/amelia-rivera`,
      avatar: '/uploads/authors/amelia-rivera.jpg',
      seoTitle: 'Dr. Amelia Rivera, DDS - Pediatric Dental Product Reviewer',
      seoDescription:
        'Dr. Amelia Rivera, DDS provides clinical reviews of pediatric dental products to help families choose safe and effective options.',
      featuredImage: '/uploads/authors/amelia-rivera-banner.jpg',
      isNoIndex: false,
      isNoFollow: false,
      schema: demoAuthorSchema
    },
    create: {
      slug: 'amelia-rivera-dds',
      name: 'Dr. Amelia Rivera, DDS',
      title: 'Pediatric Dentist & Clinical Reviewer',
      credentials: 'Board-Certified Pediatric Dentist',
      bio: 'Clinical reviewer focused on evidence-based pediatric oral care recommendations.',
      description: 'Pediatric dental expert who verifies clinical accuracy for product reviews.',
      email: 'amelia.rivera@pediatric-website.local',
      website: `${siteBaseUrl}/reviewers/amelia-rivera`,
      avatar: '/uploads/authors/amelia-rivera.jpg',
      seoTitle: 'Dr. Amelia Rivera, DDS - Pediatric Dental Product Reviewer',
      seoDescription:
        'Dr. Amelia Rivera, DDS provides clinical reviews of pediatric dental products to help families choose safe and effective options.',
      featuredImage: '/uploads/authors/amelia-rivera-banner.jpg',
      isNoIndex: false,
      isNoFollow: false,
      schema: demoAuthorSchema
    }
  })

  const secondaryReviewerSchema = JSON.stringify(
    {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Jordan Lee, RDH',
      jobTitle: 'Dental Hygienist & Product Reviewer',
      url: `${siteBaseUrl}/authors/jordan-lee-rdh`,
      image: `${siteBaseUrl}/uploads/authors/jordan-lee.jpg`,
      sameAs: [
        'https://www.linkedin.com/in/jordan-lee-rdh'
      ]
    },
    null,
    2
  )

  const secondaryReviewer = await prisma.reviewer.upsert({
    where: { slug: 'jordan-lee-rdh' },
    update: {
      name: 'Jordan Lee, RDH',
      title: 'Registered Dental Hygienist',
      credentials: 'Licensed RDH',
      bio: 'Registered dental hygienist who tests at-home oral care products and makes evidence-based recommendations for parents.',
      description: 'Dental hygienist reviewing everyday products for families.',
      email: 'jordan.lee@pediatric-website.local',
      website: `${siteBaseUrl}/reviewers/jordan-lee`,
      avatar: '/uploads/authors/jordan-lee.jpg',
      seoTitle: 'Jordan Lee, RDH - Pediatric Dental Product Reviewer',
      seoDescription: 'Jordan Lee, RDH evaluates pediatric dental products and shares practical insights for families.',
      featuredImage: '/uploads/authors/jordan-lee-banner.jpg',
      isNoIndex: false,
      isNoFollow: false,
      schema: secondaryReviewerSchema
    },
    create: {
      slug: 'jordan-lee-rdh',
      name: 'Jordan Lee, RDH',
      title: 'Registered Dental Hygienist',
      credentials: 'Licensed RDH',
      bio: 'Registered dental hygienist who tests at-home oral care products and makes evidence-based recommendations for parents.',
      description: 'Dental hygienist reviewing everyday products for families.',
      email: 'jordan.lee@pediatric-website.local',
      website: `${siteBaseUrl}/reviewers/jordan-lee`,
      avatar: '/uploads/authors/jordan-lee.jpg',
      seoTitle: 'Jordan Lee, RDH - Pediatric Dental Product Reviewer',
      seoDescription: 'Jordan Lee, RDH evaluates pediatric dental products and shares practical insights for families.',
      featuredImage: '/uploads/authors/jordan-lee-banner.jpg',
      isNoIndex: false,
      isNoFollow: false,
      schema: secondaryReviewerSchema
    }
  })

  const ensureCategory = async (name: string, slug: string, description?: string): Promise<Category> => {
    const schema = JSON.stringify(
      {
        '@context': 'https://schema.org',
        '@type': 'CategoryCode',
        name,
        url: `${siteBaseUrl}/categories/${slug}`,
        inCodeSet: {
          '@type': 'CategoryCodeSet',
          name: 'Pediatric Oral Health Topics'
        }
      },
      null,
      2
    )

    return prisma.category.upsert({
      where: { slug },
      update: {
        name,
        description: description || null,
        seoTitle: name,
        seoDescription: description || `Articles and guides related to ${name.toLowerCase()}.`,
        featuredImage: `/uploads/categories/${slug}.jpg`,
        isNoIndex: false,
        isNoFollow: false,
        schema
      },
      create: {
        slug,
        name,
        description: description || null,
        seoTitle: name,
        seoDescription: description || `Articles and guides related to ${name.toLowerCase()}.`,
        featuredImage: `/uploads/categories/${slug}.jpg`,
        isNoIndex: false,
        isNoFollow: false,
        schema
      }
    })
  }

  const categorySeeds = [
    { name: 'Accessories', slug: 'accessories', description: 'Helpful accessories and tools to support pediatric dental care.' },
    { name: 'Baby and Child Health', slug: 'baby-and-child-health', description: 'Wellness advice and oral health insights for babies and children.' },
    { name: 'Charts', slug: 'charts', description: 'Printable charts and visual aids for tracking dental health habits.' },
    { name: 'Salary', slug: 'salary', description: 'Guides and data on pediatric dentistry salaries and compensation.' },
    { name: 'Info', slug: 'info', description: 'General information hub covering pediatric dental topics.' },
    { name: 'News', slug: 'news', description: 'Latest updates and news in pediatric dentistry.' },
    { name: 'Oral Health Tips', slug: 'oral-health-tips', description: 'Practical oral health tips for parents and caregivers.' },
    { name: 'Preventive Pediatric Dentistry', slug: 'preventive-pediatric-dentistry', description: 'Evidence-based guides that help parents and caregivers build effective home care routines for kids.' }
  ]

  const categoryLookup: Record<string, Category> = {}
  for (const category of categorySeeds) {
    const record = await ensureCategory(category.name, category.slug, category.description)
    categoryLookup[category.slug] = record
  }

  const demoArticleSchema = JSON.stringify(
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Comprehensive Guide to Child Oral Health Milestones',
      description:
        'A stage-by-stage guide for parents to understand childhood oral health milestones, preventive tips, and dental visit checklists.',
      image: [`${siteBaseUrl}${demoFeaturedImagePath}`],
      author: {
        '@type': 'Person',
        name: demoAuthor.name,
        url: `${siteBaseUrl}/authors/${demoAuthor.slug}`
      },
      publisher: {
        '@type': 'Organization',
        name: 'Pediatric Dental Knowledge Hub',
        logo: {
          '@type': 'ImageObject',
          url: `${siteBaseUrl}/uploads/logo-horizontal.png`
        }
      },
      datePublished: demoArticlePublishedAt.toISOString(),
      dateModified: demoArticlePublishedAt.toISOString(),
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `${siteBaseUrl}/articles/${demoArticleSlug}`
      }
    },
    null,
    2
  )

  const demoArticleData = {
    title: 'Comprehensive Guide to Child Oral Health Milestones',
    content: demoArticleContent,
    excerpt: demoArticleExcerpt,
    featuredImage: demoFeaturedImagePath,
    status: ContentStatus.PUBLISHED,
    type: ContentType.BLOG,
    seoTitle: 'Child Oral Health Milestones & Pediatric Dental Checklist',
    seoDescription: 'Understand every pediatric oral health milestone with age-based tips, preventive strategies, and downloadable checklists.',
    isNoIndex: false,
    isNoFollow: false,
    schema: demoArticleSchema,
    publishedAt: demoArticlePublishedAt,
    authorId: demoAuthor.id,
    categoryId: (categoryLookup['oral-health-tips'] ?? categoryLookup['preventive-pediatric-dentistry']).id,
    userId: demoUser.id
  }

  const demoArticle = await prisma.article.upsert({
    where: { slug: demoArticleSlug },
    update: demoArticleData,
    create: {
      slug: demoArticleSlug,
      ...demoArticleData
    }
  })

  const nicwellPublishedAt = new Date('2025-07-18T17:39:24.000Z')
  const nicwellExcerpt =
    'Oral hygiene is a crucial aspect of overall health, and the Nicwell Water Flosser offers four cleaning modes, travel-ready design, and long-lasting battery performance.'
  const nicwellReviewPros = [
    'Deep cleaning and gum health promotion',
    'Multiple flossing modes for personalized care',
    'Compact and portable for easy travel',
    'Long-lasting battery life',
    'IPX7 waterproof rating for versatile use'
  ].map((text) => ({ text }))

  const nicwellReviewCons = [
    'The package does not include a charging adapter'
  ].map((text) => ({ text }))

  const nicwellAffiliateLinks = [
    {
      title: 'Nicwell Water Flosser',
      url: 'https://amzn.to/3TLive7',
      price: 'Check price'
    }
  ]

  const nicwellReviewFaqs = [
    {
      question: 'How does the Nicwell Water Flosser benefit individuals with braces or dental bridges?',
      answer:
        'The Nicwell Water Flosser is particularly beneficial for people with braces or dental bridges as its high-pressure water pulses effectively clean around and beneath orthodontic appliances.\nThis helps remove trapped food particles and reduce plaque buildup, which are common challenges for those with braces or bridges.'
    },
    {
      question: 'Can the Nicwell Water Flosser be used with mouthwash instead of water?',
      answer:
        'Yes, you can use mouthwash in the Nicwell Water Flosser, but diluting it with water is recommended.\nAvoid using mouthwashes containing alcohol, as they may damage the device. This combination enhances the cleansing effect and leaves a fresh feeling in your mouth.'
    },
    {
      question: 'Is the Nicwell Water Flosser suitable for people with sensitive teeth?',
      answer:
        'Absolutely. The Nicwell Water Flosser includes a Soft mode specifically designed for sensitive teeth.\nThis mode operates at a gentler pulse rate, ensuring effective cleaning without causing discomfort or pain to sensitive teeth and gums.'
    },
    {
      question: 'What maintenance does the Nicwell Water Flosser require for optimal performance and hygiene?',
      answer:
        'To maintain the Nicwell Water Flosser, cleaning the reservoir and the nozzle regularly is important.\nAfter each use, empty the water reservoir and let it air dry.\nClean the nozzle with warm water and occasionally soak in vinegar to prevent mineral buildup.\nAlso, replacing the nozzle every 3-6 months is advisable for hygiene purposes.'
    },
    {
      question: 'How does the Nicwell Water Flosser compare to traditional string flossing in terms of effectiveness?',
      answer:
        'The Nicwell Water Flosser is often more effective than traditional string flossing, especially in cleaning hard-to-reach areas in the mouth.\nIt\'s particularly beneficial for people with braces, dental implants, or those who find string flossing challenging.\nWhile it doesn\'t completely replace traditional flossing, it\'s an excellent complement to enhance oral hygiene.'
    }
  ]

  const nicwellReviewContent = `
<p>Oral hygiene is a crucial aspect of overall health, and the Nicwell Water Flosser emerges as a game-changer in this domain.</p>
<p>This article delves into the features, benefits, and practicality of the <strong>Nicwell Water Flosser</strong>, offering insights into how it can transform your dental care routine.</p>


<h2 class="wp-block-heading">Four Flossing Modes for Customized Dental Care</h2>
<p>The Nicwell Water Flosser is not just another dental device; it's a versatile tool with four distinct modes catering to various oral care needs.</p>
<p>The Clean mode, operating at 1800 pulses per minute, effectively dislodges small particles between teeth.</p>
<p>For those with sensitive teeth, the Soft mode offers a gentler clean at 1400 pulses per minute.</p>
<p>The Massage mode, oscillating between 1400 and 1800 pulses per minute, is a boon for gum health, stimulating and massaging the gums to improve circulation and overall gum health.</p>
<p>These modes provide customized cleaning and ensure that every user, regardless of their dental sensitivity or condition, finds a comfortable and effective setting.</p>


<h2 class="wp-block-heading">Design and Portability: Perfect for On-the-Go</h2>
<p>Portability is key in today's fast-paced world, and the Nicwell Water Flosser doesn't disappoint.</p>
<p>It's designed for convenience and portability, making it an ideal travel companion.</p>
<p>The cordless and lightweight design and compact size ensure it can easily fit into your travel bag.</p>
<p>Plus, five interchangeable jet tips are suitable for the whole family, addressing everyone's unique dental needs even while moving.</p>
<h2 class="wp-block-heading">Emphasizing Quality and Durability</h2>
<p>Nicwell's commitment to quality is evident in this water flosser. Manufactured under strict standards, it's a symbol of durability and reliability.</p>
<p>Rigorous testing ensures optimal performance and longevity, making it a worthwhile investment for dental health.</p>
<p>The double-sealing rings further enhance its appeal, preventing water leakage and ensuring it's shower-safe.</p>

<h2 class="wp-block-heading">Efficient Dental Cleaning for All</h2>
<p>The high-pressure water pulses of the Nicwell Water Flosser make it an effective tool for deep cleaning.</p>
<p>It's particularly beneficial for individuals with braces, bridges, or sensitive teeth, removing hidden debris and reducing the risk of dental problems like decay, gum disease, and bad breath.</p>
<p>Its efficacy in cleaning hard-to-reach areas makes it a vital addition to any oral care routine.</p>
<h2 class="wp-block-heading">Long-Lasting Battery Life and Waterproof Design</h2>
<p>One of the most significant advantages of the Nicwell Water Flosser is its powerful battery life.</p>
<p>A full 4-hour charge delivers about 21 days of use, reducing the hassle of frequent recharging.</p>
<p>The IPX7 waterproof rating is a testament to its durability, allowing safe usage in the shower and easy cleaning.</p>
<h2 class="wp-block-heading">Detailed Product Specifications</h2>
<ul class="wp-block-list">
  <li>Water Pressure: 30-110 PSI</li>
  <li>Pulsation Rate: 1400-1800 times/minute</li>
  <li>Battery Life: Approximately 21 days on a 4-hour charge</li>
  <li>Waterproof Rating: IPX7</li>
  <li>Charging: USB Cable (adapter not included)</li>
  <li>Accessories: 5 interchangeable jet tips</li>
</ul>
<h2 class="wp-block-heading">Pros and Cons of Nicwell Water Flosser</h2>
<h3 class="wp-block-heading">Pros:</h3>
<ul class="wp-block-list">
  <li>Deep cleaning and gum health promotion</li>
  <li>Multiple flossing modes for personalized care</li>
  <li>Compact and portable for easy travel</li>
  <li>Long-lasting battery life</li>
  <li>IPX7 waterproof rating for versatile use</li>
</ul>
<h3 class="wp-block-heading">Cons:</h3>
<ul class="wp-block-list">
  <li>The package does not include a charging adapter</li>
</ul>
<h2 class="wp-block-heading">Conclusion</h2>
<p>The Nicwell Water Flosser is an exemplary product in the realm of dental hygiene, offering a blend of efficiency, convenience, and affordability.</p>
<p>Whether you are an individual with sensitive teeth, someone with orthodontic appliances, or just looking for a thorough clean, this flosser caters to all.</p>
<p>Its portability makes it ideal for travelers, ensuring your oral care routine doesn't take a backseat.</p>
<p>Investing in the Nicwell Water Flosser is not just about buying a product; it's about committing to better oral health and hygiene.</p>

`

  const nicwellReviewerIds = [demoReviewer.id, secondaryReviewer.id]
  const nicwellReviewerNames = [demoReviewer.name, secondaryReviewer.name]
  const nicwellReviewSchema = JSON.stringify(
    {
      '@context': 'https://schema.org',
      '@type': 'Review',
      name: 'Nicwell Water Flosser Review',
      description: nicwellExcerpt,
      reviewBody: nicwellExcerpt,
      itemReviewed: {
        '@type': 'Product',
        name: 'Nicwell Water Flosser Cordless Oral Irrigator'
      },
      author:
        nicwellReviewerNames.length === 1
          ? { '@type': 'Person', name: nicwellReviewerNames[0] }
          : nicwellReviewerNames.map((name) => ({
              '@type': 'Person',
              name
            })),
      reviewRating: {
        '@type': 'Rating',
        ratingValue: 4.6,
        bestRating: 5
      },
      datePublished: nicwellPublishedAt.toISOString()
    },
    null,
    2
  )

  await prisma.review.upsert({
    where: { slug: 'nicwell-water-flosser' },
    update: {
      title: 'Nicwell Water Flosser Review: Cordless Convenience for Busy Families',
      content: nicwellReviewContent,
      excerpt: nicwellExcerpt,
      featuredImage: '/uploads/reviews/nicwell-water-flosser.jpg',
      rating: 4.6,
      pros: JSON.stringify(nicwellReviewPros),
      cons: JSON.stringify(nicwellReviewCons),
      affiliateLinks: JSON.stringify(nicwellAffiliateLinks),
      faqs: JSON.stringify(nicwellReviewFaqs),
      status: ContentStatus.PUBLISHED,
      seoTitle: 'Nicwell Water Flosser Review for Kids and Parents',
      seoDescription: 'Hands-on Nicwell Water Flosser review covering battery life, pressure modes, pros, cons, and whether it fits into a family oral care routine.',
      isNoIndex: false,
      isNoFollow: false,
      schema: nicwellReviewSchema,
      publishedAt: nicwellPublishedAt,
      categoryId: (categoryLookup['accessories'] ?? categoryLookup['oral-health-tips']).id,
      authorId: demoAuthor.id,
      primaryReviewerId: nicwellReviewerIds[0],
      reviewers: {
        deleteMany: {},
        create: nicwellReviewerIds.map((reviewerId) => ({ reviewerId }))
      }
    },
    create: {
      slug: 'nicwell-water-flosser',
      title: 'Nicwell Water Flosser Review: Cordless Convenience for Busy Families',
      content: nicwellReviewContent,
      excerpt: nicwellExcerpt,
      featuredImage: '/uploads/reviews/nicwell-water-flosser.jpg',
      rating: 4.6,
      pros: JSON.stringify(nicwellReviewPros),
      cons: JSON.stringify(nicwellReviewCons),
      affiliateLinks: JSON.stringify(nicwellAffiliateLinks),
      faqs: JSON.stringify(nicwellReviewFaqs),
      status: ContentStatus.PUBLISHED,
      seoTitle: 'Nicwell Water Flosser Review for Kids and Parents',
      seoDescription: 'Hands-on Nicwell Water Flosser review covering battery life, pressure modes, pros, cons, and whether it fits into a family oral care routine.',
      isNoIndex: false,
      isNoFollow: false,
      schema: nicwellReviewSchema,
      publishedAt: nicwellPublishedAt,
      categoryId: (categoryLookup['accessories'] ?? categoryLookup['oral-health-tips']).id,
      authorId: demoAuthor.id,
      primaryReviewerId: nicwellReviewerIds[0],
      userId: demoUser.id,
      reviewers: {
        create: nicwellReviewerIds.map((reviewerId) => ({ reviewerId }))
      }
    }
  })
  console.log(`Seeded demo article: ${demoArticle.title}`)

  // Clear existing data
  await prisma.dentistDirectory.deleteMany({})

  // Seed Dentist Directory - Actual dentists from live website
  const dentists = [
    {
      name: 'Jeffrey Katz, D.D.S.',
      slug: 'jeffrey-katz-dds',
      description: 'Prepared to answer all questions pertaining to your dental health and appearance. Experienced pediatric dentist providing comprehensive care.',
      address: 'Queens, NY',
      phone: null,
      website: null,
      email: null,
      rating: 4.8,
      services: JSON.stringify([
        'Oral hygiene',
        'Dental health consultations',
        'Preventive care',
        'Children\'s dentistry'
      ]),
      workingHours: JSON.stringify({
        monday: '9:00 AM – 6:00 PM',
        tuesday: '9:00 AM – 6:00 PM',
        wednesday: '9:00 AM – 6:00 PM',
        thursday: '9:00 AM – 6:00 PM',
        friday: '9:00 AM – 5:00 PM',
        saturday: 'By appointment',
        sunday: 'Closed'
      }),
      isActive: true
    },
    {
      name: 'Preferred Dental Care',
      slug: 'preferred-dental-care',
      description: 'Will do everything possible to exceed your expectations. Comprehensive dental care with a focus on patient satisfaction.',
      address: 'Queens, NY',
      phone: null,
      website: null,
      email: null,
      rating: 4.7,
      services: JSON.stringify([
        'Regular exams',
        'Dental cleanings',
        'Teeth whitening',
        'Cosmetic dentistry',
        'Pediatric care'
      ]),
      workingHours: JSON.stringify({
        monday: '9:00 AM – 6:00 PM',
        tuesday: '9:00 AM – 6:00 PM',
        wednesday: '9:00 AM – 6:00 PM',
        thursday: '9:00 AM – 6:00 PM',
        friday: '9:00 AM – 5:00 PM',
        saturday: 'Closed',
        sunday: 'Closed'
      }),
      isActive: true
    },
    {
      name: 'Main Children\'s Dental',
      slug: 'main-childrens-dental',
      description: 'Dr. Dutta works hard to get the best possible treatment for your child\'s dental problems. Specialized care for children.',
      address: '13701 Northern Blvd, Queens, NY 11354',
      phone: '(718) 539-8762',
      website: null,
      email: null,
      rating: 4.9,
      services: JSON.stringify([
        'Children\'s dental care',
        'Preventive treatments',
        'Cavity treatment',
        'Dental exams',
        'Pediatric dentistry'
      ]),
      workingHours: JSON.stringify({
        monday: '9:00 AM – 7:00 PM',
        tuesday: '9:00 AM – 7:00 PM',
        wednesday: '9:00 AM – 7:00 PM',
        thursday: '9:00 AM – 7:00 PM',
        friday: '9:00 AM – 6:00 PM',
        saturday: '9:00 AM – 3:00 PM',
        sunday: 'Closed'
      }),
      isActive: true
    },
    {
      name: 'Kesner Family Dental',
      slug: 'kesner-family-dental',
      description: 'Highly trained and experienced dentist using state-of-the-art equipment. Family-friendly practice in Flushing.',
      address: 'Flushing, Queens, NY',
      phone: null,
      website: null,
      email: null,
      rating: 4.6,
      services: JSON.stringify([
        'Family dentistry',
        'Pediatric care',
        'Preventive services',
        'Dental technology',
        'Comprehensive exams'
      ]),
      workingHours: JSON.stringify({
        monday: '9:00 AM – 6:00 PM',
        tuesday: '9:00 AM – 6:00 PM',
        wednesday: '9:00 AM – 6:00 PM',
        thursday: '9:00 AM – 6:00 PM',
        friday: '9:00 AM – 5:00 PM',
        saturday: 'By appointment',
        sunday: 'Closed'
      }),
      isActive: true
    },
    {
      name: 'Pleasant Dental Care',
      slug: 'pleasant-dental-care',
      description: 'Welcomes you to experience the finest dental care. Located on Hillside Avenue in Jamaica Queens.',
      address: 'Hillside Avenue, Jamaica, Queens, NY',
      phone: null,
      website: null,
      email: null,
      rating: 4.5,
      services: JSON.stringify([
        'Dental care',
        'Pediatric services',
        'Preventive care',
        'Family dentistry'
      ]),
      workingHours: JSON.stringify({
        monday: '9:00 AM – 6:00 PM',
        tuesday: '9:00 AM – 6:00 PM',
        wednesday: '9:00 AM – 6:00 PM',
        thursday: '9:00 AM – 6:00 PM',
        friday: '9:00 AM – 5:00 PM',
        saturday: 'Closed',
        sunday: 'Closed'
      }),
      isActive: true
    },
    {
      name: 'Albee Dental Care',
      slug: 'albee-dental-care',
      description: 'Healthy and beautiful smiles are their number one priority. State-of-the-art facility with on-site professional staff.',
      address: 'Queens, NY',
      phone: null,
      website: null,
      email: null,
      rating: 4.7,
      services: JSON.stringify([
        'Preventive care',
        'Cosmetic dentistry',
        'Pediatric dentistry',
        'Family dental care',
        'Modern treatments'
      ]),
      workingHours: JSON.stringify({
        monday: '9:00 AM – 6:00 PM',
        tuesday: '9:00 AM – 6:00 PM',
        wednesday: '9:00 AM – 6:00 PM',
        thursday: '9:00 AM – 6:00 PM',
        friday: '9:00 AM – 5:00 PM',
        saturday: 'By appointment',
        sunday: 'Closed'
      }),
      isActive: true
    },
    {
      name: 'Little T Kids Dentistry',
      slug: 'little-t-kids-dentistry',
      description: 'Specialized dentistry for infants, children, teenagers, and special needs patients. Caring environment for all ages.',
      address: 'Queens, NY',
      phone: null,
      website: null,
      email: null,
      rating: 4.8,
      services: JSON.stringify([
        'Infant dentistry',
        'Children\'s dentistry',
        'Teen dental care',
        'Special needs dentistry',
        'Preventive care'
      ]),
      workingHours: JSON.stringify({
        monday: '9:00 AM – 6:00 PM',
        tuesday: '9:00 AM – 6:00 PM',
        wednesday: '9:00 AM – 6:00 PM',
        thursday: '9:00 AM – 6:00 PM',
        friday: '9:00 AM – 5:00 PM',
        saturday: 'By appointment',
        sunday: 'Closed'
      }),
      isActive: true
    },
    {
      name: 'Jamaica Estates Dentist',
      slug: 'jamaica-estates-dentist',
      description: 'Dr. Harold Biller serving Jamaica Estates, Fresh Meadows, Hollis & Oakland Gardens communities. Trusted family dentist.',
      address: 'Jamaica Estates, Queens, NY',
      phone: null,
      website: null,
      email: null,
      rating: 4.7,
      services: JSON.stringify([
        'Family dentistry',
        'Pediatric care',
        'Preventive services',
        'Community dental care'
      ]),
      workingHours: JSON.stringify({
        monday: '9:00 AM – 6:00 PM',
        tuesday: '9:00 AM – 6:00 PM',
        wednesday: '9:00 AM – 6:00 PM',
        thursday: '9:00 AM – 6:00 PM',
        friday: '9:00 AM – 5:00 PM',
        saturday: 'Closed',
        sunday: 'Closed'
      }),
      isActive: true
    },
    {
      name: 'Soma Pediatric Dentistry',
      slug: 'soma-pediatric-dentistry',
      description: 'Become a team for treating an individual\'s dental needs. Located within The Martinique building.',
      address: 'The Martinique, Queens, NY',
      phone: null,
      website: null,
      email: null,
      rating: 4.6,
      services: JSON.stringify([
        'Pediatric dentistry',
        'Team approach to care',
        'Preventive services',
        'Children\'s dental health'
      ]),
      workingHours: JSON.stringify({
        monday: '9:00 AM – 6:00 PM',
        tuesday: '9:00 AM – 6:00 PM',
        wednesday: '9:00 AM – 6:00 PM',
        thursday: '9:00 AM – 6:00 PM',
        friday: '9:00 AM – 5:00 PM',
        saturday: 'By appointment',
        sunday: 'Closed'
      }),
      isActive: true
    },
    {
      name: 'Astoria Smiles Pediatric Dentistry',
      slug: 'astoria-smiles-pediatric-dentistry',
      description: 'Committed to giving the best possible experience for children. Modern facility focused on pediatric dental care.',
      address: 'Astoria, Queens, NY',
      phone: null,
      website: null,
      email: null,
      rating: 4.9,
      services: JSON.stringify([
        'Pediatric dentistry',
        'Children\'s dental care',
        'Preventive treatments',
        'Modern dental technology',
        'Kid-friendly environment'
      ]),
      workingHours: JSON.stringify({
        monday: '9:00 AM – 6:00 PM',
        tuesday: '9:00 AM – 6:00 PM',
        wednesday: '9:00 AM – 6:00 PM',
        thursday: '9:00 AM – 6:00 PM',
        friday: '9:00 AM – 5:00 PM',
        saturday: '9:00 AM – 2:00 PM',
        sunday: 'Closed'
      }),
      isActive: true
    },
    {
      name: 'Boutique Dental - Pediatric Dental Associates of Glendale',
      slug: 'boutique-dental-glendale',
      description: 'Dr. Yelena Mullakandova provides warm and patient care in Glendale. Personalized pediatric dental services.',
      address: 'Glendale, Queens, NY',
      phone: null,
      website: null,
      email: null,
      rating: 4.7,
      services: JSON.stringify([
        'Pediatric dentistry',
        'Gentle care',
        'Preventive services',
        'Children\'s oral health'
      ]),
      workingHours: JSON.stringify({
        monday: '9:00 AM – 6:00 PM',
        tuesday: '9:00 AM – 6:00 PM',
        wednesday: '9:00 AM – 6:00 PM',
        thursday: '9:00 AM – 6:00 PM',
        friday: '9:00 AM – 5:00 PM',
        saturday: 'Closed',
        sunday: 'Closed'
      }),
      isActive: true
    },
    {
      name: 'Dental Specialties of NY',
      slug: 'dental-specialties-of-ny',
      description: 'Comprehensive dental specialties including oral and maxillofacial surgery, endodontics, and periodontics. Multi-specialty practice.',
      address: 'Queens, NY',
      phone: null,
      website: null,
      email: null,
      rating: 4.8,
      services: JSON.stringify([
        'Oral surgery',
        'Maxillofacial surgery',
        'Endodontics',
        'Periodontics',
        'Specialty pediatric care'
      ]),
      workingHours: JSON.stringify({
        monday: '9:00 AM – 6:00 PM',
        tuesday: '9:00 AM – 6:00 PM',
        wednesday: '9:00 AM – 6:00 PM',
        thursday: '9:00 AM – 6:00 PM',
        friday: '9:00 AM – 5:00 PM',
        saturday: 'By appointment',
        sunday: 'Closed'
      }),
      isActive: true
    },
    {
      name: 'Jackson Heights Pediatric Dental',
      slug: 'jackson-heights-pediatric-dental',
      description: 'Pediatric dental practice serving the Jackson Heights community. Dedicated to children\'s oral health.',
      address: 'Jackson Heights, Queens, NY',
      phone: null,
      website: null,
      email: null,
      rating: 4.6,
      services: JSON.stringify([
        'Pediatric dentistry',
        'Children\'s dental care',
        'Preventive services',
        'Community dental care'
      ]),
      workingHours: JSON.stringify({
        monday: '9:00 AM – 6:00 PM',
        tuesday: '9:00 AM – 6:00 PM',
        wednesday: '9:00 AM – 6:00 PM',
        thursday: '9:00 AM – 6:00 PM',
        friday: '9:00 AM – 5:00 PM',
        saturday: 'Closed',
        sunday: 'Closed'
      }),
      isActive: true
    },
    {
      name: 'Queens Children Dentist',
      slug: 'queens-children-dentist',
      description: 'Dedicated to providing quality dental care for children across Queens. Experienced pediatric dental team.',
      address: 'Queens, NY',
      phone: null,
      website: null,
      email: null,
      rating: 4.7,
      services: JSON.stringify([
        'Children\'s dentistry',
        'Pediatric dental care',
        'Preventive treatments',
        'Oral health education'
      ]),
      workingHours: JSON.stringify({
        monday: '9:00 AM – 6:00 PM',
        tuesday: '9:00 AM – 6:00 PM',
        wednesday: '9:00 AM – 6:00 PM',
        thursday: '9:00 AM – 6:00 PM',
        friday: '9:00 AM – 5:00 PM',
        saturday: 'By appointment',
        sunday: 'Closed'
      }),
      isActive: true
    },
    {
      name: 'Dental Smiles 4 Kids',
      slug: 'dental-smiles-4-kids',
      description: 'Creating happy, healthy smiles for children. Fun and friendly pediatric dental practice.',
      address: 'Queens, NY',
      phone: null,
      website: null,
      email: null,
      rating: 4.8,
      services: JSON.stringify([
        'Pediatric dentistry',
        'Preventive care',
        'Children\'s dental services',
        'Fun dental visits'
      ]),
      workingHours: JSON.stringify({
        monday: '9:00 AM – 6:00 PM',
        tuesday: '9:00 AM – 6:00 PM',
        wednesday: '9:00 AM – 6:00 PM',
        thursday: '9:00 AM – 6:00 PM',
        friday: '9:00 AM – 5:00 PM',
        saturday: '9:00 AM – 2:00 PM',
        sunday: 'Closed'
      }),
      isActive: true
    },
    {
      name: 'Pediatric Dentistry of Flushing',
      slug: 'pediatric-dentistry-of-flushing',
      description: 'Comprehensive pediatric dental care in Flushing. Serving families with quality children\'s dentistry.',
      address: 'Flushing, Queens, NY',
      phone: null,
      website: null,
      email: null,
      rating: 4.7,
      services: JSON.stringify([
        'Pediatric dentistry',
        'Preventive care',
        'Children\'s oral health',
        'Family-friendly practice'
      ]),
      workingHours: JSON.stringify({
        monday: '9:00 AM – 6:00 PM',
        tuesday: '9:00 AM – 6:00 PM',
        wednesday: '9:00 AM – 6:00 PM',
        thursday: '9:00 AM – 6:00 PM',
        friday: '9:00 AM – 5:00 PM',
        saturday: 'By appointment',
        sunday: 'Closed'
      }),
      isActive: true
    },
    {
      name: 'Kids Only Dental',
      slug: 'kids-only-dental',
      description: 'Exclusively focused on children\'s dental care. Specialized pediatric dental practice for kids of all ages.',
      address: 'Queens, NY',
      phone: null,
      website: null,
      email: null,
      rating: 4.8,
      services: JSON.stringify([
        'Pediatric dentistry',
        'Specialized children\'s care',
        'Preventive services',
        'Kid-friendly environment'
      ]),
      workingHours: JSON.stringify({
        monday: '9:00 AM – 6:00 PM',
        tuesday: '9:00 AM – 6:00 PM',
        wednesday: '9:00 AM – 6:00 PM',
        thursday: '9:00 AM – 6:00 PM',
        friday: '9:00 AM – 5:00 PM',
        saturday: '9:00 AM – 3:00 PM',
        sunday: 'Closed'
      }),
      isActive: true
    },
    {
      name: 'Kids Dental Studio Pediatric Dentistry and Orthodontics',
      slug: 'kids-dental-studio',
      description: 'Complete pediatric dental care and orthodontics for children. Modern studio setting with comprehensive services.',
      address: 'Queens, NY',
      phone: null,
      website: null,
      email: null,
      rating: 4.9,
      services: JSON.stringify([
        'Pediatric dentistry',
        'Children\'s orthodontics',
        'Preventive care',
        'Comprehensive dental services',
        'Modern dental studio'
      ]),
      workingHours: JSON.stringify({
        monday: '9:00 AM – 7:00 PM',
        tuesday: '9:00 AM – 7:00 PM',
        wednesday: '9:00 AM – 7:00 PM',
        thursday: '9:00 AM – 7:00 PM',
        friday: '9:00 AM – 6:00 PM',
        saturday: '9:00 AM – 4:00 PM',
        sunday: 'Closed'
      }),
      isActive: true
    }
  ]

  for (const dentist of dentists) {
    await prisma.dentistDirectory.create({
      data: dentist
    })
  }

  console.log(`Seeded ${dentists.length} dentists`)
  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })






