'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import {
  PhotoIcon,
  CloudArrowUpIcon,
  XMarkIcon,
  CheckCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

interface MediaUploadProps {
  onUpload: (url: string) => void
  currentImage?: string
  accept?: string
  multiple?: boolean
  maxFiles?: number
}

interface UploadFile {
  id: string
  file: File
  preview: string
  uploading: boolean
  uploaded: boolean
  error?: string
  url?: string
}

interface MediaLibraryItem {
  id: string
  path: string
  originalName: string
  alt: string | null
  mimeType: string
  size: number
  createdAt: string
}

export function MediaUpload({
  onUpload,
  currentImage,
  accept = 'image/*',
  multiple = false,
  maxFiles = 1
}: MediaUploadProps) {
  const [files, setFiles] = useState<UploadFile[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const [galleryLoading, setGalleryLoading] = useState(false)
  const [galleryItems, setGalleryItems] = useState<MediaLibraryItem[]>([])
  const [galleryError, setGalleryError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  const fetchGalleryItems = async () => {
    setGalleryLoading(true)
    setGalleryError(null)

    try {
      const response = await fetch('/api/admin/media/upload?limit=50', {
        credentials: 'include'
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized - please log in again')
        }
        throw new Error('Unable to load media library')
      }

      const data = await response.json()
      setGalleryItems(data.media || [])
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to load media library'
      setGalleryError(message)
    } finally {
      setGalleryLoading(false)
    }
  }

  const openGallery = () => {
    setIsGalleryOpen(true)
    if (!galleryItems.length) {
      fetchGalleryItems()
    }
  }

  const handleGallerySelect = (item: MediaLibraryItem) => {
    onUpload(item.path)
    setFiles([])
    setIsGalleryOpen(false)
  }

  const handleRefreshGallery = () => {
    fetchGalleryItems()
  }

  const handleFiles = (fileList: FileList) => {
    const newFiles: UploadFile[] = []

    Array.from(fileList).slice(0, maxFiles - files.length).forEach((file) => {
      if (file.type.startsWith('image/') || accept === '*/*') {
        const id = Date.now() + Math.random().toString()

        // Create FileReader for reliable preview
        const reader = new FileReader()
        reader.onload = (e) => {
          const preview = e.target?.result as string

          setFiles(prev => {
            const existing = prev.find(f => f.id === id)
            if (existing) {
              return prev.map(f => f.id === id ? { ...f, preview } : f)
            }
            return prev
          })
        }
        reader.readAsDataURL(file)

        const newFile = {
          id,
          file,
          preview: '', // Will be set by FileReader
          uploading: false,
          uploaded: false
        }

        newFiles.push(newFile)

        // Auto-upload after adding file
        setTimeout(() => {
          uploadFile(newFile)
        }, 100)
      }
    })

    setFiles(prev => [...prev, ...newFiles])
  }

  const uploadFile = async (fileItem: UploadFile) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === fileItem.id ? { ...f, uploading: true, error: undefined } : f
      )
    )

    try {
      const formData = new FormData()
      formData.append('file', fileItem.file)

      const response = await fetch('/api/admin/media/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized - please log in again')
        }

        const errorText = await response.text()
        let parsedMessage: string | undefined
        try {
          const parsed = JSON.parse(errorText) as { error?: string }
          parsedMessage = parsed?.error
        } catch (parseError) {
          console.error('Could not parse error response as JSON')
        }

        throw new Error(parsedMessage || `Upload failed with status ${response.status}`)
      }

      const result = await response.json()

      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileItem.id
            ? {
                ...f,
                uploading: false,
                uploaded: true,
                url: result.url
              }
            : f
        )
      )

      onUpload(result.url)
      setFiles([])
    } catch (error) {
      console.error('Upload error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileItem.id
            ? {
                ...f,
                uploading: false,
                error: errorMessage
              }
            : f
        )
      )
    }
  }

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files)
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      {/* Current Image */}
      {currentImage && (
        <div className="relative">
          <div className="text-sm font-medium text-neutral-700 mb-2">Current Image</div>
          <div className="relative w-full h-48 bg-neutral-100 rounded-lg overflow-hidden">
            <Image
              src={currentImage}
              alt="Current"
              fill
              sizes="(min-width: 1024px) 768px, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
          dragActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-neutral-300 hover:border-neutral-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          className="absolute inset-0 z-10 w-full h-full opacity-0 cursor-pointer"
        />

        <div className="text-center">
          <PhotoIcon className="mx-auto h-12 w-12 text-neutral-400" />
          <div className="mt-4">
            <button
              type="button"
              onClick={openFileDialog}
              className="relative z-20 text-primary-600 hover:text-primary-700 font-medium"
            >
              Click to upload
            </button>
            <p className="text-neutral-500"> or drag and drop</p>
          </div>
          <p className="text-xs text-neutral-400 mt-2">
            PNG, JPG, GIF up to 10MB
          </p>
          <div className="mt-4">
            <button
              type="button"
              onClick={openGallery}
              className="relative z-20 inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              <PhotoIcon className="h-4 w-4" />
              Choose from media library
            </button>
          </div>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          {files.map((fileItem) => (
              <div
                key={fileItem.id}
                className="flex items-center space-x-4 p-3 bg-neutral-50 rounded-lg"
              >
                {/* Preview */}
                <div className="relative w-16 h-16 bg-neutral-200 rounded-lg overflow-hidden flex-shrink-0">
                  {fileItem.file.type.startsWith('image/') && fileItem.preview ? (
                    <img
                      src={fileItem.preview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <PhotoIcon className="h-8 w-8 text-neutral-400" />
                    </div>
                  )}
                </div>

                {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-neutral-900 truncate">
                  {fileItem.file.name}
                </div>
                <div className="text-xs text-neutral-500">
                  {(fileItem.file.size / 1024 / 1024).toFixed(2)} MB
                </div>
                {fileItem.error && (
                  <div className="text-xs text-red-600 mt-1">
                    {fileItem.error}
                  </div>
                )}
              </div>

              {/* Status & Actions */}
              <div className="flex items-center space-x-2">
                {fileItem.uploading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                    <span className="text-xs text-neutral-500">Uploading...</span>
                  </div>
                ) : fileItem.uploaded ? (
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-600" />
                    <span className="text-xs text-green-600">Uploaded</span>
                  </div>
                ) : (
                  <button
                    onClick={() => uploadFile(fileItem)}
                    className="flex items-center space-x-1 px-3 py-1 bg-primary-600 text-white text-xs rounded-md hover:bg-primary-700 transition-colors"
                  >
                    <CloudArrowUpIcon className="h-3 w-3" />
                    <span>Upload</span>
                  </button>
                )}

                <button
                  onClick={() => removeFile(fileItem.id)}
                  className="p-1 text-neutral-400 hover:text-red-600 transition-colors"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
                </div>
              </div>
            ))}
        </div>
      )}

      {isGalleryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold text-neutral-900">Select from media library</h3>
                <p className="text-sm text-neutral-500">Choose an existing image to use as the featured image.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRefreshGallery}
                  className="inline-flex items-center gap-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 transition-colors"
                  disabled={galleryLoading}
                >
                  <ArrowPathIcon className={`h-4 w-4 ${galleryLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <button
                  type="button"
                  onClick={() => setIsGalleryOpen(false)}
                  className="rounded-lg border border-neutral-300 p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(80vh-5rem)]">
              {galleryLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-neutral-500">
                  <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
                  <p className="mt-4 text-sm">Loading media library…</p>
                </div>
              ) : galleryError ? (
                <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
                  <p className="text-sm text-neutral-500">{galleryError}</p>
                  <button
                    type="button"
                    onClick={handleRefreshGallery}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
                  >
                    <ArrowPathIcon className="h-4 w-4" />
                    Try again
                  </button>
                </div>
              ) : galleryItems.length === 0 ? (
                <div className="py-12 text-center text-sm text-neutral-500">
                  No media files found. Upload a new image to get started.
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {galleryItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleGallerySelect(item)}
                      className={`group relative flex flex-col rounded-xl border border-neutral-200 p-3 text-left transition-all hover:border-primary-500 hover:shadow-lg ${currentImage === item.path ? 'ring-2 ring-primary-500' : ''}`}
                    >
                      <div className="relative h-36 overflow-hidden rounded-lg bg-neutral-100">
                        {item.mimeType.startsWith('image/') ? (
                          <img
                            src={item.path}
                            alt={item.alt || item.originalName}
                            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <PhotoIcon className="h-10 w-10 text-neutral-400" />
                          </div>
                        )}
                        {currentImage === item.path && (
                          <span className="absolute left-2 top-2 rounded-full bg-primary-600 px-2 py-1 text-xs font-medium text-white">
                            Selected
                          </span>
                        )}
                      </div>
                      <div className="mt-3 space-y-1">
                        <p className="truncate text-sm font-medium text-neutral-900">{item.originalName}</p>
                        <p className="text-xs text-neutral-500">{formatFileSize(item.size)}</p>
                        <p className="text-xs text-neutral-400">
                          Added {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
