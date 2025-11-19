import { v2 as cloudinary } from 'cloudinary';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadedFiles = new Map<string, string>(); // localPath -> cloudinaryUrl

async function uploadFile(localPath: string): Promise<string | null> {
  try {
    // Check if already uploaded
    if (uploadedFiles.has(localPath)) {
      return uploadedFiles.get(localPath)!;
    }

    const fullPath = path.join(process.cwd(), 'public', localPath.replace(/^\//, ''));

    if (!fs.existsSync(fullPath)) {
      console.log(`⚠ File not found: ${localPath}`);
      return null;
    }

    // Create folder structure in Cloudinary matching local structure
    const directory = path.dirname(localPath).replace(/^\//, '').replace(/\\/g, '/');
    const fileName = path.basename(localPath, path.extname(localPath));
    const folder = directory ? `pediatric/${directory}` : 'pediatric';

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(fullPath, {
      folder: folder,
      public_id: fileName,
      resource_type: 'auto',
      overwrite: false,
    });

    uploadedFiles.set(localPath, result.secure_url);
    return result.secure_url;
  } catch (error: any) {
    if (error.http_code === 420) {
      console.error(`⚠ Rate limit reached. Waiting 60 seconds...`);
      await new Promise(resolve => setTimeout(resolve, 60000));
      return uploadFile(localPath); // Retry
    }
    console.error(`Error uploading ${localPath}:`, error.message);
    return null;
  }
}

function extractLocalPath(blobUrl: string): string | null {
  // Extract the local path from Vercel Blob URL
  // Example: https://...blob.vercel-storage.com/uploads/articles/title/image.jpg -> /uploads/articles/title/image.jpg
  try {
    const url = new URL(blobUrl);
    const pathname = url.pathname;

    // The pathname should start with /uploads/
    if (pathname.startsWith('/uploads/')) {
      return pathname;
    }

    return null;
  } catch (error) {
    return null;
  }
}

async function replaceImages() {
  console.log('Starting replacement of Vercel Blob URLs with Cloudinary...\\n');

  try {
    let totalUploaded = 0;
    let totalUpdated = 0;

    // Replace Articles
    console.log('Processing articles...');
    const articles = await prisma.article.findMany({
      where: {
        featuredImage: {
          contains: 'blob.vercel'
        }
      }
    });

    console.log(`Found ${articles.length} articles with Vercel Blob images`);
    let articleCount = 0;

    for (const article of articles) {
      if (article.featuredImage && article.featuredImage.includes('blob.vercel')) {
        const localPath = extractLocalPath(article.featuredImage);

        if (localPath) {
          const cloudinaryUrl = await uploadFile(localPath);

          if (cloudinaryUrl) {
            await prisma.article.update({
              where: { id: article.id },
              data: { featuredImage: cloudinaryUrl }
            });
            totalUploaded++;
            totalUpdated++;
          }
        }
      }

      articleCount++;
      if ((articleCount % 20) === 0) {
        console.log(`  Processed ${articleCount}/${articles.length} articles...`);
      }
    }
    console.log(`✓ Articles processed (${articles.length})\\n`);

    // Replace Reviews
    console.log('Processing reviews...');
    const reviews = await prisma.review.findMany({
      where: {
        featuredImage: {
          contains: 'blob.vercel'
        }
      }
    });

    console.log(`Found ${reviews.length} reviews with Vercel Blob images`);

    for (const review of reviews) {
      if (review.featuredImage && review.featuredImage.includes('blob.vercel')) {
        const localPath = extractLocalPath(review.featuredImage);

        if (localPath) {
          const cloudinaryUrl = await uploadFile(localPath);

          if (cloudinaryUrl) {
            await prisma.review.update({
              where: { id: review.id },
              data: { featuredImage: cloudinaryUrl }
            });
            totalUploaded++;
            totalUpdated++;
          }
        }
      }
    }
    console.log(`✓ Reviews processed (${reviews.length})\\n`);

    // Replace Authors
    console.log('Processing authors...');
    const authors = await prisma.author.findMany({
      where: {
        OR: [
          { avatar: { contains: 'blob.vercel' } },
          { featuredImage: { contains: 'blob.vercel' } }
        ]
      }
    });

    console.log(`Found ${authors.length} authors with Vercel Blob images`);

    for (const author of authors) {
      if (author.avatar && author.avatar.includes('blob.vercel')) {
        const localPath = extractLocalPath(author.avatar);

        if (localPath) {
          const cloudinaryUrl = await uploadFile(localPath);

          if (cloudinaryUrl) {
            await prisma.author.update({
              where: { id: author.id },
              data: { avatar: cloudinaryUrl }
            });
            totalUploaded++;
            totalUpdated++;
          }
        }
      }

      if (author.featuredImage && author.featuredImage.includes('blob.vercel')) {
        const localPath = extractLocalPath(author.featuredImage);

        if (localPath) {
          const cloudinaryUrl = await uploadFile(localPath);

          if (cloudinaryUrl) {
            await prisma.author.update({
              where: { id: author.id },
              data: { featuredImage: cloudinaryUrl }
            });
            totalUploaded++;
            totalUpdated++;
          }
        }
      }
    }
    console.log(`✓ Authors processed (${authors.length})\\n`);

    // Replace Reviewers
    console.log('Processing reviewers...');
    const reviewers = await prisma.reviewer.findMany({
      where: {
        OR: [
          { avatar: { contains: 'blob.vercel' } },
          { featuredImage: { contains: 'blob.vercel' } }
        ]
      }
    });

    console.log(`Found ${reviewers.length} reviewers with Vercel Blob images`);

    for (const reviewer of reviewers) {
      if (reviewer.avatar && reviewer.avatar.includes('blob.vercel')) {
        const localPath = extractLocalPath(reviewer.avatar);

        if (localPath) {
          const cloudinaryUrl = await uploadFile(localPath);

          if (cloudinaryUrl) {
            await prisma.reviewer.update({
              where: { id: reviewer.id },
              data: { avatar: cloudinaryUrl }
            });
            totalUploaded++;
            totalUpdated++;
          }
        }
      }

      if (reviewer.featuredImage && reviewer.featuredImage.includes('blob.vercel')) {
        const localPath = extractLocalPath(reviewer.featuredImage);

        if (localPath) {
          const cloudinaryUrl = await uploadFile(localPath);

          if (cloudinaryUrl) {
            await prisma.reviewer.update({
              where: { id: reviewer.id },
              data: { featuredImage: cloudinaryUrl }
            });
            totalUploaded++;
            totalUpdated++;
          }
        }
      }
    }
    console.log(`✓ Reviewers processed (${reviewers.length})\\n`);

    // Replace Categories
    console.log('Processing categories...');
    const categories = await prisma.category.findMany({
      where: {
        featuredImage: {
          contains: 'blob.vercel'
        }
      }
    });

    console.log(`Found ${categories.length} categories with Vercel Blob images`);

    for (const category of categories) {
      if (category.featuredImage && category.featuredImage.includes('blob.vercel')) {
        const localPath = extractLocalPath(category.featuredImage);

        if (localPath) {
          const cloudinaryUrl = await uploadFile(localPath);

          if (cloudinaryUrl) {
            await prisma.category.update({
              where: { id: category.id },
              data: { featuredImage: cloudinaryUrl }
            });
            totalUploaded++;
            totalUpdated++;
          }
        }
      }
    }
    console.log(`✓ Categories processed (${categories.length})\\n`);

    console.log('✅ Replacement completed successfully!');
    console.log(`Total unique files uploaded to Cloudinary: ${uploadedFiles.size}`);
    console.log(`Total database records updated: ${totalUpdated}`);

  } catch (error) {
    console.error('❌ Error during replacement:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

replaceImages();
