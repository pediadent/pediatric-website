import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifySchemas() {
  console.log('Verifying schemas in database...\n');

  // Check articles
  const articlesWithSchema = await prisma.article.count({
    where: {
      schema: { not: null },
      status: 'PUBLISHED'
    }
  });
  const totalArticles = await prisma.article.count({
    where: { status: 'PUBLISHED' }
  });

  console.log(`Articles: ${articlesWithSchema}/${totalArticles} have schemas`);

  // Check reviews
  const reviewsWithSchema = await prisma.review.count({
    where: {
      schema: { not: null },
      status: 'PUBLISHED'
    }
  });
  const totalReviews = await prisma.review.count({
    where: { status: 'PUBLISHED' }
  });

  console.log(`Reviews: ${reviewsWithSchema}/${totalReviews} have schemas`);

  // Check dentists
  const dentistsWithSchema = await prisma.dentistDirectory.count({
    where: {
      schema: { not: null },
      isActive: true
    }
  });
  const totalDentists = await prisma.dentistDirectory.count({
    where: { isActive: true }
  });

  console.log(`Dentists: ${dentistsWithSchema}/${totalDentists} have schemas`);

  // Show sample schemas
  console.log('\n--- Sample Article Schema ---');
  const sampleArticle = await prisma.article.findFirst({
    where: { schema: { not: null }, status: 'PUBLISHED' },
    select: { title: true, schema: true }
  });
  if (sampleArticle) {
    console.log(`Title: ${sampleArticle.title}`);
    const schema = JSON.parse(sampleArticle.schema!);
    console.log(`Schema type: ${schema['@type']}`);
    console.log(`Has author: ${!!schema.author}`);
    console.log(`Has publisher: ${!!schema.publisher}`);
    console.log(`Has image: ${!!schema.image}`);
  }

  console.log('\n--- Sample Review Schema ---');
  const sampleReview = await prisma.review.findFirst({
    where: { schema: { not: null }, status: 'PUBLISHED' },
    select: { title: true, schema: true }
  });
  if (sampleReview) {
    console.log(`Title: ${sampleReview.title}`);
    const schema = JSON.parse(sampleReview.schema!);
    console.log(`Schema type: ${schema['@type']}`);
    console.log(`Has rating: ${!!schema.reviewRating}`);
    console.log(`Has itemReviewed: ${!!schema.itemReviewed}`);
  }

  console.log('\n--- Sample Dentist Schema ---');
  const sampleDentist = await prisma.dentistDirectory.findFirst({
    where: { schema: { not: null }, isActive: true },
    select: { name: true, schema: true }
  });
  if (sampleDentist) {
    console.log(`Name: ${sampleDentist.name}`);
    const schema = JSON.parse(sampleDentist.schema!);
    console.log(`Schema types: ${JSON.stringify(schema['@type'])}`);
    console.log(`Has address: ${!!schema.address}`);
    console.log(`Has rating: ${!!schema.aggregateRating}`);
    console.log(`Medical specialty: ${schema.medicalSpecialty}`);
  }

  await prisma.$disconnect();
}

verifySchemas();
