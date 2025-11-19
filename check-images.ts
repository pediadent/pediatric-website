import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkImages() {
  try {
    console.log('Checking dentist directory images...\n');

    const dentists = await prisma.dentistDirectory.findMany({
      select: {
        id: true,
        name: true,
        image: true,
        logo: true
      },
      take: 5
    });

    console.log('First 5 dentists:');
    dentists.forEach(d => {
      console.log(`\nID: ${d.id}`);
      console.log(`Name: ${d.name}`);
      console.log(`Image: ${d.image ? d.image.substring(0, 80) : 'NULL'}`);
      console.log(`Logo: ${d.logo ? d.logo.substring(0, 80) : 'NULL'}`);
    });

    console.log('\n\nChecking article images...\n');

    const articles = await prisma.article.findMany({
      select: {
        id: true,
        title: true,
        featuredImage: true
      },
      take: 5
    });

    console.log('First 5 articles:');
    articles.forEach(a => {
      console.log(`\nID: ${a.id}`);
      console.log(`Title: ${a.title.substring(0, 50)}`);
      console.log(`Image: ${a.featuredImage ? a.featuredImage.substring(0, 80) : 'NULL'}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkImages();
