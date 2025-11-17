import { prisma } from '../src/lib/prisma'

async function addDefaultReviewCount() {
  // Set default review count of 10 for all dentists without a review count
  const result = await prisma.dentistDirectory.updateMany({
    where: {
      reviewCount: null
    },
    data: {
      reviewCount: 10
    }
  })

  console.log(`✅ Added default review count (10) to ${result.count} dentists`)

  await prisma.$disconnect()
}

addDefaultReviewCount()
