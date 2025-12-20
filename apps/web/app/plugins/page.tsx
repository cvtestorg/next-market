'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Plugin {
  id: number
  npm_package_name: string
  display_name: string
  description: string
  type: string
  latest_version: string
  icon_url?: string
  download_count: number
  verified_publisher: boolean
}

interface PluginListResponse {
  code: number
  message: string
  data: {
    items: Plugin[]
    total: number
    page: number
    pageSize: number
  }
}

export default function PluginsPage() {
  const [plugins, setPlugins] = useState<Plugin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')

  useEffect(() => {
    fetchPlugins()
  }, [filterType])

  const fetchPlugins = async () => {
    try {
      setLoading(true)
      const url = filterType === 'all' 
        ? '/api/v1/plugins'
        : `/api/v1/plugins?type=${filterType}`
      
      const response = await fetch(url)
      const data: PluginListResponse = await response.json()
      
      if (data.code === 200) {
        setPlugins(data.data.items || [])
      } else {
        setError(data.message)
      }
    } catch (err) {
      setError('Failed to fetch plugins')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) {
      fetchPlugins()
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`/api/v1/plugins/search?q=${encodeURIComponent(searchQuery)}`)
      const data: PluginListResponse = await response.json()
      
      if (data.code === 200) {
        setPlugins(data.data.items || [])
      } else {
        setError(data.message)
      }
    } catch (err) {
      setError('Search failed')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Plugin Marketplace</h1>
            <p className="text-gray-600 mt-2">Discover and install plugins</p>
          </div>
          <Link 
            href="/"
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Back to Home
          </Link>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <form onSubmit={handleSearch} className="flex gap-4 mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search plugins..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Search
            </button>
          </form>

          <div className="flex gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-lg ${filterType === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('free')}
              className={`px-4 py-2 rounded-lg ${filterType === 'free' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Free
            </button>
            <button
              onClick={() => setFilterType('enterprise')}
              className={`px-4 py-2 rounded-lg ${filterType === 'enterprise' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Enterprise
            </button>
          </div>
        </div>

        {/* Plugin List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading plugins...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
            {error}
          </div>
        ) : plugins.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 text-lg">No plugins found</p>
            <Link href="/upload" className="mt-4 inline-block text-blue-600 hover:underline">
              Upload the first plugin →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plugins.map((plugin) => (
              <Link
                key={plugin.id}
                href={`/plugins/${plugin.id}`}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 block"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      {plugin.display_name || plugin.npm_package_name}
                    </h3>
                    <p className="text-sm text-gray-500">{plugin.npm_package_name}</p>
                  </div>
                  {plugin.verified_publisher && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      ✓ Verified
                    </span>
                  )}
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {plugin.description || 'No description available'}
                </p>

                <div className="flex items-center justify-between text-sm">
                  <span className={`px-2 py-1 rounded ${plugin.type === 'free' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'}`}>
                    {plugin.type}
                  </span>
                  <span className="text-gray-500">v{plugin.latest_version}</span>
                </div>

                <div className="mt-4 text-sm text-gray-500">
                  {plugin.download_count} downloads
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
