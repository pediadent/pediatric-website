import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkPaths() {
  try {
    // Check what paths exist in each table
    console.log('=== DENTIST DIRECTORY ===');
    const dentists = await prisma.dentistDirectory.findMany({
      select: { id: true, name: true, image: true, logo: true, gallery: true }
    });

    const dentistStats = {
      totalRecords: dentists.length,
      withImage: dentists.filter(d => d.image).length,
      withLogo: dentists.filter(d => d.logo).length,
      withGallery: dentists.filter(d => d.gallery).length,
      imagePaths: dentists.filter(d => d.image).map(d => d.image),
      logoPaths: dentists.filter(d => d.logo).map(d => d.logo)
    };

    console.log(`Total: ${dentistStats.totalRecords}`);
    console.log(`With image: ${dentistStats.withImage}`);
    console.log(`With logo: ${dentistStats.withLogo}`);
    console.log(`With gallery: ${dentistStats.withGallery}`);
    console.log('\nSample image paths:');
    dentistStats.imagePaths.slice(0, 5).forEach(p => console.log(`  ${p}`));
    console.log('\nSample logo paths:');
    dentistStats.logoPaths.slice(0, 5).forEach(p => console.log(`  ${p}`));

    console.log('\n=== ARTICLES ===');
    const articles = await prisma.article.findMany({
      select: { id: true, title: true, featuredImage: true }
    });

    const articleStats = {
      totalRecords: articles.length,
      withImage: articles.filter(a => a.featuredImage).length,
      uploadsPath: articles.filter(a => a.featuredImage && a.featuredImage.startsWith('/uploads')).length,
      blobPath: articles.filter(a => a.featuredImage && a.featuredImage.includes('blob.vercel')).length,
      cloudinaryPath: articles.filter(a => a.featuredImage && a.featuredImage.includes('cloudinary')).length
    };

    console.log(`Total: ${articleStats.totalRecords}`);
    console.log(`With image: ${articleStats.withImage}`);
    console.log(`/uploads paths: ${articleStats.uploadsPath}`);
    console.log(`Vercel Blob paths: ${articleStats.blobPath}`);
    console.log(`Cloudinary paths: ${articleStats.cloudinaryPath}`);

    console.log('\nSample article image paths:');
    articles.filter(a => a.featuredImage).slice(0, 10).forEach(a => {
      console.log(`  ${a.featuredImage}`);
    });

    console.log('\n=== MEDIA ===');
    const mediaCount = await prisma.media.count();
    const mediaWithPath = await prisma.media.count({
      where: { path: { not: null } }
    });
    const mediaUploads = await prisma.media.count({
      where: { path: { startsWith: '/uploads' } }
    });
    const mediaBlob = await prisma.media.count({
      where: { path: { contains: 'blob.vercel' } }
    });
    const mediaCloudinary = await prisma.media.count({
      where: { path: { contains: 'cloudinary' } }
    });

    console.log(`Total: ${mediaCount}`);
    console.log(`With path: ${mediaWithPath}`);
    console.log(`/uploads paths: ${mediaUploads}`);
    console.log(`Vercel Blob paths: ${mediaBlob}`);
    console.log(`Cloudinary paths: ${mediaCloudinary}`);

    const mediaSample = await prisma.media.findMany({
      select: { path: true },
      take: 10
    });
    console.log('\nSample media paths:');
    mediaSample.forEach(m => console.log(`  ${m.path}`));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPaths();
