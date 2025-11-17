'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import ReCAPTCHA from 'react-google-recaptcha'
import { validateEmail } from '@/lib/utils'

type FormState = {
  name: string
  contactName: string
  email: string
  phone: string
  website: string
  address: string
  city: string
  state: string
  postalCode: string
  description: string
  services: string
  officeHours: string
  insurances: string
  googleMapLink: string
  directionsUrl: string
  logoUrl: string
  heroImageUrl: string
  galleryUrls: string
  additionalInfo: string
}

const initialFormState: FormState = {
  name: '',
  contactName: '',
  email: '',
  phone: '',
  website: '',
  address: '',
  city: '',
  state: '',
  postalCode: '',
  description: '',
  services: '',
  officeHours: '',
  insurances: '',
  googleMapLink: '',
  directionsUrl: '',
  logoUrl: '',
  heroImageUrl: '',
  galleryUrls: '',
  additionalInfo: ''
}

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? ''

export default function SubmitClinicPage() {
  const [formState, setFormState] = useState<FormState>(initialFormState)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const recaptchaRef = useRef<ReCAPTCHA | null>(null)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target
    setFormState((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    if (!formState.name.trim()) {
      setError('Please provide the clinic name.')
      return
    }

    if (!validateEmail(formState.email)) {
      setError('Please enter a valid clinic email address.')
      return
    }

    if (!captchaToken) {
      setError('Please complete the captcha to confirm you are human.')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch('/api/dentists/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formState,
          galleryUrls: formState.galleryUrls
            ? formState.galleryUrls
                .split('\n')
                .map((url) => url.trim())
                .filter(Boolean)
            : [],
          captchaToken
        })
      })

      const data = await response.json()
      if (!response.ok) {
        setError(data.error || 'Unable to submit clinic details. Please try again.')
      } else {
        setSuccess(data.message || 'Thanks! We will review your clinic listing shortly.')
        setFormState(initialFormState)
        setCaptchaToken(null)
        recaptchaRef.current?.reset()
      }
    } catch (submissionError) {
      console.error('Clinic submission error:', submissionError)
      setError('Something went wrong while submitting. Please try again shortly.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-neutral-50 min-h-screen">
      <section className="relative overflow-hidden bg-gradient-to-br from-sky-50 via-white to-indigo-50">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -left-24 top-12 h-72 w-72 rounded-full bg-sky-100 blur-3xl" />
          <div className="absolute -right-20 bottom-8 h-96 w-96 rounded-full bg-indigo-100 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl px-6 py-20 text-center">
          <span className="inline-flex items-center rounded-full border border-sky-200 bg-white/80 px-4 py-2 text-sm font-semibold uppercase tracking-wider text-sky-600 shadow-sm">
            Business Directory Submission
          </span>
          <h1 className="mt-5 text-4xl font-extrabold text-neutral-900 sm:text-5xl">
            List Your Pediatric Dental Clinic
          </h1>
          <p className="mt-6 text-lg text-neutral-600 sm:text-xl">
            Share your clinic details so families can easily discover your services in our pediatric dental
            directory.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="relative -mt-16 rounded-3xl border border-neutral-200 bg-white shadow-xl shadow-sky-100/40">
          <div className="border-b border-neutral-200 bg-neutral-50/60 px-8 py-6 rounded-t-3xl">
            <h2 className="text-2xl font-semibold text-neutral-900">
              Clinic Information Form
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              Provide as much detail as possible. Our team reviews every submission before publishing it to the directory.
            </p>
          </div>

          <form className="space-y-10 px-8 py-10" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {success}
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Clinic name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formState.name}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-2xl border border-neutral-300 px-4 py-3 text-neutral-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition"
                  placeholder="Smiles Pediatric Dentistry"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Primary contact name
                </label>
                <input
                  type="text"
                  name="contactName"
                  value={formState.contactName}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border border-neutral-300 px-4 py-3 text-neutral-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition"
                  placeholder="Dr. Taylor Jensen"
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Clinic email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formState.email}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-2xl border border-neutral-300 px-4 py-3 text-neutral-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition"
                  placeholder="hello@yourclinic.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Phone number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formState.phone}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border border-neutral-300 px-4 py-3 text-neutral-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={formState.website}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border border-neutral-300 px-4 py-3 text-neutral-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition"
                  placeholder="https://yourclinic.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Google Maps or GMB link
                </label>
                <input
                  type="url"
                  name="googleMapLink"
                  value={formState.googleMapLink}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border border-neutral-300 px-4 py-3 text-neutral-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition"
                  placeholder="https://maps.google.com/..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Street address
              </label>
              <input
                type="text"
                name="address"
                value={formState.address}
                onChange={handleInputChange}
                className="w-full rounded-2xl border border-neutral-300 px-4 py-3 text-neutral-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition"
                placeholder="123 Queens Blvd Suite 400"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formState.city}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border border-neutral-300 px-4 py-3 text-neutral-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition"
                  placeholder="Queens"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  State / Region
                </label>
                <input
                  type="text"
                  name="state"
                  value={formState.state}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border border-neutral-300 px-4 py-3 text-neutral-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition"
                  placeholder="NY"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Postal code
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={formState.postalCode}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border border-neutral-300 px-4 py-3 text-neutral-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition"
                  placeholder="11427"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Clinic overview / about
              </label>
              <textarea
                name="description"
                value={formState.description}
                onChange={handleInputChange}
                rows={5}
                className="w-full rounded-2xl border border-neutral-300 px-4 py-3 text-neutral-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition"
                placeholder="Tell families about your pediatric dental philosophy, services, and experience."
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Services offered
                </label>
                <textarea
                  name="services"
                  value={formState.services}
                  onChange={handleInputChange}
                  rows={5}
                  className="w-full rounded-2xl border border-neutral-300 px-4 py-3 text-neutral-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition"
                  placeholder="List key pediatric dental services, separated by commas."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Office hours
                </label>
                <textarea
                  name="officeHours"
                  value={formState.officeHours}
                  onChange={handleInputChange}
                  rows={5}
                  className="w-full rounded-2xl border border-neutral-300 px-4 py-3 text-neutral-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition"
                  placeholder="Example: Mon–Fri 8am-5pm, Sat 9am-1pm"
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Insurance plans accepted
                </label>
                <textarea
                  name="insurances"
                  value={formState.insurances}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full rounded-2xl border border-neutral-300 px-4 py-3 text-neutral-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition"
                  placeholder="List major insurance partners or payment options."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Directions URL
                </label>
                <input
                  type="url"
                  name="directionsUrl"
                  value={formState.directionsUrl}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border border-neutral-300 px-4 py-3 text-neutral-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition"
                  placeholder="Link to directions on your site or Google Maps"
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Logo URL
                </label>
                <input
                  type="url"
                  name="logoUrl"
                  value={formState.logoUrl}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border border-neutral-300 px-4 py-3 text-neutral-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition"
                  placeholder="https://cdn.yoursite.com/logo.png"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Featured / hero image URL
                </label>
                <input
                  type="url"
                  name="heroImageUrl"
                  value={formState.heroImageUrl}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border border-neutral-300 px-4 py-3 text-neutral-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition"
                  placeholder="https://cdn.yoursite.com/hero.jpg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Gallery image URLs (one per line)
              </label>
              <textarea
                name="galleryUrls"
                value={formState.galleryUrls}
                onChange={handleInputChange}
                rows={4}
                className="w-full rounded-2xl border border-neutral-300 px-4 py-3 text-neutral-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition"
                placeholder="https://cdn.yoursite.com/gallery/image-1.jpg&#10;https://cdn.yoursite.com/gallery/image-2.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Anything else we should know?
              </label>
              <textarea
                name="additionalInfo"
                value={formState.additionalInfo}
                onChange={handleInputChange}
                rows={4}
                className="w-full rounded-2xl border border-neutral-300 px-4 py-3 text-neutral-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition"
                placeholder="Share awards, languages spoken, special equipment, community programs, etc."
              />
            </div>

            <div className="space-y-3">
              {RECAPTCHA_SITE_KEY ? (
                <ReCAPTCHA
                  sitekey={RECAPTCHA_SITE_KEY}
                  ref={recaptchaRef}
                  onChange={(token) => setCaptchaToken(token)}
                  onExpired={() => setCaptchaToken(null)}
                />
              ) : (
                <p className="rounded-2xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-700">
                  reCAPTCHA keys are not configured. Set <code className="font-mono">NEXT_PUBLIC_RECAPTCHA_SITE_KEY</code> and <code className="font-mono">RECAPTCHA_SECRET_KEY</code> to enable human verification.
                </p>
              )}
              <p className="text-xs text-neutral-500">
                This site is protected by reCAPTCHA and the Google{' '}
                <Link
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-600 hover:text-sky-700"
                >
                  Privacy Policy
                </Link>{' '}
                and{' '}
                <Link
                  href="https://policies.google.com/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-600 hover:text-sky-700"
                >
                  Terms of Service
                </Link>{' '}
                apply.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting || (!RECAPTCHA_SITE_KEY && process.env.NODE_ENV === 'production')}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-sky-200 transition hover:-translate-y-0.5 hover:from-sky-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Submitting clinic...' : 'Submit clinic for review'}
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}
