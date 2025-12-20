import Link from 'next/link'
import { Suspense } from 'react'
import SearchAndFilter from './SearchAndFilter'
import PluginGrid from './PluginGrid'

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

async function fetchPlugins(searchQuery?: string, filterType?: string): Promise<Plugin[]> {
  try {
    let url = 'http://localhost:8000/api/v1/plugins'
    
    if (searchQuery) {
      url = `http://localhost:8000/api/v1/plugins/search?q=${encodeURIComponent(searchQuery)}`
    } else if (filterType && filterType !== 'all') {
      url = `http://localhost:8000/api/v1/plugins?type=${filterType}`
    }
    
    const response = await fetch(url, {
      cache: 'no-store' // Ensure fresh data on each request
    })
    
    if (!response.ok) {
      return []
    }
    
    const data: PluginListResponse = await response.json()
    
    if (data.code === 200) {
      return data.data.items || []
    }
    
    return []
  } catch (error) {
    console.error('Failed to fetch plugins:', error)
    return []
  }
}

interface PluginsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function PluginsPage({ searchParams }: PluginsPageProps) {
  const params = await searchParams
  const searchQuery = typeof params.q === 'string' ? params.q : undefined
  const filterType = typeof params.type === 'string' ? params.type : 'all'
  
  const plugins = await fetchPlugins(searchQuery, filterType)

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

        <Suspense fallback={<div className="bg-white rounded-lg shadow p-6 mb-8">Loading filters...</div>}>
          <SearchAndFilter 
            initialFilterType={filterType}
            initialSearchQuery={searchQuery || ''}
          />
        </Suspense>

        <Suspense fallback={
          <div className="text-center py-12">
            <p className="text-gray-600">Loading plugins...</p>
          </div>
        }>
          <PluginGrid plugins={plugins} />
        </Suspense>
      </div>
    </div>
  )
}
