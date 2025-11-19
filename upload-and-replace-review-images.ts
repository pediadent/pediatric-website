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

async function uploadAndReplaceReviewImages() {
  console.log('Starting upload and replacement of review content images...\n');

  try {
    // Get all reviews
    const reviews = await prisma.review.findMany({
      select: {
        id: true,
        title: true,
        content: true
      }
    });

    console.log(`Processing ${reviews.length} reviews...`);

    let reviewsUpdated = 0;
    let imagesUploaded = 0;

    for (const review of reviews) {
      let updatedContent = review.content;
      let reviewModified = false;

      // Find all image tags with /uploads src
      const imgRegex = /<img([^>]+)src="(\/uploads\/[^"]+)"([^>]*)>/g;
      const matches = Array.from(review.content.matchAll(imgRegex));

      if (matches.length > 0) {
        for (const match of matches) {
          const fullTag = match[0];
          const beforeSrc = match[1];
          const uploadsPath = match[2];
          const afterSrc = match[3];

          // Upload to Cloudinary
          const cloudinaryUrl = await uploadFile(uploadsPath);

          if (cloudinaryUrl) {
            const newTag = `<img${beforeSrc}src="${cloudinaryUrl}"${afterSrc}>`;
            updatedContent = updatedContent.replace(fullTag, newTag);
            reviewModified = true;
            imagesUploaded++;
          }
        }

        if (reviewModified) {
          await prisma.review.update({
            where: { id: review.id },
            data: { content: updatedContent }
          });
          reviewsUpdated++;
        }
      }
    }

    console.log(`\n✅ Review content images upload and replacement completed!`);
    console.log(`Reviews updated: ${reviewsUpdated}`);
    console.log(`Unique files uploaded: ${uploadedFiles.size}`);
    console.log(`Total images replaced: ${imagesUploaded}`);

  } catch (error) {
    console.error('❌ Error during upload:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

uploadAndReplaceReviewImages();
