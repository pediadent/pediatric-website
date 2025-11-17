'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { MediaUpload } from '@/components/admin/MediaUpload'
import {
  MagnifyingGlassIcon,
  TrashIcon,
  EyeIcon,
  DocumentDuplicateIcon,
  PencilIcon
} from '@heroicons/react/24/outline'
import { AdminWrapper } from '@/components/admin/AdminWrapper'
import { useAdminApi } from '@/hooks/useAdminApi'

interface MediaItem {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  path: string
  alt: string | null
  caption: string | null
  createdAt: string
  updatedAt: string
}

interface MediaResponse {
  media: MediaItem[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function MediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null)
  const [search, setSearch] = useState('')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })
  const adminFetch = useAdminApi()

  const fetchMedia = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(search && { search })
      })

      const response = await adminFetch(`/api/admin/media/upload?${params}`)
      if (response.ok) {
        const data: MediaResponse = await response.json()
        setMedia(data.media)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching media:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMedia()
  }, [pagination.page, search])

  const handleUpload = (url: string) => {
    fetchMedia() // Refresh the media list
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this media file?')) {
      try {
        const response = await adminFetch(`/api/admin/media/${id}`, {
          method: 'DELETE'
        })
        if (response.ok) {
          fetchMedia()
        }
      } catch (error) {
        console.error('Error deleting media:', error)
      }
    }
  }

  const copyToClipboard = (path: string) => {
    const fullUrl = `${window.location.origin}${path}`
    navigator.clipboard.writeText(fullUrl)
    alert('URL copied to clipboard!')
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <AdminWrapper>
      <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">Media Library</h1>
          <p className="text-neutral-600 mt-2">Upload and manage your images and files</p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">Upload New Media</h2>
          <MediaUpload
            onUpload={handleUpload}
            accept="image/*"
            multiple
            maxFiles={5}
          />
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search media files..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Media Grid */}
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-neutral-600 mt-2">Loading media...</p>
            </div>
          ) : media.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-neutral-600">No media files found.</p>
              <p className="text-neutral-500 text-sm mt-1">Upload some images to get started.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 p-6">
                {media.map((item) => (
                  <div
                    key={item.id}
                    className="group relative bg-neutral-50 rounded-lg overflow-hidden border border-neutral-200 hover:border-primary-300 transition-colors"
                  >
                    {/* Image */}
                    <div className="relative aspect-square">
                      {item.mimeType.startsWith('image/') ? (
                        <img
                          src={`${item.path}?t=${new Date(item.updatedAt).getTime()}`}
                          alt={item.alt || item.originalName}
                          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.backgroundColor = '#f3f4f6'
                            target.style.display = 'none'
                            target.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-neutral-200"><span class="text-neutral-500 text-xs">Failed to load</span></div>'
                          }}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full bg-neutral-200">
                          <span className="text-neutral-500 text-sm">
                            {item.mimeType.split('/')[1].toUpperCase()}
                          </span>
                        </div>
                      )}

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                          <button
                            onClick={() => setSelectedItem(item)}
                            className="p-2 bg-white rounded-lg shadow-lg hover:bg-neutral-50 transition-colors"
                            title="View Details"
                          >
                            <EyeIcon className="h-4 w-4 text-neutral-700" />
                          </button>
                          <button
                            onClick={() => copyToClipboard(item.path)}
                            className="p-2 bg-white rounded-lg shadow-lg hover:bg-neutral-50 transition-colors"
                            title="Copy URL"
                          >
                            <DocumentDuplicateIcon className="h-4 w-4 text-neutral-700" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 bg-white rounded-lg shadow-lg hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <TrashIcon className="h-4 w-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-3">
                      <div className="text-sm font-medium text-neutral-900 truncate">
                        {item.originalName}
                      </div>
                      <div className="text-xs text-neutral-500 mt-1">
                        {formatFileSize(item.size)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="px-6 py-4 border-t border-neutral-200 flex items-center justify-between">
                  <div className="text-sm text-neutral-500">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} files
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                      disabled={pagination.page === 1}
                      className="px-3 py-2 border border-neutral-300 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                      disabled={pagination.page === pagination.pages}
                      className="px-3 py-2 border border-neutral-300 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Media Detail Modal */}
        {selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-neutral-900">Media Details</h3>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Image Preview */}
                  {selectedItem.mimeType.startsWith('image/') && (
                    <div className="relative h-64 bg-neutral-100 rounded-lg overflow-hidden">
                      <img
                        src={selectedItem.path}
                        alt={selectedItem.alt || selectedItem.originalName}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-neutral-700">Filename:</span>
                      <p className="text-neutral-600">{selectedItem.originalName}</p>
                    </div>
                    <div>
                      <span className="font-medium text-neutral-700">Size:</span>
                      <p className="text-neutral-600">{formatFileSize(selectedItem.size)}</p>
                    </div>
                    <div>
                      <span className="font-medium text-neutral-700">Type:</span>
                      <p className="text-neutral-600">{selectedItem.mimeType}</p>
                    </div>
                    <div>
                      <span className="font-medium text-neutral-700">Uploaded:</span>
                      <p className="text-neutral-600">{formatDate(selectedItem.createdAt)}</p>
                    </div>
                  </div>

                  {/* URL */}
                  <div>
                    <span className="font-medium text-neutral-700">URL:</span>
                    <div className="flex items-center space-x-2 mt-1">
                      <input
                        type="text"
                        value={`${window.location.origin}${selectedItem.path}`}
                        readOnly
                        className="flex-1 px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-sm"
                      />
                      <button
                        onClick={() => copyToClipboard(selectedItem.path)}
                        className="px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </AdminWrapper>
  )
}
