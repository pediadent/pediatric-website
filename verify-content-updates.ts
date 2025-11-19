import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyUpdates() {
  try {
    console.log('Checking article content for image URLs...\n');

    // Get a few articles that should have images
    const articles = await prisma.article.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        content: true
      },
      take: 5
    });

    articles.forEach((article, idx) => {
      console.log(`\n=== Article ${idx + 1}: ${article.title.substring(0, 60)} ===`);
      console.log(`Slug: ${article.slug}`);

      // Count different types of image URLs
      const uploadsMatches = article.content.match(/<img[^>]+src="\/uploads\/[^">]+"/g);
      const cloudinaryMatches = article.content.match(/<img[^>]+src="https:\/\/res\.cloudinary\.com[^">]+"/g);
      const externalMatches = article.content.match(/<img[^>]+src="https:\/\/(?!res\.cloudinary\.com)[^">]+"/g);

      console.log(`Images with /uploads path: ${uploadsMatches ? uploadsMatches.length : 0}`);
      console.log(`Images with Cloudinary URL: ${cloudinaryMatches ? cloudinaryMatches.length : 0}`);
      console.log(`Images with external URLs: ${externalMatches ? externalMatches.length : 0}`);

      if (cloudinaryMatches && cloudinaryMatches.length > 0) {
        console.log('\nSample Cloudinary URLs:');
        cloudinaryMatches.slice(0, 2).forEach(match => {
          const urlMatch = match.match(/src="([^"]+)"/);
          if (urlMatch) {
            console.log(`  ${urlMatch[1].substring(0, 100)}...`);
          }
        });
      }

      if (uploadsMatches && uploadsMatches.length > 0) {
        console.log('\nSample /uploads paths still remaining:');
        uploadsMatches.slice(0, 2).forEach(match => {
          const urlMatch = match.match(/src="([^"]+)"/);
          if (urlMatch) {
            console.log(`  ${urlMatch[1]}`);
          }
        });
      }
    });

    // Check reviews too
    console.log('\n\n=== CHECKING REVIEWS ===\n');
    const reviews = await prisma.review.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        content: true
      },
      take: 5
    });

    reviews.forEach((review, idx) => {
      console.log(`\n--- Review ${idx + 1}: ${review.title.substring(0, 60)} ---`);
      console.log(`Slug: ${review.slug}`);

      const uploadsMatches = review.content.match(/<img[^>]+src="\/uploads\/[^">]+"/g);
      const cloudinaryMatches = review.content.match(/<img[^>]+src="https:\/\/res\.cloudinary\.com[^">]+"/g);

      console.log(`Images with /uploads path: ${uploadsMatches ? uploadsMatches.length : 0}`);
      console.log(`Images with Cloudinary URL: ${cloudinaryMatches ? cloudinaryMatches.length : 0}`);

      if (uploadsMatches && uploadsMatches.length > 0) {
        console.log('Sample /uploads paths:');
        uploadsMatches.slice(0, 2).forEach(match => {
          const urlMatch = match.match(/src="([^"]+)"/);
          if (urlMatch) {
            console.log(`  ${urlMatch[1]}`);
          }
        });
      }
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyUpdates();
