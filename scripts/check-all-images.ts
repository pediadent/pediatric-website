import { prisma } from '../src/lib/prisma'

async function checkImages() {
  const dentists = await prisma.dentistDirectory.findMany({
    where: {
      name: {
        contains: 'Kids Dental Studio'
      }
    },
    select: {
      id: true,
      name: true,
      slug: true,
      image: true,
      logo: true,
      googleReviewsImage: true
    }
  })

  console.log('Dentist images:')
  console.log(JSON.stringify(dentists, null, 2))

  await prisma.$disconnect()
}

checkImages()
