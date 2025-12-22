import Link from 'next/link'
import { Suspense } from 'react'
import SearchAndFilter from './SearchAndFilter'
import PluginGrid from './PluginGrid'
import { getApiUrl } from '../lib/api'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

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
    const baseUrl = getApiUrl()
    let url = `${baseUrl}/api/v1/plugins`
    
    if (searchQuery) {
      url = `${baseUrl}/api/v1/plugins/search?q=${encodeURIComponent(searchQuery)}`
    } else if (filterType && filterType !== 'all') {
      url = `${baseUrl}/api/v1/plugins?type=${filterType}`
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
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Plugin Marketplace</h1>
            <p className="text-muted-foreground mt-2">Discover and install plugins</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>

        <Suspense fallback={
          <Card className="p-6 mb-8">
            <Skeleton className="h-10 w-full mb-4" />
            <Skeleton className="h-10 w-32" />
          </Card>
        }>
          <SearchAndFilter 
            initialFilterType={filterType}
            initialSearchQuery={searchQuery || ''}
          />
        </Suspense>

        <Suspense fallback={
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading plugins...</p>
          </div>
        }>
          <PluginGrid plugins={plugins} />
        </Suspense>
      </div>
    </div>
  )
}
