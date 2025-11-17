import { prisma } from '../src/lib/prisma'

async function checkMedia() {
  const media = await prisma.media.findMany({
    orderBy: {
      createdAt: 'desc'
    },
    take: 10
  })

  console.log('Recent uploaded media:', JSON.stringify(media, null, 2))

  await prisma.$disconnect()
}

checkMedia()
