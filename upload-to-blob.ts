import { put } from '@vercel/blob';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface UploadResult {
  localPath: string;
  blobUrl: string;
}

const uploadedFiles = new Map<string, string>(); // localPath -> blobUrl

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

    const fileBuffer = fs.readFileSync(fullPath);
    const fileName = path.basename(localPath);
    const directory = path.dirname(localPath).replace(/^\//, '').replace(/\\/g, '/');

    // Upload to Vercel Blob with original directory structure
    const blobPath = directory ? `${directory}/${fileName}` : fileName;

    const blob = await put(blobPath, fileBuffer, {
      access: 'public',
      contentType: getContentType(fileName)
    });

    uploadedFiles.set(localPath, blob.url);
    return blob.url;
  } catch (error) {
    console.error(`Error uploading ${localPath}:`, error);
    return null;
  }
}

function getContentType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const types: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml'
  };
  return types[ext] || 'application/octet-stream';
}

async function uploadImages() {
  console.log('Starting image upload to Vercel Blob Storage...\n');

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

    let uploadCount = 0;
    let updateCount = 0;

    // Upload and update Categories
    console.log('Processing categories...');
    for (const category of categories) {
      let updated = false;

      if (category.featuredImage && category.featuredImage.startsWith('/uploads')) {
        const blobUrl = await uploadFile(category.featuredImage);
        if (blobUrl) {
          await prisma.category.update({
            where: { id: category.id },
            data: { featuredImage: blobUrl }
          });
          uploadCount++;
          updated = true;
        }
      }

      if (updated) updateCount++;
    }
    console.log(`✓ Categories: ${uploadCount} images uploaded\n`);

    // Upload and update Authors
    console.log('Processing authors...');
    uploadCount = 0;
    for (const author of authors) {
      let updated = false;

      if (author.avatar && author.avatar.startsWith('/uploads')) {
        const blobUrl = await uploadFile(author.avatar);
        if (blobUrl) {
          await prisma.author.update({
            where: { id: author.id },
            data: { avatar: blobUrl }
          });
          uploadCount++;
          updated = true;
        }
      }

      if (author.featuredImage && author.featuredImage.startsWith('/uploads')) {
        const blobUrl = await uploadFile(author.featuredImage);
        if (blobUrl) {
          await prisma.author.update({
            where: { id: author.id },
            data: { featuredImage: blobUrl }
          });
          uploadCount++;
          updated = true;
        }
      }

      if (updated) updateCount++;
    }
    console.log(`✓ Authors: ${uploadCount} images uploaded\n`);

    // Upload and update Reviewers
    console.log('Processing reviewers...');
    uploadCount = 0;
    for (const reviewer of reviewers) {
      let updated = false;

      if (reviewer.avatar && reviewer.avatar.startsWith('/uploads')) {
        const blobUrl = await uploadFile(reviewer.avatar);
        if (blobUrl) {
          await prisma.reviewer.update({
            where: { id: reviewer.id },
            data: { avatar: blobUrl }
          });
          uploadCount++;
          updated = true;
        }
      }

      if (reviewer.featuredImage && reviewer.featuredImage.startsWith('/uploads')) {
        const blobUrl = await uploadFile(reviewer.featuredImage);
        if (blobUrl) {
          await prisma.reviewer.update({
            where: { id: reviewer.id },
            data: { featuredImage: blobUrl }
          });
          uploadCount++;
          updated = true;
        }
      }

      if (updated) updateCount++;
    }
    console.log(`✓ Reviewers: ${uploadCount} images uploaded\n`);

    // Upload and update Articles
    console.log('Processing articles...');
    uploadCount = 0;
    for (const article of articles) {
      let updated = false;

      if (article.featuredImage && article.featuredImage.startsWith('/uploads')) {
        const blobUrl = await uploadFile(article.featuredImage);
        if (blobUrl) {
          await prisma.article.update({
            where: { id: article.id },
            data: { featuredImage: blobUrl }
          });
          uploadCount++;
          updated = true;
        }
      }

      if (updated) updateCount++;

      if ((uploadCount % 20) === 0 && uploadCount > 0) {
        console.log(`  Processed ${uploadCount}/${articles.length} articles...`);
      }
    }
    console.log(`✓ Articles: ${uploadCount} images uploaded\n`);

    // Upload and update Reviews
    console.log('Processing reviews...');
    uploadCount = 0;
    for (const review of reviews) {
      let updated = false;

      if (review.featuredImage && review.featuredImage.startsWith('/uploads')) {
        const blobUrl = await uploadFile(review.featuredImage);
        if (blobUrl) {
          await prisma.review.update({
            where: { id: review.id },
            data: { featuredImage: blobUrl }
          });
          uploadCount++;
          updated = true;
        }
      }

      if (updated) updateCount++;
    }
    console.log(`✓ Reviews: ${uploadCount} images uploaded\n`);

    // Upload and update Dentist Directory
    console.log('Processing dentist directory...');
    uploadCount = 0;
    for (const dentist of dentists) {
      let updated = false;

      if (dentist.image && dentist.image.startsWith('/uploads')) {
        const blobUrl = await uploadFile(dentist.image);
        if (blobUrl) {
          await prisma.dentistDirectory.update({
            where: { id: dentist.id },
            data: { image: blobUrl }
          });
          uploadCount++;
          updated = true;
        }
      }

      if (dentist.logo && dentist.logo.startsWith('/uploads')) {
        const blobUrl = await uploadFile(dentist.logo);
        if (blobUrl) {
          await prisma.dentistDirectory.update({
            where: { id: dentist.id },
            data: { logo: blobUrl }
          });
          uploadCount++;
          updated = true;
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
                const blobUrl = await uploadFile(imagePath);
                updatedGallery.push(blobUrl || imagePath);
                if (blobUrl) uploadCount++;
              } else {
                updatedGallery.push(imagePath);
              }
            }
            await prisma.dentistDirectory.update({
              where: { id: dentist.id },
              data: { gallery: JSON.stringify(updatedGallery) }
            });
            updated = true;
          }
        } catch (e) {
          // Not JSON, skip
        }
      }

      if (updated) updateCount++;
    }
    console.log(`✓ Dentist Directory: ${uploadCount} images uploaded\n`);

    // Upload and update Media records
    console.log('Processing media files...');
    uploadCount = 0;
    for (const m of media) {
      if (m.path && m.path.startsWith('/uploads')) {
        const blobUrl = await uploadFile(m.path);
        if (blobUrl) {
          await prisma.media.update({
            where: { id: m.id },
            data: { path: blobUrl }
          });
          uploadCount++;
        }
      }

      if ((uploadCount % 100) === 0 && uploadCount > 0) {
        console.log(`  Processed ${uploadCount}/${media.length} media files...`);
      }
    }
    console.log(`✓ Media: ${uploadCount} images uploaded\n`);

    console.log('✅ Image upload completed successfully!');
    console.log(`Total unique files uploaded: ${uploadedFiles.size}`);
    console.log(`Database records updated: ${updateCount}`);

  } catch (error) {
    console.error('❌ Error during upload:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

uploadImages();
