'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline'
import { AdminWrapper } from '@/components/admin/AdminWrapper'

interface Dentist {
  id: string
  name: string
  slug: string
  address: string | null
  phone: string | null
  rating: number | null
  isActive: boolean
  createdAt: string
}

export default function DentistsPage() {
  const [dentists, setDentists] = useState<Dentist[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchDentists()
  }, [page, search])

  const fetchDentists = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search })
      })

      const response = await fetch(`/api/admin/dentists?${params}`, {
        credentials: 'include'
      })

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null)
        console.error('Failed to load dentists', errorBody)
        setDentists([])
        setTotalPages(1)
        return
      }

      const data = await response.json()
      setDentists(Array.isArray(data.dentists) ? data.dentists : [])
      setTotalPages(data?.pagination?.pages ?? 1)
    } catch (error) {
      console.error('Error fetching dentists:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this dentist?')) return

    try {
      const response = await fetch(`/api/admin/dentists/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        fetchDentists()
      } else {
        alert('Failed to delete dentist')
      }
    } catch (error) {
      console.error('Error deleting dentist:', error)
      alert('Failed to delete dentist')
    }
  }

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/dentists/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isActive: !currentStatus })
      })

      if (response.ok) {
        fetchDentists()
      }
    } catch (error) {
      console.error('Error updating dentist:', error)
    }
  }

  return (
    <AdminWrapper>
      <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dentist Directory</h1>
          <p className="text-gray-600 mt-1">Manage your pediatric dentist listings</p>
        </div>
        <Link
          href="/admin/dentists/new"
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Dentist
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <input
            type="text"
            placeholder="Search dentists..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : dentists.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No dentists found
                  </td>
                </tr>
              ) : (
                dentists.map((dentist) => (
                  <tr key={dentist.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{dentist.name}</div>
                      <div className="text-sm text-gray-500">{dentist.slug}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {dentist.address || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {dentist.phone || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {dentist.rating ? `⭐ ${dentist.rating}` : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleActive(dentist.id, dentist.isActive)}
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          dentist.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {dentist.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                      <Link
                        href={`/${dentist.slug}/`}
                        target="_blank"
                        className="text-gray-600 hover:text-gray-900 inline-flex items-center"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </Link>
                      <Link
                        href={`/admin/dentists/${dentist.id}`}
                        className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(dentist.id)}
                        className="text-red-600 hover:text-red-900 inline-flex items-center"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
    </AdminWrapper>
  )
}
