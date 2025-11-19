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

interface UploadResult {
  localPath: string;
  cloudinaryUrl: string;
}

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

async function uploadImages() {
  console.log('Starting image upload to Cloudinary...\n');

  try {
    // Get all records with images
    const [categories, authors, reviewers, articles, reviews, dentists, media] = await Promise.all([
      prisma.category.findMany(),
      prisma.author.findMany(),
      prisma.reviewer.findMany(),
      prisma.article.findMany(),
      prisma.review.findMany(),
      prisma.dentistDirectory.findMany(),
      prisma.media.findMany()
    ]);

    console.log('Found records with images:');
    console.log(`- Categories: ${categories.length}`);
    console.log(`- Authors: ${authors.length}`);
    console.log(`- Reviewers: ${reviewers.length}`);
    console.log(`- Articles: ${articles.length}`);
    console.log(`- Reviews: ${reviews.length}`);
    console.log(`- Dentist Directory: ${dentists.length}`);
    console.log(`- Media: ${media.length}\n`);

    let totalUploaded = 0;
    let totalUpdated = 0;

    // Upload and update Categories
    console.log('Processing categories...');
    for (const category of categories) {
      if (category.featuredImage && category.featuredImage.startsWith('/uploads')) {
        const cloudinaryUrl = await uploadFile(category.featuredImage);
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
    console.log(`✓ Categories processed\n`);

    // Upload and update Authors
    console.log('Processing authors...');
    for (const author of authors) {
      if (author.avatar && author.avatar.startsWith('/uploads')) {
        const cloudinaryUrl = await uploadFile(author.avatar);
        if (cloudinaryUrl) {
          await prisma.author.update({
            where: { id: author.id },
            data: { avatar: cloudinaryUrl }
          });
          totalUploaded++;
        }
      }

      if (author.featuredImage && author.featuredImage.startsWith('/uploads')) {
        const cloudinaryUrl = await uploadFile(author.featuredImage);
        if (cloudinaryUrl) {
          await prisma.author.update({
            where: { id: author.id },
            data: { featuredImage: cloudinaryUrl }
          });
          totalUploaded++;
        }
      }
    }
    console.log(`✓ Authors processed\n`);

    // Upload and update Reviewers
    console.log('Processing reviewers...');
    for (const reviewer of reviewers) {
      if (reviewer.avatar && reviewer.avatar.startsWith('/uploads')) {
        const cloudinaryUrl = await uploadFile(reviewer.avatar);
        if (cloudinaryUrl) {
          await prisma.reviewer.update({
            where: { id: reviewer.id },
            data: { avatar: cloudinaryUrl }
          });
          totalUploaded++;
        }
      }

      if (reviewer.featuredImage && reviewer.featuredImage.startsWith('/uploads')) {
        const cloudinaryUrl = await uploadFile(reviewer.featuredImage);
        if (cloudinaryUrl) {
          await prisma.reviewer.update({
            where: { id: reviewer.id },
            data: { featuredImage: cloudinaryUrl }
          });
          totalUploaded++;
        }
      }
    }
    console.log(`✓ Reviewers processed\n`);

    // Upload and update Articles
    console.log('Processing articles...');
    let articleCount = 0;
    for (const article of articles) {
      if (article.featuredImage && article.featuredImage.startsWith('/uploads')) {
        const cloudinaryUrl = await uploadFile(article.featuredImage);
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
    console.log(`✓ Articles processed (${articles.length})\n`);

    // Upload and update Reviews
    console.log('Processing reviews...');
    for (const review of reviews) {
      if (review.featuredImage && review.featuredImage.startsWith('/uploads')) {
        const cloudinaryUrl = await uploadFile(review.featuredImage);
        if (cloudinaryUrl) {
          await prisma.review.update({
            where: { id: review.id },
            data: { featuredImage: cloudinaryUrl }
          });
          totalUploaded++;
        }
      }
    }
    console.log(`✓ Reviews processed\n`);

    // Upload and update Dentist Directory
    console.log('Processing dentist directory...');
    for (const dentist of dentists) {
      if (dentist.image && dentist.image.startsWith('/uploads')) {
        const cloudinaryUrl = await uploadFile(dentist.image);
        if (cloudinaryUrl) {
          await prisma.dentistDirectory.update({
            where: { id: dentist.id },
            data: { image: cloudinaryUrl }
          });
          totalUploaded++;
        }
      }

      if (dentist.logo && dentist.logo.startsWith('/uploads')) {
        const cloudinaryUrl = await uploadFile(dentist.logo);
        if (cloudinaryUrl) {
          await prisma.dentistDirectory.update({
            where: { id: dentist.id },
            data: { logo: cloudinaryUrl }
          });
          totalUploaded++;
        }
      }

      // Handle gallery (JSON array of image paths)
      if (dentist.gallery) {
        try {
          const gallery = JSON.parse(dentist.gallery as string);
          if (Array.isArray(gallery)) {
            const updatedGallery = [];
            for (const imagePath of gallery) {
              if (imagePath.startsWith('/uploads')) {
                const cloudinaryUrl = await uploadFile(imagePath);
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
    console.log(`✓ Dentist Directory processed\n`);

    // Upload and update Media records
    console.log('Processing media files...');
    let mediaCount = 0;
    for (const m of media) {
      if (m.path && m.path.startsWith('/uploads')) {
        const cloudinaryUrl = await uploadFile(m.path);
        if (cloudinaryUrl) {
          await prisma.media.update({
            where: { id: m.id },
            data: { path: cloudinaryUrl }
          });
          totalUploaded++;
        }
      }

      mediaCount++;
      if ((mediaCount % 100) === 0) {
        console.log(`  Processed ${mediaCount}/${media.length} media files...`);
      }
    }
    console.log(`✓ Media processed (${media.length})\n`);

    console.log('✅ Image upload completed successfully!');
    console.log(`Total unique files uploaded to Cloudinary: ${uploadedFiles.size}`);
    console.log(`Total database records updated: ${totalUploaded}`);

  } catch (error) {
    console.error('❌ Error during upload:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

uploadImages();
