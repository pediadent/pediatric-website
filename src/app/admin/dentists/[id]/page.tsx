'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { AdminWrapper } from '@/components/admin/AdminWrapper'
import { MediaUpload } from '@/components/admin/MediaUpload'
import { SchemaEditor } from '@/components/admin/SchemaEditor'

export default function EditDentistPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    about: '',
    address: '',
    phone: '',
    website: '',
    email: '',
    rating: '',
    reviewCount: '',
    image: '',
    logo: '',
    services: '',
    workingHours: JSON.stringify({
      monday: '9:00 AM – 6:00 PM',
      tuesday: '9:00 AM – 6:00 PM',
      wednesday: '9:00 AM – 6:00 PM',
      thursday: '9:00 AM – 6:00 PM',
      friday: '9:00 AM – 5:00 PM',
      saturday: 'By appointment',
      sunday: 'Closed'
    }, null, 2),
    insurances: '',
    gmapLink: '',
    directionsUrl: '',
    embeddedMap: '',
    seoTitle: '',
    seoDescription: '',
    isNoIndex: false,
    isNoFollow: false,
    schema: '',
    isActive: true
  })

  useEffect(() => {
    if (id) {
      fetchDentist()
    }
  }, [id])

  const fetchDentist = async () => {
    try {
      setFetching(true)
      const response = await fetch(`/api/admin/dentists/${id}`)

      if (!response.ok) {
        throw new Error('Failed to fetch dentist')
      }

      const data = await response.json()

      // Parse services from JSON array to comma-separated string
      let servicesString = ''
      if (data.services) {
        try {
          const servicesArray = JSON.parse(data.services)
          servicesString = Array.isArray(servicesArray) ? servicesArray.join(', ') : ''
        } catch {
          servicesString = ''
        }
      }

      // Parse and pretty-print workingHours
      let workingHoursString = ''
      if (data.workingHours) {
        try {
          const workingHoursObj = JSON.parse(data.workingHours)
          workingHoursString = JSON.stringify(workingHoursObj, null, 2)
        } catch {
          workingHoursString = data.workingHours
        }
      }

      console.log('=== Loaded dentist data ===')
      console.log('- Featured Image:', data.image)
      console.log('- Logo:', data.logo)

      setFormData({
        name: data.name || '',
        slug: data.slug || '',
        description: data.description || '',
        about: data.about || '',
        address: data.address || '',
        phone: data.phone || '',
        website: data.website || '',
        email: data.email || '',
        rating: data.rating?.toString() || '',
        reviewCount: data.reviewCount?.toString() || '',
        image: data.image || '',
        logo: data.logo || '',
        services: servicesString,
        workingHours: workingHoursString,
        insurances: data.insurances || '',
        gmapLink: data.gmapLink || '',
        directionsUrl: data.directionsUrl || '',
        embeddedMap: data.embeddedMap || '',
        seoTitle: data.seoTitle || '',
        seoDescription: data.seoDescription || '',
        isNoIndex: data.isNoIndex || false,
        isNoFollow: data.isNoFollow || false,
        schema: data.schema || '',
        isActive: data.isActive !== undefined ? data.isActive : true
      })
    } catch (error) {
      console.error('Error fetching dentist:', error)
      alert('Failed to load dentist data')
      router.push('/admin/dentists')
    } finally {
      setFetching(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Parse services (comma-separated to JSON array)
      const servicesArray = formData.services
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0)

      // Parse working hours
      let workingHoursObj
      try {
        workingHoursObj = JSON.parse(formData.workingHours)
      } catch {
        alert('Invalid working hours JSON format')
        setLoading(false)
        return
      }

      const dataToSend = {
        ...formData,
        rating: formData.rating ? parseFloat(formData.rating) : null,
        reviewCount: formData.reviewCount ? parseInt(formData.reviewCount) : null,
        services: JSON.stringify(servicesArray),
        workingHours: JSON.stringify(workingHoursObj)
      }

      console.log('Submitting dentist data:')
      console.log('- Featured Image:', dataToSend.image)
      console.log('- Logo:', dataToSend.logo)

      const response = await fetch(`/api/admin/dentists/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      })

      if (response.ok) {
        router.push('/admin/dentists')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update dentist')
      }
    } catch (error) {
      console.error('Error updating dentist:', error)
      alert('Failed to update dentist')
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = () => {
    const slug = formData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
    setFormData({ ...formData, slug })
  }

  const handleImageUpload = (url: string) => {
    console.log('Featured image uploaded:', url)
    setFormData({ ...formData, image: url })
  }

  const handleLogoUpload = (url: string) => {
    console.log('Logo uploaded:', url)
    setFormData({ ...formData, logo: url })
  }


  const handleSchemaChange = (schema: string) => {
    setFormData({ ...formData, schema })
  }

  if (fetching) {
    return (
      <AdminWrapper>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading dentist data...</span>
          </div>
        </div>
      </AdminWrapper>
    )
  }

  return (
    <AdminWrapper>
      <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Dentist</h1>
          <p className="text-gray-600 mt-1">Update dentist information</p>
        </div>
        <Link
          href="/admin/dentists"
          className="text-gray-600 hover:text-gray-900 font-medium"
        >
          ← Back to Dentists
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Basic Information */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                onBlur={generateSlug}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug *
              </label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Featured Image</h2>
          <MediaUpload
            onUpload={handleImageUpload}
            currentImage={formData.image}
          />
        </div>

        {/* Logo Upload */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Logo</h2>
          <MediaUpload
            onUpload={handleLogoUpload}
            currentImage={formData.logo}
          />
          <p className="mt-2 text-sm text-gray-500">This logo will appear in the About section</p>
        </div>

        {/* About Section */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">About Content</h2>
          <textarea
            rows={6}
            value={formData.about}
            onChange={(e) => setFormData({ ...formData, about: e.target.value })}
            placeholder="About this dentist..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Contact Information */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rating (1-5)
              </label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="5"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Review Count
              </label>
              <input
                type="number"
                min="0"
                value={formData.reviewCount}
                onChange={(e) => setFormData({ ...formData, reviewCount: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="10"
              />
            </div>
          </div>
        </div>

        {/* Services */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Services (comma-separated)
          </label>
          <textarea
            rows={3}
            value={formData.services}
            onChange={(e) => setFormData({ ...formData, services: e.target.value })}
            placeholder="Pediatric dentistry, Preventive care, Dental cleanings"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Working Hours */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Working Hours (JSON format)
          </label>
          <textarea
            rows={8}
            value={formData.workingHours}
            onChange={(e) => setFormData({ ...formData, workingHours: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
          />
        </div>

        {/* Insurances */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dental Insurances Accepted
          </label>
          <textarea
            rows={4}
            value={formData.insurances}
            onChange={(e) => setFormData({ ...formData, insurances: e.target.value })}
            placeholder="List of dental insurances accepted..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Maps & Directions */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Maps & Directions</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Google Maps Link (GMB)
              </label>
              <input
                type="url"
                value={formData.gmapLink}
                onChange={(e) => setFormData({ ...formData, gmapLink: e.target.value })}
                placeholder="https://www.google.com/maps/search/?api=1&query=40.7215754,-73.80497"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">Format: https://www.google.com/maps/search/?api=1&query=LAT,LNG</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Directions URL
              </label>
              <input
                type="url"
                value={formData.directionsUrl}
                onChange={(e) => setFormData({ ...formData, directionsUrl: e.target.value })}
                placeholder="https://maps.google.com/maps?daddr=..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">If added, a "Get Directions" button will appear in the About section</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Embedded Map HTML (iframe)
              </label>
              <textarea
                rows={4}
                value={formData.embeddedMap}
                onChange={(e) => setFormData({ ...formData, embeddedMap: e.target.value })}
                placeholder='<iframe src="https://maps.google.com/maps?q=..." width="100%" height="400"></iframe>'
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">Paste the full iframe embed code from Google Maps</p>
            </div>
          </div>
        </div>

        {/* SEO */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">SEO Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SEO Title
              </label>
              <input
                type="text"
                value={formData.seoTitle}
                onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SEO Description
              </label>
              <textarea
                rows={3}
                value={formData.seoDescription}
                onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center space-x-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isNoIndex}
                  onChange={(e) => setFormData({ ...formData, isNoIndex: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">
                  No Index (prevent search engines from indexing)
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isNoFollow}
                  onChange={(e) => setFormData({ ...formData, isNoFollow: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">
                  No Follow (prevent search engines from following links)
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Schema */}
        <div>
          <SchemaEditor
            initialSchema={formData.schema}
            onChange={handleSchemaChange}
            contentType="dentist"
          />
        </div>

        {/* Status */}
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm font-medium text-gray-700">
              Active (visible on website)
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Link
            href="/admin/dentists"
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Updating...' : 'Update Dentist'}
          </button>
        </div>
      </form>
    </div>
    </AdminWrapper>
  )
}
