import { prisma } from '../src/lib/prisma'

async function checkAdmin() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true
    }
  })

  console.log('Admin users in database:')
  console.log(JSON.stringify(users, null, 2))

  if (users.length === 0) {
    console.log('\nNo admin users found. You need to create one.')
  }

  await prisma.$disconnect()
}

checkAdmin()
