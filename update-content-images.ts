import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Map of /uploads paths to Cloudinary URLs from the Media table
const imageMap = new Map<string, string>();

async function buildImageMap() {
  console.log('Building image map from Media table...');

  const media = await prisma.media.findMany({
    select: {
      path: true,
      alt: true
    }
  });

  let cloudinaryCount = 0;
  media.forEach(m => {
    if (m.path && m.path.includes('cloudinary')) {
      // Extract the original path from alt or construct it
      // The alt field might contain the original path
      if (m.alt) {
        const uploadsMatch = m.alt.match(/\/uploads\/[^\s"']+/);
        if (uploadsMatch) {
          imageMap.set(uploadsMatch[0], m.path);
          cloudinaryCount++;
        }
      }
    }
  });

  console.log(`Found ${cloudinaryCount} Cloudinary URLs mapped\n`);

  if (cloudinaryCount === 0) {
    console.log('No Cloudinary mappings found in Media table.');
    console.log('Will need to upload content images directly...\n');
  }

  return cloudinaryCount;
}

async function updateContentImages() {
  console.log('Starting update of images in article content...\n');

  try {
    const mappingCount = await buildImageMap();

    // Get all articles with content
    const articles = await prisma.article.findMany({
      select: {
        id: true,
        title: true,
        content: true
      }
    });

    let articlesUpdated = 0;
    let imagesReplaced = 0;

    console.log(`Processing ${articles.length} articles...`);

    for (const article of articles) {
      let updatedContent = article.content;
      let articleModified = false;

      // Find all image tags with /uploads src
      const imgRegex = /<img([^>]+)src="(\/uploads\/[^"]+)"([^>]*)>/g;
      const matches = Array.from(article.content.matchAll(imgRegex));

      if (matches.length > 0) {
        for (const match of matches) {
          const fullTag = match[0];
          const beforeSrc = match[1];
          const uploadsPath = match[2];
          const afterSrc = match[3];

          // Check if we have a Cloudinary URL for this path
          if (imageMap.has(uploadsPath)) {
            const cloudinaryUrl = imageMap.get(uploadsPath)!;
            const newTag = `<img${beforeSrc}src="${cloudinaryUrl}"${afterSrc}>`;

            updatedContent = updatedContent.replace(fullTag, newTag);
            articleModified = true;
            imagesReplaced++;
          }
        }

        if (articleModified) {
          await prisma.article.update({
            where: { id: article.id },
            data: { content: updatedContent }
          });
          articlesUpdated++;
        }
      }
    }

    console.log(`\n✅ Content images updated!`);
    console.log(`Articles updated: ${articlesUpdated}`);
    console.log(`Images replaced: ${imagesReplaced}`);

    if (imagesReplaced === 0) {
      console.log('\n⚠️ No images were replaced.');
      console.log('This means the Media table doesn\'t have the Cloudinary URLs for content images.');
      console.log('We need to upload the content images to Cloudinary first.');
    }

  } catch (error) {
    console.error('❌ Error during update:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

updateContentImages();
