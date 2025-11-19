import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db'
    }
  }
});

async function exportData() {
  try {
    console.log('Exporting data from SQLite...\n');

    const data = {
      users: await prisma.user.findMany(),
      categories: await prisma.category.findMany(),
      authors: await prisma.author.findMany(),
      reviewers: await prisma.reviewer.findMany(),
      articles: await prisma.article.findMany(),
      reviews: await prisma.review.findMany(),
      reviewReviewers: await prisma.reviewReviewer.findMany(),
      dentists: await prisma.dentistDirectory.findMany(),
      media: await prisma.media.findMany(),
      redirects: await prisma.redirect.findMany(),
      clinicSubmissions: await prisma.clinicSubmission.findMany(),
      analyticsSnippets: await prisma.analyticsSnippet.findMany(),
      seoSettings: await prisma.seoSettings.findMany(),
    };

    console.log('Found data:');
    console.log(`- Users: ${data.users.length}`);
    console.log(`- Categories: ${data.categories.length}`);
    console.log(`- Authors: ${data.authors.length}`);
    console.log(`- Reviewers: ${data.reviewers.length}`);
    console.log(`- Articles: ${data.articles.length}`);
    console.log(`- Reviews: ${data.reviews.length}`);
    console.log(`- Review Reviewers: ${data.reviewReviewers.length}`);
    console.log(`- Dentist Directory: ${data.dentists.length}`);
    console.log(`- Media: ${data.media.length}`);
    console.log(`- Redirects: ${data.redirects.length}`);
    console.log(`- Clinic Submissions: ${data.clinicSubmissions.length}`);
    console.log(`- Analytics Snippets: ${data.analyticsSnippets.length}`);
    console.log(`- SEO Settings: ${data.seoSettings.length}\n`);

    fs.writeFileSync('./exported-data.json', JSON.stringify(data, null, 2));
    console.log('✅ Data exported to exported-data.json');

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

exportData();
