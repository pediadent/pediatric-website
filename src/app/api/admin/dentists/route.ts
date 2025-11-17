import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth(request)
  if ('response' in auth) {
    return auth.response
  }

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search')
    const isActive = searchParams.get('isActive')

    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true'
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [dentists, total] = await Promise.all([
      prisma.dentistDirectory.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.dentistDirectory.count({ where })
    ])

    return NextResponse.json({
      dentists,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching dentists:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dentists' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminAuth(request)
  if ('response' in auth) {
    return auth.response
  }

  try {
    const body = await request.json()

    const {
      name,
      slug,
      description,
      address,
      phone,
      website,
      email,
      rating,
      image,
      services,
      workingHours,
      seoTitle,
      seoDescription,
      isNoIndex,
      isNoFollow,
      schema,
      isActive = true
    } = body

    // Check if slug already exists
    const existingDentist = await prisma.dentistDirectory.findUnique({
      where: { slug }
    })

    if (existingDentist) {
      return NextResponse.json(
        { error: 'Dentist with this slug already exists' },
        { status: 400 }
      )
    }

    const dentist = await prisma.dentistDirectory.create({
      data: {
        name,
        slug,
        description,
        address,
        phone,
        website,
        email,
        rating,
        image,
        services,
        workingHours,
        seoTitle,
        seoDescription,
        isNoIndex,
        isNoFollow,
        schema,
        isActive
      }
    })

    return NextResponse.json(dentist, { status: 201 })
  } catch (error) {
    console.error('Error creating dentist:', error)
    return NextResponse.json(
      { error: 'Failed to create dentist' },
      { status: 500 }
    )
  }
}
