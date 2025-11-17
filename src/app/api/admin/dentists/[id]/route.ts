import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdminAuth(request)
  if ('response' in auth) {
    return auth.response
  }

  try {
    const dentist = await prisma.dentistDirectory.findUnique({
      where: { id: params.id }
    })

    if (!dentist) {
      return NextResponse.json(
        { error: 'Dentist not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(dentist)
  } catch (error) {
    console.error('Error fetching dentist:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dentist' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdminAuth(request)
  if ('response' in auth) {
    return auth.response
  }

  try {
    const body = await request.json()

    console.log('=== Updating dentist:', params.id, '===')
    console.log('Received data:')
    console.log('- Featured Image:', body.image)
    console.log('- Logo:', body.logo)
    console.log('- Rating:', body.rating)
    console.log('- Review Count:', body.reviewCount)

    const {
      name,
      slug,
      description,
      about,
      address,
      phone,
      website,
      email,
      rating,
      reviewCount,
      image,
      logo,
      services,
      workingHours,
      insurances,
      gmapLink,
      directionsUrl,
      embeddedMap,
      seoTitle,
      seoDescription,
      isNoIndex,
      isNoFollow,
      schema,
      isActive
    } = body

    // Check if slug is taken by another dentist
    if (slug) {
      const existingDentist = await prisma.dentistDirectory.findFirst({
        where: {
          slug,
          id: { not: params.id }
        }
      })

      if (existingDentist) {
        return NextResponse.json(
          { error: 'Dentist with this slug already exists' },
          { status: 400 }
        )
      }
    }

    const dentist = await prisma.dentistDirectory.update({
      where: { id: params.id },
      data: {
        name,
        slug,
        description,
        about,
        address,
        phone,
        website,
        email,
        rating,
        reviewCount,
        image,
        logo,
        services,
        workingHours,
        insurances,
        gmapLink,
        directionsUrl,
        embeddedMap,
        seoTitle,
        seoDescription,
        isNoIndex,
        isNoFollow,
        schema,
        isActive
      }
    })

    console.log('=== Dentist updated successfully ===')
    console.log('Saved values:')
    console.log('- Featured Image:', dentist.image)
    console.log('- Logo:', dentist.logo)
    console.log('- Google Reviews Image:', dentist.googleReviewsImage)

    return NextResponse.json(dentist)
  } catch (error) {
    console.error('Error updating dentist:', error)
    return NextResponse.json(
      { error: 'Failed to update dentist' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdminAuth(request)
  if ('response' in auth) {
    return auth.response
  }

  try {
    await prisma.dentistDirectory.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Dentist deleted successfully' })
  } catch (error) {
    console.error('Error deleting dentist:', error)
    return NextResponse.json(
      { error: 'Failed to delete dentist' },
      { status: 500 }
    )
  }
}
