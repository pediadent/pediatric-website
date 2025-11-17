import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import sharp from 'sharp'
import { uploadRateLimit } from '@/lib/rateLimit'
import { sanitizeFilename } from '@/lib/validation'
import { requireAdminAuth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = uploadRateLimit(request)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  const auth = await requireAdminAuth(request)
  if ('response' in auth) {
    return auth.response
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images (JPEG, PNG, GIF, WebP) are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size <= 0 || file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Validate actual file content (magic bytes check)
    const magicBytes = buffer.slice(0, 4)
    const isPNG = magicBytes[0] === 0x89 && magicBytes[1] === 0x50
    const isJPEG = magicBytes[0] === 0xFF && magicBytes[1] === 0xD8
    const isGIF = magicBytes[0] === 0x47 && magicBytes[1] === 0x49
    const isWebP = magicBytes[0] === 0x52 && magicBytes[1] === 0x49

    if (!isPNG && !isJPEG && !isGIF && !isWebP) {
      return NextResponse.json(
        { error: 'File content does not match a valid image format' },
        { status: 400 }
      )
    }

    // Create upload directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Generate SEO-friendly filename
    const sanitizedName = sanitizeFilename(file.name)
    const nameWithoutExt = sanitizedName.substring(0, sanitizedName.lastIndexOf('.')) || sanitizedName

    // Create SEO-friendly slug from filename
    const seoSlug = nameWithoutExt
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 100) // Limit length

    // Process and optimize image
    let processedBuffer = buffer
    let finalExtension = 'jpg'

    try {
      if (file.type.startsWith('image/')) {
        // Convert to JPEG for consistency and optimization
        processedBuffer = await sharp(buffer)
          .resize(1920, 1080, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .jpeg({
            quality: 85,
            progressive: true
          })
          .toBuffer()

        finalExtension = 'jpg'
      }
    } catch (error) {
      console.log('Image processing failed, using original:', error)
      processedBuffer = buffer
      finalExtension = sanitizedName.split('.').pop() || 'jpg'
    }

    // Check if file exists and add suffix if needed
    let filename = `${seoSlug}.${finalExtension}`
    let filePath = join(uploadDir, filename)
    let counter = 1

    while (existsSync(filePath)) {
      filename = `${seoSlug}-${counter}.${finalExtension}`
      filePath = join(uploadDir, filename)
      counter++
    }

    // Save file
    await writeFile(filePath, processedBuffer)

    // Save to database
    const mediaRecord = await prisma.media.create({
      data: {
        filename,
        originalName: file.name,
        mimeType: file.type,
        size: processedBuffer.length,
        path: `/uploads/${filename}`,
        alt: '',
        caption: ''
      }
    })

    return NextResponse.json({
      id: mediaRecord.id,
      url: `/uploads/${filename}`,
      filename,
      originalName: file.name,
      size: processedBuffer.length,
      mimeType: file.type
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    )
  }
}

// GET endpoint to list uploaded media
export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth(request)
  if ('response' in auth) {
    return auth.response
  }

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { filename: { contains: search, mode: 'insensitive' } },
        { originalName: { contains: search, mode: 'insensitive' } },
        { alt: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [media, total] = await Promise.all([
      prisma.media.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.media.count({ where })
    ])

    return NextResponse.json({
      media,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching media:', error)
    return NextResponse.json(
      { error: 'Failed to fetch media' },
      { status: 500 }
    )
  }
}
