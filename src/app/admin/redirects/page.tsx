'use client'

import { useState, useEffect } from 'react'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { AdminWrapper } from '@/components/admin/AdminWrapper'

interface Redirect {
  id: string
  fromPath: string
  toPath: string
  type: string
  isActive: boolean
  createdAt: string
}

export default function RedirectsPage() {
  const [redirects, setRedirects] = useState<Redirect[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingRedirect, setEditingRedirect] = useState<Redirect | null>(null)
  const [formData, setFormData] = useState({
    fromPath: '',
    toPath: '',
    type: 'PERMANENT',
    isActive: true
  })

  useEffect(() => {
    fetchRedirects()
  }, [])

  const fetchRedirects = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/redirects?limit=100', {
        credentials: 'include'
      })
      if (!response.ok) {
        const body = await response.json().catch(() => null)
        console.error('Failed to load redirects', body)
        setRedirects([])
        return
      }
      const data = await response.json()
      setRedirects(Array.isArray(data.redirects) ? data.redirects : [])
    } catch (error) {
      console.error('Error fetching redirects:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingRedirect
        ? `/api/admin/redirects/${editingRedirect.id}`
        : '/api/admin/redirects'

      const response = await fetch(url, {
        method: editingRedirect ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        fetchRedirects()
        setShowModal(false)
        setEditingRedirect(null)
        setFormData({ fromPath: '', toPath: '', type: 'PERMANENT', isActive: true })
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to save redirect')
      }
    } catch (error) {
      console.error('Error saving redirect:', error)
      alert('Failed to save redirect')
    }
  }

  const handleEdit = (redirect: Redirect) => {
    setEditingRedirect(redirect)
    setFormData({
      fromPath: redirect.fromPath,
      toPath: redirect.toPath,
      type: redirect.type,
      isActive: redirect.isActive
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this redirect?')) return

    try {
      const response = await fetch(`/api/admin/redirects/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        fetchRedirects()
      } else {
        alert('Failed to delete redirect')
      }
    } catch (error) {
      console.error('Error deleting redirect:', error)
      alert('Failed to delete redirect')
    }
  }

  return (
    <AdminWrapper>
      <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Redirects</h1>
          <p className="text-gray-600 mt-1">Manage URL redirects</p>
        </div>
        <button
          onClick={() => {
            setEditingRedirect(null)
            setFormData({ fromPath: '', toPath: '', type: 'PERMANENT', isActive: true })
            setShowModal(true)
          }}
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Redirect
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">From Path</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">To Path</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">Loading...</td></tr>
            ) : redirects.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">No redirects found</td></tr>
            ) : (
              redirects.map((redirect) => (
                <tr key={redirect.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-mono text-gray-900">{redirect.fromPath}</td>
                  <td className="px-6 py-4 text-sm font-mono text-gray-900">{redirect.toPath}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      redirect.type === 'PERMANENT' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {redirect.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      redirect.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {redirect.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(redirect)}
                      className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(redirect.id)}
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

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingRedirect ? 'Edit Redirect' : 'Add Redirect'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Path *</label>
                <input
                  type="text"
                  required
                  placeholder="/old-path"
                  value={formData.fromPath}
                  onChange={(e) => setFormData({ ...formData, fromPath: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To Path *</label>
                <input
                  type="text"
                  required
                  placeholder="/new-path"
                  value={formData.toPath}
                  onChange={(e) => setFormData({ ...formData, toPath: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="PERMANENT">Permanent (301)</option>
                  <option value="TEMPORARY">Temporary (302)</option>
                </select>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">Active</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingRedirect(null)
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                >
                  {editingRedirect ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </AdminWrapper>
  )
}
