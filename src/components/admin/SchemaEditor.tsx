'use client'

import { useState, useEffect, useRef } from 'react'
import { PlusIcon, TrashIcon, DocumentCheckIcon } from '@heroicons/react/24/outline'

interface SchemaField {
  id: string
  key: string
  value: string
  type: 'string' | 'number' | 'boolean' | 'array' | 'object'
}

interface SchemaEditorProps {
  initialSchema?: string
  onChange: (schema: string) => void
  contentType: 'article' | 'review' | 'dentist' | 'organization' | 'website'
}

const SCHEMA_TEMPLATES = {
  article: {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: '',
    description: '',
    author: {
      '@type': 'Person',
      name: ''
    },
    publisher: {
      '@type': 'Organization',
      name: 'Pediatric Dentist in Queens NY',
      logo: {
        '@type': 'ImageObject',
        url: ''
      }
    },
    datePublished: '',
    dateModified: '',
    image: '',
    url: ''
  },
  review: {
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: {
      '@type': 'Product',
      name: ''
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: 5,
      bestRating: 5
    },
    author: {
      '@type': 'Person',
      name: ''
    },
    reviewBody: '',
    datePublished: ''
  },
  dentist: {
    '@context': 'https://schema.org',
    '@type': 'Dentist',
    name: '',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '',
      addressLocality: 'Queens',
      addressRegion: 'NY',
      postalCode: '',
      addressCountry: 'US'
    },
    telephone: '',
    url: '',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: 5,
      reviewCount: 1
    },
    specialty: 'Pediatric Dentistry'
  },
  organization: {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Pediatric Dentist in Queens NY',
    url: 'https://pediatricdentistinqueensny.com',
    logo: 'https://pediatricdentistinqueensny.com/logo.png',
    description: 'Find the best pediatric dentists in Queens, NY',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Queens',
      addressRegion: 'NY',
      addressCountry: 'US'
    },
    sameAs: []
  },
  website: {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Pediatric Dentist in Queens NY',
    url: 'https://pediatricdentistinqueensny.com',
    description: 'Find the best pediatric dentists in Queens, NY',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://pediatricdentistinqueensny.com/search?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  }
}

export function SchemaEditor({ initialSchema, onChange, contentType }: SchemaEditorProps) {
  const [schema, setSchema] = useState<any>({})
  const [rawMode, setRawMode] = useState(false)
  const [rawJson, setRawJson] = useState('')
  const [error, setError] = useState('')
  const initialized = useRef(false)

  useEffect(() => {
    // Only initialize once when component mounts
    if (!initialized.current) {
      if (initialSchema) {
        try {
          const parsed = JSON.parse(initialSchema)
          setSchema(parsed)
          setRawJson(JSON.stringify(parsed, null, 2))
        } catch (e) {
          setError('Invalid JSON schema')
          setRawJson(initialSchema)
        }
      } else {
        const template = SCHEMA_TEMPLATES[contentType]
        setSchema(template)
        setRawJson(JSON.stringify(template, null, 2))
      }
      initialized.current = true
    }
  }, [initialSchema, contentType])

  useEffect(() => {
    try {
      const jsonString = JSON.stringify(schema)
      onChange(jsonString)
      setError('')
    } catch (e) {
      setError('Failed to serialize schema')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schema])

  const loadTemplate = () => {
    const template = SCHEMA_TEMPLATES[contentType]
    setSchema(template)
    setRawJson(JSON.stringify(template, null, 2))
  }

  const handleRawJsonChange = (value: string) => {
    setRawJson(value)
    try {
      const parsed = JSON.parse(value)
      setSchema(parsed)
      setError('')
    } catch (e) {
      setError('Invalid JSON')
    }
  }

  const updateNestedValue = (obj: any, path: string[], value: any) => {
    const newObj = { ...obj }
    let current = newObj

    for (let i = 0; i < path.length - 1; i++) {
      if (!current[path[i]]) {
        current[path[i]] = {}
      }
      current = current[path[i]]
    }

    if (value === '') {
      delete current[path[path.length - 1]]
    } else {
      current[path[path.length - 1]] = value
    }

    return newObj
  }

  const renderSchemaField = (key: string, value: any, path: string[] = []) => {
    const currentPath = [...path, key]
    const pathString = currentPath.join('.')

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return (
        <div key={pathString} className="ml-4 border-l-2 border-neutral-200 pl-4 mb-4">
          <div className="text-sm font-medium text-neutral-700 mb-2">{key}</div>
          {Object.entries(value).map(([nestedKey, nestedValue]) =>
            renderSchemaField(nestedKey, nestedValue, currentPath)
          )}
        </div>
      )
    }

    return (
      <div key={pathString} className="mb-3">
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          {key}
        </label>
        <input
          type={typeof value === 'number' ? 'number' : 'text'}
          value={value || ''}
          onChange={(e) => {
            const newValue = typeof value === 'number' ?
              parseFloat(e.target.value) || 0 :
              e.target.value
            setSchema(prev => updateNestedValue(prev, currentPath, newValue))
          }}
          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          placeholder={`Enter ${key}`}
        />
      </div>
    )
  }

  const validateSchema = () => {
    try {
      JSON.parse(JSON.stringify(schema))
      return true
    } catch (e) {
      return false
    }
  }

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-neutral-900">Schema.org Markup</h3>
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={loadTemplate}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-primary-600 hover:text-primary-800 transition-colors"
          >
            <DocumentCheckIcon className="h-4 w-4 mr-1" />
            Load Template
          </button>
          <button
            type="button"
            onClick={() => setRawMode(!rawMode)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              rawMode
                ? 'bg-primary-100 text-primary-700'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            {rawMode ? 'Visual Editor' : 'Raw JSON'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {rawMode ? (
        <div>
          <textarea
            value={rawJson}
            onChange={(e) => handleRawJsonChange(e.target.value)}
            className="w-full h-96 px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
            placeholder="Enter JSON-LD schema markup"
          />
          <div className="mt-2 flex items-center text-sm">
            {validateSchema() ? (
              <span className="text-green-600">✓ Valid JSON</span>
            ) : (
              <span className="text-red-600">✗ Invalid JSON</span>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {Object.entries(schema).map(([key, value]) =>
            key !== '@context' && key !== '@type' ?
              renderSchemaField(key, value) : null
          )}

          {Object.keys(schema).length === 0 && (
            <div className="text-center py-8 text-neutral-500">
              <p>No schema fields yet.</p>
              <button
                type="button"
                onClick={loadTemplate}
                className="mt-2 inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Load {contentType} Template
              </button>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-700">
          <strong>Schema Type:</strong> {schema['@type'] || 'None'} -
          This structured data helps search engines understand your content better.
        </p>
      </div>
    </div>
  )
}