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

function removeDuplicateFromAnswer(answer: string | string[]): string {
  if (typeof answer === 'string') {
    // Split by paragraphs
    const paragraphs = answer.split(/\r?\n+/).map(p => p.trim()).filter(Boolean);

    // Remove exact duplicates
    const seen = new Set<string>();
    const uniqueParagraphs = paragraphs.filter(p => {
      if (seen.has(p)) {
        return false;
      }
      seen.add(p);
      return true;
    });

    return uniqueParagraphs.join('\n\n');
  }

  if (Array.isArray(answer)) {
    const seen = new Set<string>();
    const uniqueAnswers = answer.filter(a => {
      const trimmed = a.trim();
      if (seen.has(trimmed)) {
        return false;
      }
      seen.add(trimmed);
      return true;
    });

    // If it's an array, join back into a string
    return uniqueAnswers.join('\n\n');
  }

  return '';
}

function hasDuplicateAnswer(answer: string | string[]): boolean {
  if (typeof answer === 'string') {
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

async function fixArticles() {
  console.log('Fixing articles...\n');

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

  let fixedCount = 0;

  for (const article of articles) {
    const faqs = parseFaqField(article.faqs);
    let needsUpdate = false;

    const updatedFaqs = faqs.map(faq => {
      if (hasDuplicateAnswer(faq.answer)) {
        needsUpdate = true;
        return {
          question: faq.question,
          answer: removeDuplicateFromAnswer(faq.answer)
        };
      }
      return faq;
    });

    if (needsUpdate) {
      await prisma.article.update({
        where: { id: article.id },
        data: { faqs: JSON.stringify(updatedFaqs) }
      });
      fixedCount++;
      if (fixedCount % 50 === 0) {
        console.log(`  Fixed ${fixedCount} articles...`);
      }
    }
  }

  console.log(`✓ Fixed ${fixedCount} articles\n`);
  return fixedCount;
}

async function fixReviews() {
  console.log('Fixing reviews...\n');

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

  let fixedCount = 0;

  for (const review of reviews) {
    const faqs = parseFaqField(review.faqs);
    let needsUpdate = false;

    const updatedFaqs = faqs.map(faq => {
      if (hasDuplicateAnswer(faq.answer)) {
        needsUpdate = true;
        return {
          question: faq.question,
          answer: removeDuplicateFromAnswer(faq.answer)
        };
      }
      return faq;
    });

    if (needsUpdate) {
      await prisma.review.update({
        where: { id: review.id },
        data: { faqs: JSON.stringify(updatedFaqs) }
      });
      fixedCount++;
    }
  }

  console.log(`✓ Fixed ${fixedCount} reviews\n`);
  return fixedCount;
}

async function main() {
  console.log('Fixing duplicate FAQ answers...\n');

  try {
    const articlesFixed = await fixArticles();
    const reviewsFixed = await fixReviews();

    console.log('\n=== SUMMARY ===');
    console.log(`Total articles fixed: ${articlesFixed}`);
    console.log(`Total reviews fixed: ${reviewsFixed}`);
    console.log(`\n✅ All duplicate FAQ answers have been fixed!`);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
