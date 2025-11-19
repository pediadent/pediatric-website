import { v2 as cloudinary } from 'cloudinary';
import { PrismaClient } from '@prisma/client';
import fetch from 'node-fetch';

const prisma = new PrismaClient();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadedUrls = new Map<string, string>(); // blobUrl -> cloudinaryUrl

async function uploadFromUrl(blobUrl: string, folder: string, publicId: string): Promise<string | null> {
  try {
    // Check if already uploaded
    if (uploadedUrls.has(blobUrl)) {
      return uploadedUrls.get(blobUrl)!;
    }

    // Upload to Cloudinary from URL
    const result = await cloudinary.uploader.upload(blobUrl, {
      folder: folder,
      public_id: publicId,
      resource_type: 'auto',
      overwrite: false,
    });

    uploadedUrls.set(blobUrl, result.secure_url);
    return result.secure_url;
  } catch (error: any) {
    if (error.http_code === 420) {
      console.error(`⚠ Rate limit reached. Waiting 60 seconds...`);
      await new Promise(resolve => setTimeout(resolve, 60000));
      return uploadFromUrl(blobUrl, folder, publicId); // Retry
    }
    console.error(`Error uploading ${blobUrl}:`, error.message);
    return null;
  }
}

function getCloudinaryPath(blobUrl: string): { folder: string, publicId: string } {
  // Extract meaningful path from blob URL
  // Example: https://...blob.vercel-storage.com/uploads/articles/title/image.jpg
  const urlObj = new URL(blobUrl);
  const pathname = urlObj.pathname;

  // Remove leading /uploads/
  let cleanPath = pathname.replace(/^\/uploads\//, '');

  // Get folder and filename
  const lastSlash = cleanPath.lastIndexOf('/');
  const folder = lastSlash > 0 ? `pediatric/${cleanPath.substring(0, lastSlash)}` : 'pediatric';
  const filename = cleanPath.substring(lastSlash + 1);
  const publicId = filename.replace(/\.[^/.]+$/, ''); // Remove extension

  return { folder, publicId };
}

async function migrateImages() {
  console.log('Starting migration from Vercel Blob to Cloudinary...\\n');

  try {
    let totalUploaded = 0;

    // Migrate Articles
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
        const { folder, publicId } = getCloudinaryPath(article.featuredImage);
        const cloudinaryUrl = await uploadFromUrl(article.featuredImage, folder, publicId);

        if (cloudinaryUrl) {
          await prisma.article.update({
            where: { id: article.id },
            data: { featuredImage: cloudinaryUrl }
          });
          totalUploaded++;
        }
      }

      articleCount++;
      if ((articleCount % 20) === 0) {
        console.log(`  Processed ${articleCount}/${articles.length} articles...`);
      }
    }
    console.log(`✓ Articles processed (${articles.length})\\n`);

    // Migrate Reviews
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
        const { folder, publicId } = getCloudinaryPath(review.featuredImage);
        const cloudinaryUrl = await uploadFromUrl(review.featuredImage, folder, publicId);

        if (cloudinaryUrl) {
          await prisma.review.update({
            where: { id: review.id },
            data: { featuredImage: cloudinaryUrl }
          });
          totalUploaded++;
        }
      }
    }
    console.log(`✓ Reviews processed (${reviews.length})\\n`);

    // Migrate Authors
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
        const { folder, publicId } = getCloudinaryPath(author.avatar);
        const cloudinaryUrl = await uploadFromUrl(author.avatar, folder, publicId);

        if (cloudinaryUrl) {
          await prisma.author.update({
            where: { id: author.id },
            data: { avatar: cloudinaryUrl }
          });
          totalUploaded++;
        }
      }

      if (author.featuredImage && author.featuredImage.includes('blob.vercel')) {
        const { folder, publicId } = getCloudinaryPath(author.featuredImage);
        const cloudinaryUrl = await uploadFromUrl(author.featuredImage, folder, publicId);

        if (cloudinaryUrl) {
          await prisma.author.update({
            where: { id: author.id },
            data: { featuredImage: cloudinaryUrl }
          });
          totalUploaded++;
        }
      }
    }
    console.log(`✓ Authors processed (${authors.length})\\n`);

    // Migrate Reviewers
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
        const { folder, publicId } = getCloudinaryPath(reviewer.avatar);
        const cloudinaryUrl = await uploadFromUrl(reviewer.avatar, folder, publicId);

        if (cloudinaryUrl) {
          await prisma.reviewer.update({
            where: { id: reviewer.id },
            data: { avatar: cloudinaryUrl }
          });
          totalUploaded++;
        }
      }

      if (reviewer.featuredImage && reviewer.featuredImage.includes('blob.vercel')) {
        const { folder, publicId } = getCloudinaryPath(reviewer.featuredImage);
        const cloudinaryUrl = await uploadFromUrl(reviewer.featuredImage, folder, publicId);

        if (cloudinaryUrl) {
          await prisma.reviewer.update({
            where: { id: reviewer.id },
            data: { featuredImage: cloudinaryUrl }
          });
          totalUploaded++;
        }
      }
    }
    console.log(`✓ Reviewers processed (${reviewers.length})\\n`);

    // Migrate Dentist Directory
    console.log('Processing dentist directory...');
    const dentists = await prisma.dentistDirectory.findMany({
      where: {
        OR: [
          { image: { contains: 'blob.vercel' } },
          { logo: { contains: 'blob.vercel' } }
        ]
      }
    });

    console.log(`Found ${dentists.length} dentists with Vercel Blob images`);

    for (const dentist of dentists) {
      if (dentist.image && dentist.image.includes('blob.vercel')) {
        const { folder, publicId } = getCloudinaryPath(dentist.image);
        const cloudinaryUrl = await uploadFromUrl(dentist.image, folder, publicId);

        if (cloudinaryUrl) {
          await prisma.dentistDirectory.update({
            where: { id: dentist.id },
            data: { image: cloudinaryUrl }
          });
          totalUploaded++;
        }
      }

      if (dentist.logo && dentist.logo.includes('blob.vercel')) {
        const { folder, publicId } = getCloudinaryPath(dentist.logo);
        const cloudinaryUrl = await uploadFromUrl(dentist.logo, folder, publicId);

        if (cloudinaryUrl) {
          await prisma.dentistDirectory.update({
            where: { id: dentist.id },
            data: { logo: cloudinaryUrl }
          });
          totalUploaded++;
        }
      }

      if (dentist.gallery) {
        try {
          const gallery = JSON.parse(dentist.gallery as string);
          if (Array.isArray(gallery)) {
            const updatedGallery = [];
            for (const imagePath of gallery) {
              if (imagePath.includes('blob.vercel')) {
                const { folder, publicId } = getCloudinaryPath(imagePath);
                const cloudinaryUrl = await uploadFromUrl(imagePath, folder, publicId);
                updatedGallery.push(cloudinaryUrl || imagePath);
                if (cloudinaryUrl) totalUploaded++;
              } else {
                updatedGallery.push(imagePath);
              }
            }
            await prisma.dentistDirectory.update({
              where: { id: dentist.id },
              data: { gallery: JSON.stringify(updatedGallery) }
            });
          }
        } catch (e) {
          // Not JSON, skip
        }
      }
    }
    console.log(`✓ Dentist Directory processed (${dentists.length})\\n`);

    // Migrate Categories
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
        const { folder, publicId } = getCloudinaryPath(category.featuredImage);
        const cloudinaryUrl = await uploadFromUrl(category.featuredImage, folder, publicId);

        if (cloudinaryUrl) {
          await prisma.category.update({
            where: { id: category.id },
            data: { featuredImage: cloudinaryUrl }
          });
          totalUploaded++;
        }
      }
    }
    console.log(`✓ Categories processed (${categories.length})\\n`);

    console.log('✅ Migration completed successfully!');
    console.log(`Total unique files uploaded to Cloudinary: ${uploadedUrls.size}`);
    console.log(`Total database records updated: ${totalUploaded}`);

  } catch (error) {
    console.error('❌ Error during migration:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

migrateImages();
