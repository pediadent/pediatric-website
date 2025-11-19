import { PrismaClient } from '@prisma/client';
import {
  generateBlogPostSchema,
  generateReviewSchema,
  generateMedicalBusinessSchema,
  generateBreadcrumbSchema,
  generateFAQSchema
} from './src/lib/schema-generator';

const prisma = new PrismaClient();

async function populateArticleSchemas() {
  console.log('Populating article schemas...\n');

  const articles = await prisma.article.findMany({
    where: {
      OR: [
        { schema: null },
        { schema: '' }
      ],
      status: 'PUBLISHED'
    },
    include: {
      author: true,
      category: true
    }
  });

  console.log(`Found ${articles.length} articles without schemas`);

  let updated = 0;
  const baseUrl = 'https://pediatricdentistinqueensny.com';

  for (const article of articles) {
    const articleUrl = `${baseUrl}/${article.slug}/`;

    const articleSchema = generateBlogPostSchema({
      title: article.title,
      description: article.excerpt || article.title,
      url: articleUrl,
      author: {
        name: article.author.name,
        url: `${baseUrl}/authors/${article.author.slug}/`,
        image: article.author.avatar || undefined
      },
      datePublished: article.publishedAt?.toISOString() || new Date().toISOString(),
      dateModified: article.updatedAt.toISOString(),
      image: article.featuredImage ? {
        url: article.featuredImage,
        caption: article.title
      } : undefined
    });

    await prisma.article.update({
      where: { id: article.id },
      data: { schema: JSON.stringify(articleSchema) }
    });

    updated++;
    if (updated % 20 === 0) {
      console.log(`  Updated ${updated}/${articles.length} articles...`);
    }
  }

  console.log(`✓ Updated ${updated} article schemas\n`);
}

async function populateReviewSchemas() {
  console.log('Populating review schemas...\n');

  const reviews = await prisma.review.findMany({
    where: {
      OR: [
        { schema: null },
        { schema: '' }
      ],
      status: 'PUBLISHED'
    },
    include: {
      primaryReviewer: true,
      category: true
    }
  });

  console.log(`Found ${reviews.length} reviews without schemas`);

  let updated = 0;
  const baseUrl = 'https://pediatricdentistinqueensny.com';

  for (const review of reviews) {
    const reviewUrl = `${baseUrl}/${review.slug}/`;

    const reviewSchema = generateReviewSchema({
      title: review.title,
      description: review.excerpt || review.title,
      url: reviewUrl,
      author: {
        name: review.primaryReviewer?.name || 'Editorial Team',
        url: review.primaryReviewer?.slug ? `${baseUrl}/reviewers/${review.primaryReviewer.slug}/` : undefined,
        image: review.primaryReviewer?.avatar || undefined
      },
      datePublished: review.publishedAt?.toISOString() || new Date().toISOString(),
      dateModified: review.updatedAt?.toISOString(),
      itemName: review.title,
      itemImage: review.featuredImage || undefined,
      rating: review.rating ?? undefined,
      image: review.featuredImage ? {
        url: review.featuredImage,
        caption: review.title
      } : undefined
    });

    await prisma.review.update({
      where: { id: review.id },
      data: { schema: JSON.stringify(reviewSchema) }
    });

    updated++;
  }

  console.log(`✓ Updated ${updated} review schemas\n`);
}

async function populateDentistSchemas() {
  console.log('Populating dentist directory schemas...\n');

  const dentists = await prisma.dentistDirectory.findMany({
    where: {
      OR: [
        { schema: null },
        { schema: '' }
      ],
      isActive: true
    }
  });

  console.log(`Found ${dentists.length} dentists without schemas`);

  let updated = 0;
  const baseUrl = 'https://pediatricdentistinqueensny.com';

  for (const dentist of dentists) {
    const dentistUrl = `${baseUrl}/dentist/${dentist.slug}/`;
    const workingHours = dentist.workingHours ? JSON.parse(dentist.workingHours as string) : null;

    // Parse address for schema
    const addressParts = dentist.address ? {
      street: dentist.address.split(',')[0]?.trim() || '',
      city: 'Queens',
      state: 'NY',
      zip: dentist.address.match(/\d{5}/)?.[0] || '',
      country: 'US'
    } : undefined;

    const businessSchema = generateMedicalBusinessSchema({
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
    });

    await prisma.dentistDirectory.update({
      where: { id: dentist.id },
      data: { schema: JSON.stringify(businessSchema) }
    });

    updated++;
  }

  console.log(`✓ Updated ${updated} dentist schemas\n`);
}

async function main() {
  console.log('Starting schema population...\n');

  try {
    await populateArticleSchemas();
    await populateReviewSchemas();
    await populateDentistSchemas();

    console.log('✅ All schemas populated successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
