import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkContentImages() {
  try {
    // Check a few articles to see what their content looks like
    const articles = await prisma.article.findMany({
      select: {
        id: true,
        title: true,
        content: true,
      },
      take: 3
    });

    console.log('Sample article content:\n');
    articles.forEach((article, idx) => {
      console.log(`\n=== Article ${idx + 1}: ${article.title.substring(0, 50)} ===`);

      // Extract image URLs from content
      const imgRegex = /<img[^>]+src="([^">]+)"/g;
      const matches = article.content.matchAll(imgRegex);

      let imageCount = 0;
      for (const match of matches) {
        console.log(`Image ${++imageCount}: ${match[1]}`);
      }

      if (imageCount === 0) {
        console.log('No images found in content');
      }
    });

    // Count how many articles have images in content
    const allArticles = await prisma.article.findMany({
      select: { content: true }
    });

    let articlesWithImages = 0;
    let articlesWithUploads = 0;
    let articlesWithBlob = 0;
    let articlesWithCloudinary = 0;

    allArticles.forEach(article => {
      const imgRegex = /<img[^>]+src="([^">]+)"/g;
      const matches = Array.from(article.content.matchAll(imgRegex));

      if (matches.length > 0) {
        articlesWithImages++;

        matches.forEach(match => {
          if (match[1].includes('/uploads')) articlesWithUploads++;
          if (match[1].includes('blob.vercel')) articlesWithBlob++;
          if (match[1].includes('cloudinary')) articlesWithCloudinary++;
        });
      }
    });

    console.log('\n\n=== Summary ===');
    console.log(`Total articles: ${allArticles.length}`);
    console.log(`Articles with images in content: ${articlesWithImages}`);
    console.log(`Images with /uploads path: ${articlesWithUploads}`);
    console.log(`Images with Vercel Blob URL: ${articlesWithBlob}`);
    console.log(`Images with Cloudinary URL: ${articlesWithCloudinary}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkContentImages();
