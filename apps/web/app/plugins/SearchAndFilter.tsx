'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

interface SearchAndFilterProps {
  initialFilterType?: string
  initialSearchQuery?: string
}

export default function SearchAndFilter({ 
  initialFilterType = 'all',
  initialSearchQuery = ''
}: SearchAndFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery)
  const filterType = searchParams.get('type') || initialFilterType

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams)
    
    if (searchQuery.trim()) {
      params.set('q', searchQuery)
    } else {
      params.delete('q')
    }
    
    startTransition(() => {
      router.push(`/plugins?${params.toString()}`)
    })
  }

  const handleFilterChange = (type: string) => {
    const params = new URLSearchParams(searchParams)
    
    if (type === 'all') {
      params.delete('type')
    } else {
      params.set('type', type)
    }
    
    startTransition(() => {
      router.push(`/plugins?${params.toString()}`)
    })
  }

  return (
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
          disabled={isPending}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? 'Searching...' : 'Search'}
        </button>
      </form>

      <div className="flex gap-2">
        <button
          onClick={() => handleFilterChange('all')}
          disabled={isPending}
          className={`px-4 py-2 rounded-lg ${filterType === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'} disabled:opacity-50`}
        >
          All
        </button>
        <button
          onClick={() => handleFilterChange('free')}
          disabled={isPending}
          className={`px-4 py-2 rounded-lg ${filterType === 'free' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'} disabled:opacity-50`}
        >
          Free
        </button>
        <button
          onClick={() => handleFilterChange('enterprise')}
          disabled={isPending}
          className={`px-4 py-2 rounded-lg ${filterType === 'enterprise' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'} disabled:opacity-50`}
        >
          Enterprise
        </button>
      </div>
    </div>
  )
}
