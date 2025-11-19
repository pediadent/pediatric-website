import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface FaqEntry {
  question: string;
  answer: string | string[];
}

function parseFaqField(value: string | null | undefined): FaqEntry[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.map(entry => ({
        question: entry.question || '',
        answer: entry.answer || ''
      }));
    }
  } catch (error) {
    console.warn('Failed to parse FAQs', error);
  }

  return [];
}

function hasDuplicateAnswer(answer: string | string[]): boolean {
  if (typeof answer === 'string') {
    // Split by paragraphs and check for duplicates
    const paragraphs = answer.split(/\r?\n+/).map(p => p.trim()).filter(Boolean);
    const uniqueParagraphs = new Set(paragraphs);
    return paragraphs.length !== uniqueParagraphs.size;
  }

  if (Array.isArray(answer)) {
    const uniqueAnswers = new Set(answer.map(a => a.trim()));
    return answer.length !== uniqueAnswers.size;
  }

  return false;
}

async function checkArticles() {
  console.log('Checking articles...\n');

  const articles = await prisma.article.findMany({
    where: {
      faqs: { not: null },
      status: 'PUBLISHED'
    },
    select: {
      id: true,
      title: true,
      slug: true,
      faqs: true
    }
  });

  const articlesWithDuplicates: any[] = [];

  for (const article of articles) {
    const faqs = parseFaqField(article.faqs);

    for (const faq of faqs) {
      if (hasDuplicateAnswer(faq.answer)) {
        articlesWithDuplicates.push({
          id: article.id,
          title: article.title,
          slug: article.slug,
          question: faq.question,
          answer: faq.answer
        });
      }
    }
  }

  console.log(`Found ${articlesWithDuplicates.length} articles with duplicate FAQ answers:`);
  articlesWithDuplicates.forEach(item => {
    console.log(`\n- ${item.title} (/${item.slug}/)`);
    console.log(`  Question: ${item.question}`);
    console.log(`  Answer preview: ${typeof item.answer === 'string' ? item.answer.substring(0, 100) : JSON.stringify(item.answer).substring(0, 100)}...`);
  });

  return articlesWithDuplicates;
}

async function checkReviews() {
  console.log('\n\nChecking reviews...\n');

  const reviews = await prisma.review.findMany({
    where: {
      faqs: { not: null },
      status: 'PUBLISHED'
    },
    select: {
      id: true,
      title: true,
      slug: true,
      faqs: true
    }
  });

  const reviewsWithDuplicates: any[] = [];

  for (const review of reviews) {
    const faqs = parseFaqField(review.faqs);

    for (const faq of faqs) {
      if (hasDuplicateAnswer(faq.answer)) {
        reviewsWithDuplicates.push({
          id: review.id,
          title: review.title,
          slug: review.slug,
          question: faq.question,
          answer: faq.answer
        });
      }
    }
  }

  console.log(`Found ${reviewsWithDuplicates.length} reviews with duplicate FAQ answers:`);
  reviewsWithDuplicates.forEach(item => {
    console.log(`\n- ${item.title} (/${item.slug}/)`);
    console.log(`  Question: ${item.question}`);
    console.log(`  Answer preview: ${typeof item.answer === 'string' ? item.answer.substring(0, 100) : JSON.stringify(item.answer).substring(0, 100)}...`);
  });

  return reviewsWithDuplicates;
}

async function main() {
  console.log('Scanning for duplicate FAQ answers...\n');

  const articlesWithDuplicates = await checkArticles();
  const reviewsWithDuplicates = await checkReviews();

  console.log(`\n\n=== SUMMARY ===`);
  console.log(`Total articles with duplicates: ${articlesWithDuplicates.length}`);
  console.log(`Total reviews with duplicates: ${reviewsWithDuplicates.length}`);

  await prisma.$disconnect();
}

main();
