import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.dentistDirectory.updateMany({
    data: {
      logo: 'https://placehold.co/400x200/3b82f6/ffffff?text=Dental+Clinic',
      directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=40.7128,-74.0060'
    }
  })

  console.log('✅ Updated all dentists with default logo and directions URL')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
