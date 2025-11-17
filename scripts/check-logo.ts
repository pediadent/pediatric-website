import { prisma } from '../src/lib/prisma'

async function checkLogo() {
  const dentists = await prisma.dentistDirectory.findMany({
    where: {
      name: {
        contains: 'Kids Dental Studio'
      }
    },
    select: {
      id: true,
      name: true,
      logo: true,
      slug: true
    }
  })

  console.log('Found dentists:', JSON.stringify(dentists, null, 2))

  await prisma.$disconnect()
}

checkLogo()
