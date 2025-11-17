# Content Import Guide

This guide explains how to use the comprehensive import scripts to migrate content from the live website.

## Overview

We have two main import scripts:

1. **`import-dentists.ts`** - Imports dentist directory listings
2. **`import-articles.ts`** - Imports all blog posts, news, reviews, and other articles

## Prerequisites

```bash
# Install dependencies
npm install cheerio

# Make sure Prisma is set up
npx prisma generate
npx prisma db push
```

## Importing Dentists

The dentist import script contains hardcoded data for all 18 dentists from the live site.

```bash
# Run the dentist import
npx tsx scripts/import-dentists.ts
```

**What it imports:**
- 18 pediatric dentist listings
- Complete contact information (name, address, phone, website)
- Working hours
- About descriptions
- Insurance information

## Importing Articles

The article import script dynamically crawls and imports content from all categories on the live site.

### Basic Usage

```bash
# Preview what would be imported (dry run)
npx tsx scripts/import-articles.ts --dry-run

# Import all articles from all categories
npx tsx scripts/import-articles.ts

# Import specific category only
npx tsx scripts/import-articles.ts --category=oral-health-tips

# Import with limit (useful for testing)
npx tsx scripts/import-articles.ts --limit=5 --dry-run
```

### Available Categories

- `oral-health-tips` - Blog posts about oral health
- `news` - Latest news articles
- `reviews` - Product reviews
- `salary` - Dental salary information
- `accessories` - Dental accessories
- `baby-and-child-health` - Baby and child health articles
- `charts` - Dental charts and guides
- `info` - General information articles

### Command Line Options

| Option | Description | Example |
|--------|-------------|---------|
| `--dry-run` | Preview without making changes | `--dry-run` |
| `--category=<slug>` | Import only specific category | `--category=news` |
| `--limit=<number>` | Limit articles per category | `--limit=10` |

### Examples

```bash
# Test import of first 3 articles from each category
npx tsx scripts/import-articles.ts --dry-run --limit=3

# Import only news articles
npx tsx scripts/import-articles.ts --category=news

# Import all oral health tips
npx tsx scripts/import-articles.ts --category=oral-health-tips

# Full import of everything
npx tsx scripts/import-articles.ts
```

## What Gets Imported

For each article, the script extracts:

- ✅ Title
- ✅ Content (HTML)
- ✅ Excerpt/Description
- ✅ Category
- ✅ Author
- ✅ Publication date
- ✅ Featured image
- ✅ SEO title and description
- ✅ Tags
- ✅ Slug (URL-friendly identifier)

## Import Process

### Step 1: Crawl Category Pages

The script visits each category page and extracts all article URLs.

```
Fetching article URLs from /oral-health-tips/...
  Page 1: https://pediatricdentistinqueensny.com/oral-health-tips/
    Found 10 articles
  Page 2: https://pediatricdentistinqueensny.com/oral-health-tips/page/2/
    Found 10 articles
  ...
Total articles found: 45
```

### Step 2: Extract Article Data

For each URL, the script fetches the page and extracts all relevant data.

```
[1/45] Processing: https://pediatricdentistinqueensny.com/article-slug/
  Creating: Article Title
```

### Step 3: Import to Database

Articles are created or updated in the database using upsert logic.

## Performance & Rate Limiting

- **Rate limiting**: 1.5 seconds between requests to avoid overloading the server
- **Estimated time**: ~3 seconds per article
- **200 articles**: Approximately 10 minutes

## Troubleshooting

### Error: "Category not found"

```bash
# List available categories
npx tsx scripts/import-articles.ts --category=invalid
```

### Error: "Failed to fetch"

- Check internet connection
- Verify live site is accessible
- Reduce rate by increasing timeout in script

### Error: "No content found"

- The HTML structure may have changed
- Check the selectors in `extractArticleData` function
- You may need to update the CSS selectors

### Duplicate Slugs

If two articles have the same slug, the script will update the existing article instead of creating a duplicate.

## Advanced Usage

### Modifying the Script

The import script is highly customizable. You can modify:

1. **Categories to import**: Edit the `CATEGORIES` array
2. **Content selectors**: Update the `contentSelectors` array
3. **Rate limiting**: Adjust `setTimeout` durations
4. **Data extraction**: Modify `extractArticleData` function

### Custom Category

To add a new category:

```typescript
const CATEGORIES = [
  // ... existing categories
  {
    name: 'Custom Category',
    slug: 'custom-category',
    path: '/custom-category/'
  },
]
```

### Selective Updates

To only update specific fields:

```typescript
// In importArticle function, modify the update data object
data: {
  title: articleData.title,
  content: articleData.content,
  // Remove or add fields as needed
}
```

## Best Practices

1. **Always test with --dry-run first**
   ```bash
   npx tsx scripts/import-articles.ts --dry-run
   ```

2. **Start with a limited import**
   ```bash
   npx tsx scripts/import-articles.ts --limit=5
   ```

3. **Import one category at a time**
   ```bash
   npx tsx scripts/import-articles.ts --category=oral-health-tips
   ```

4. **Backup database before full import**
   ```bash
   cp prisma/dev.db prisma/dev.db.backup
   ```

5. **Monitor the output** for errors and failed imports

## Post-Import Tasks

After importing:

1. ✅ Review imported content in admin panel
2. ✅ Check images are displaying correctly
3. ✅ Verify internal links work
4. ✅ Test search and filtering
5. ✅ Update any broken external links
6. ✅ Add missing featured images
7. ✅ Review and update SEO data

## Support

If you encounter issues:

1. Check the error message in console
2. Review the IMPORT_GUIDE.md (this file)
3. Inspect the HTML structure of the live site
4. Update CSS selectors if needed
5. Contact support with error details

## Notes

- The script preserves the original HTML formatting of articles
- Images URLs are kept as-is (external references to live site)
- Consider downloading and hosting images locally for better performance
- The script respects existing content and only updates if found
