import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

// Helper function to convert timestamps to Date objects
function convertDates(obj: any): any {
  if (obj === null || obj === undefined) return obj;

  if (Array.isArray(obj)) {
    return obj.map(convertDates);
  }

  if (typeof obj === 'object') {
    const converted: any = {};
    for (const [key, value] of Object.entries(obj)) {
      // Convert timestamp fields to Date objects
      if ((key === 'createdAt' || key === 'updatedAt' || key === 'publishedAt' ||
           key === 'expiresAt' || key === 'usedAt' || key === 'assignedAt' || key === 'reviewedAt')
          && typeof value === 'number') {
        converted[key] = new Date(value);
      }
      // Convert boolean fields (SQLite stores as 0/1)
      else if ((key === 'isNoIndex' || key === 'isNoFollow' || key === 'isActive' || key === 'isEnabled')
          && typeof value === 'number') {
        converted[key] = value === 1;
      }
      else if (value && typeof value === 'object') {
        converted[key] = convertDates(value);
      } else {
        converted[key] = value;
      }
    }
    return converted;
  }

  return obj;
}

async function importData() {
  try {
    console.log('Reading exported data...\n');
    const rawData = fs.readFileSync('./exported-data.json', 'utf-8');
    const data = convertDates(JSON.parse(rawData));

    console.log('Importing data to PostgreSQL...\n');

    // Import in order of dependencies

    // 1. Users (no dependencies)
    if (data.users && data.users.length > 0) {
      console.log(`Importing ${data.users.length} users...`);
      for (const user of data.users) {
        await prisma.user.upsert({
          where: { id: user.id },
          update: user,
          create: user
        });
      }
      console.log('✓ Users imported\n');
    }

    // 2. Categories (no dependencies)
    if (data.categories && data.categories.length > 0) {
      console.log(`Importing ${data.categories.length} categories...`);
      for (const category of data.categories) {
        await prisma.category.upsert({
          where: { id: category.id },
          update: category,
          create: category
        });
      }
      console.log('✓ Categories imported\n');
    }

    // 3. Authors (no dependencies)
    if (data.authors && data.authors.length > 0) {
      console.log(`Importing ${data.authors.length} authors...`);
      for (const author of data.authors) {
        await prisma.author.upsert({
          where: { id: author.id },
          update: author,
          create: author
        });
      }
      console.log('✓ Authors imported\n');
    }

    // 4. Reviewers (no dependencies)
    if (data.reviewers && data.reviewers.length > 0) {
      console.log(`Importing ${data.reviewers.length} reviewers...`);
      for (const reviewer of data.reviewers) {
        await prisma.reviewer.upsert({
          where: { id: reviewer.id },
          update: reviewer,
          create: reviewer
        });
      }
      console.log('✓ Reviewers imported\n');
    }

    // 5. Articles (depends on: users, categories, authors)
    if (data.articles && data.articles.length > 0) {
      console.log(`Importing ${data.articles.length} articles...`);
      let count = 0;
      for (const article of data.articles) {
        await prisma.article.upsert({
          where: { id: article.id },
          update: article,
          create: article
        });
        count++;
        if (count % 20 === 0) {
          process.stdout.write(`  ${count}/${data.articles.length}...\r`);
        }
      }
      console.log(`✓ Articles imported (${data.articles.length})\n`);
    }

    // 6. Reviews (depends on: users, categories, authors, reviewers)
    if (data.reviews && data.reviews.length > 0) {
      console.log(`Importing ${data.reviews.length} reviews...`);
      for (const review of data.reviews) {
        await prisma.review.upsert({
          where: { id: review.id },
          update: review,
          create: review
        });
      }
      console.log('✓ Reviews imported\n');
    }

    // 7. Review-Reviewer relationships
    if (data.review_reviewers && data.review_reviewers.length > 0) {
      console.log(`Importing ${data.review_reviewers.length} review-reviewer relationships...`);
      for (const rr of data.review_reviewers) {
        await prisma.reviewReviewer.upsert({
          where: {
            reviewId_reviewerId: {
              reviewId: rr.reviewId,
              reviewerId: rr.reviewerId
            }
          },
          update: rr,
          create: rr
        });
      }
      console.log('✓ Review-Reviewer relationships imported\n');
    }

    // 8. Dentist Directory (no dependencies)
    if (data.dentist_directory && data.dentist_directory.length > 0) {
      console.log(`Importing ${data.dentist_directory.length} dentist directory entries...`);
      for (const dentist of data.dentist_directory) {
        await prisma.dentistDirectory.upsert({
          where: { id: dentist.id },
          update: dentist,
          create: dentist
        });
      }
      console.log('✓ Dentist Directory imported\n');
    }

    // 9. Media (no dependencies)
    if (data.media && data.media.length > 0) {
      console.log(`Importing ${data.media.length} media files...`);
      let count = 0;
      for (const media of data.media) {
        await prisma.media.upsert({
          where: { id: media.id },
          update: media,
          create: media
        });
        count++;
        if (count % 100 === 0) {
          process.stdout.write(`  ${count}/${data.media.length}...\r`);
        }
      }
      console.log(`✓ Media imported (${data.media.length})\n`);
    }

    // 10. Redirects (no dependencies)
    if (data.redirects && data.redirects.length > 0) {
      console.log(`Importing ${data.redirects.length} redirects...`);
      for (const redirect of data.redirects) {
        await prisma.redirect.upsert({
          where: { id: redirect.id },
          update: redirect,
          create: redirect
        });
      }
      console.log('✓ Redirects imported\n');
    }

    // 11. Clinic Submissions
    if (data.clinic_submissions && data.clinic_submissions.length > 0) {
      console.log(`Importing ${data.clinic_submissions.length} clinic submissions...`);
      for (const submission of data.clinic_submissions) {
        await prisma.clinicSubmission.upsert({
          where: { id: submission.id },
          update: submission,
          create: submission
        });
      }
      console.log('✓ Clinic Submissions imported\n');
    }

    // 12. Analytics Snippets
    if (data.analytics_snippets && data.analytics_snippets.length > 0) {
      console.log(`Importing ${data.analytics_snippets.length} analytics snippets...`);
      for (const snippet of data.analytics_snippets) {
        await prisma.analyticsSnippet.upsert({
          where: { id: snippet.id },
          update: snippet,
          create: snippet
        });
      }
      console.log('✓ Analytics Snippets imported\n');
    }

    // 13. SEO Settings
    if (data.seo_settings && data.seo_settings.length > 0) {
      console.log(`Importing ${data.seo_settings.length} SEO settings...`);
      for (const settings of data.seo_settings) {
        await prisma.seoSettings.upsert({
          where: { id: settings.id },
          update: settings,
          create: settings
        });
      }
      console.log('✓ SEO Settings imported\n');
    }

    const totalRecords = (data.users?.length || 0) +
                        (data.categories?.length || 0) +
                        (data.authors?.length || 0) +
                        (data.reviewers?.length || 0) +
                        (data.articles?.length || 0) +
                        (data.reviews?.length || 0) +
                        (data.review_reviewers?.length || 0) +
                        (data.dentist_directory?.length || 0) +
                        (data.media?.length || 0) +
                        (data.redirects?.length || 0) +
                        (data.clinic_submissions?.length || 0) +
                        (data.analytics_snippets?.length || 0) +
                        (data.seo_settings?.length || 0);

    console.log('✅ Import completed successfully!');
    console.log(`Total records imported: ${totalRecords}`);

  } catch (error) {
    console.error('❌ Error during import:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

importData();
