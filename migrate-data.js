const { PrismaClient } = require('@prisma/client');

// SQLite source
const sourcePrisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db'
    }
  }
});

// PostgreSQL destination (from environment)
const destPrisma = new PrismaClient();

async function migrateData() {
  console.log('Starting data migration from SQLite to PostgreSQL...\n');

  try {
    // Check what data exists in SQLite
    const [users, categories, authors, articles, reviews, reviewers, dentists, media] = await Promise.all([
      sourcePrisma.user.findMany(),
      sourcePrisma.category.findMany(),
      sourcePrisma.author.findMany(),
      sourcePrisma.article.findMany(),
      sourcePrisma.review.findMany(),
      sourcePrisma.reviewer.findMany(),
      sourcePrisma.dentistDirectory.findMany(),
      sourcePrisma.media.findMany()
    ]);

    console.log('Found data in SQLite:');
    console.log(`- Users: ${users.length}`);
    console.log(`- Categories: ${categories.length}`);
    console.log(`- Authors: ${authors.length}`);
    console.log(`- Articles: ${articles.length}`);
    console.log(`- Reviews: ${reviews.length}`);
    console.log(`- Reviewers: ${reviewers.length}`);
    console.log(`- Dentist Directory: ${dentists.length}`);
    console.log(`- Media: ${media.length}\n`);

    const totalRecords = users.length + categories.length + authors.length +
                        articles.length + reviews.length + reviewers.length +
                        dentists.length + media.length;

    if (totalRecords === 0) {
      console.log('No data found in SQLite database. Nothing to migrate.');
      return;
    }

    console.log('Migrating data to PostgreSQL...\n');

    // Migrate in correct order (respecting foreign key constraints)

    // 1. Users (no dependencies)
    if (users.length > 0) {
      console.log(`Migrating ${users.length} users...`);
      for (const user of users) {
        await destPrisma.user.create({ data: user });
      }
      console.log('✓ Users migrated\n');
    }

    // 2. Categories (no dependencies)
    if (categories.length > 0) {
      console.log(`Migrating ${categories.length} categories...`);
      for (const category of categories) {
        await destPrisma.category.create({ data: category });
      }
      console.log('✓ Categories migrated\n');
    }

    // 3. Authors (no dependencies)
    if (authors.length > 0) {
      console.log(`Migrating ${authors.length} authors...`);
      for (const author of authors) {
        await destPrisma.author.create({ data: author });
      }
      console.log('✓ Authors migrated\n');
    }

    // 4. Reviewers (no dependencies)
    if (reviewers.length > 0) {
      console.log(`Migrating ${reviewers.length} reviewers...`);
      for (const reviewer of reviewers) {
        await destPrisma.reviewer.create({ data: reviewer });
      }
      console.log('✓ Reviewers migrated\n');
    }

    // 5. Articles (depends on: users, categories, authors)
    if (articles.length > 0) {
      console.log(`Migrating ${articles.length} articles...`);
      for (const article of articles) {
        await destPrisma.article.create({ data: article });
      }
      console.log('✓ Articles migrated\n');
    }

    // 6. Reviews (depends on: users, categories, authors, reviewers)
    if (reviews.length > 0) {
      console.log(`Migrating ${reviews.length} reviews...`);
      // Get review-reviewer relationships first
      const reviewReviewers = await sourcePrisma.reviewReviewer.findMany();

      for (const review of reviews) {
        // Create review without the many-to-many relationship first
        const { reviewers: _, ...reviewData } = review;
        await destPrisma.review.create({ data: reviewData });
      }

      // Then create the relationships
      if (reviewReviewers.length > 0) {
        console.log(`Migrating ${reviewReviewers.length} review-reviewer relationships...`);
        for (const rr of reviewReviewers) {
          await destPrisma.reviewReviewer.create({ data: rr });
        }
      }
      console.log('✓ Reviews migrated\n');
    }

    // 7. Dentist Directory (no dependencies)
    if (dentists.length > 0) {
      console.log(`Migrating ${dentists.length} dentist directory entries...`);
      for (const dentist of dentists) {
        await destPrisma.dentistDirectory.create({ data: dentist });
      }
      console.log('✓ Dentist Directory migrated\n');
    }

    // 8. Media (no dependencies)
    if (media.length > 0) {
      console.log(`Migrating ${media.length} media files...`);
      for (const m of media) {
        await destPrisma.media.create({ data: m });
      }
      console.log('✓ Media migrated\n');
    }

    console.log('✅ Data migration completed successfully!');
    console.log(`Total records migrated: ${totalRecords}`);

  } catch (error) {
    console.error('❌ Error during migration:', error);
    process.exit(1);
  } finally {
    await sourcePrisma.$disconnect();
    await destPrisma.$disconnect();
  }
}

migrateData();
