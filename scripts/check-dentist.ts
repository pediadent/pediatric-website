import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const dentist = await prisma.dentistDirectory.findFirst({
    where: { slug: 'jeffrey-katz-d-d-s' }
  })

  console.log('Dentist data:')
  console.log('Name:', dentist?.name)
  console.log('Slug:', dentist?.slug)
  console.log('About:', dentist?.about ? 'EXISTS (' + dentist.about.length + ' chars)' : 'MISSING')
  console.log('Phone:', dentist?.phone)
  console.log('Website:', dentist?.website)
  console.log('Address:', dentist?.address)
  console.log('Insurances:', dentist?.insurances ? 'EXISTS (' + dentist.insurances.length + ' chars)' : 'MISSING')
  console.log('Working Hours:', dentist?.workingHours)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
