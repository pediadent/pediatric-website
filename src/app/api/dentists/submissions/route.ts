import { NextRequest, NextResponse } from 'next/server'
import { apiRateLimit } from '@/lib/rateLimit'
import { prisma } from '@/lib/prisma'
import { validateEmail } from '@/lib/utils'

type SubmissionPayload = {
  name?: string
  contactName?: string
  email?: string
  phone?: string
  website?: string
  address?: string
  city?: string
  state?: string
  postalCode?: string
  description?: string
  services?: string
  officeHours?: string
  insurances?: string
  googleMapLink?: string
  directionsUrl?: string
  logoUrl?: string
  heroImageUrl?: string
  galleryUrls?: string[]
  additionalInfo?: string
  captchaToken?: string
}

const verifyRecaptcha = async (token: string, remoteIp?: string | null) => {
  const secret = process.env.RECAPTCHA_SECRET_KEY

  if (!secret) {
    console.warn('RECAPTCHA_SECRET_KEY is not configured. Skipping verification.')
    return process.env.NODE_ENV !== 'production'
  }

  try {
    const params = new URLSearchParams({
      secret,
      response: token
    })

    if (remoteIp) {
      params.append('remoteip', remoteIp)
    }

    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params
    })

    const data = (await response.json()) as {
      success?: boolean
      score?: number
      'error-codes'?: string[]
    }

    if (!data.success) {
      console.warn('reCAPTCHA verification failed', data['error-codes'])
      return false
    }

    if (typeof data.score === 'number' && data.score < 0.5) {
      console.warn('reCAPTCHA score below threshold', data.score)
      return false
    }

    return true
  } catch (error) {
    console.error('reCAPTCHA verification error:', error)
    return false
  }
}

export async function POST(request: NextRequest) {
  const rateLimitResponse = apiRateLimit(request)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const body = (await request.json()) as SubmissionPayload
    const {
      name,
      contactName,
      email,
      phone,
      website,
      address,
      city,
      state,
      postalCode,
      description,
      services,
      officeHours,
      insurances,
      googleMapLink,
      directionsUrl,
      logoUrl,
      heroImageUrl,
      galleryUrls,
      additionalInfo,
      captchaToken
    } = body

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Clinic name and email are required.' },
        { status: 400 }
      )
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      )
    }

    if (!captchaToken) {
      return NextResponse.json(
        { error: 'Captcha verification is required.' },
        { status: 400 }
      )
    }

    const remoteIp =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip') ??
      null

    const captchaValid = await verifyRecaptcha(captchaToken, remoteIp)
    if (!captchaValid) {
      return NextResponse.json(
        { error: 'Captcha verification failed. Please try again.' },
        { status: 400 }
      )
    }

    await prisma.clinicSubmission.create({
      data: {
        name: name.trim(),
        contactName: contactName?.trim() || null,
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || null,
        website: website?.trim() || null,
        address: address?.trim() || null,
        city: city?.trim() || null,
        state: state?.trim() || null,
        postalCode: postalCode?.trim() || null,
        description: description?.trim() || null,
        services: services?.trim() || null,
        officeHours: officeHours?.trim() || null,
        insurances: insurances?.trim() || null,
        googleMapLink: googleMapLink?.trim() || null,
        directionsUrl: directionsUrl?.trim() || null,
        logoUrl: logoUrl?.trim() || null,
        heroImageUrl: heroImageUrl?.trim() || null,
        galleryUrls: galleryUrls && galleryUrls.length > 0 ? JSON.stringify(galleryUrls) : null,
        additionalInfo: additionalInfo?.trim() || null,
        submittedFromIp: remoteIp
      }
    })

    return NextResponse.json({ message: 'Thanks! Your clinic submission has been received.' })
  } catch (error) {
    console.error('Clinic submission failed:', error)
    return NextResponse.json(
      { error: 'Unable to submit clinic details right now. Please try again later.' },
      { status: 500 }
    )
  }
}
