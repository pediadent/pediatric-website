import { prisma } from '../src/lib/prisma'
import { rename } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

async function fixMediaExtensions() {
  console.log('Finding media with wrong extensions...')

  const allMedia = await prisma.media.findMany()

  for (const media of allMedia) {
    const wrongExt = media.path.endsWith('.png') || media.path.endsWith('.gif') || media.path.endsWith('.webp')
    const filename = media.filename

    if (wrongExt && filename.endsWith('.png')) {
      const oldPath = join(process.cwd(), 'public', media.path)
      const newFilename = filename.replace(/\.png$/, '.jpg')
      const newPath = media.path.replace(/\.png$/, '.jpg')
      const newFullPath = join(process.cwd(), 'public', newPath)

      if (existsSync(oldPath)) {
        try {
          await rename(oldPath, newFullPath)
          console.log(`Renamed: ${filename} -> ${newFilename}`)

          await prisma.media.update({
            where: { id: media.id },
            data: {
              filename: newFilename,
              path: newPath,
              mimeType: 'image/jpeg'
            }
          })

          console.log(`Updated database for: ${media.id}`)
        } catch (error) {
          console.error(`Failed to rename ${filename}:`, error)
        }
      }
    }
  }

  // Also update any dentist logos with wrong extension
  const dentists = await prisma.dentistDirectory.findMany({
    where: {
      logo: {
        contains: '.png'
      }
    }
  })

  for (const dentist of dentists) {
    if (dentist.logo) {
      const newLogo = dentist.logo.replace(/\.png$/, '.jpg')
      await prisma.dentistDirectory.update({
        where: { id: dentist.id },
        data: { logo: newLogo }
      })
      console.log(`Updated dentist logo: ${dentist.name}`)
    }
  }

  console.log('Done!')
  await prisma.$disconnect()
}

fixMediaExtensions()
