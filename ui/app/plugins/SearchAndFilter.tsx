'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

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
    <Card className="mb-8">
      <CardContent className="pt-6">
        <form onSubmit={handleSearch} className="flex gap-4 mb-4">
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search plugins..."
            className="flex-1"
          />
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Searching...' : 'Search'}
          </Button>
        </form>

        <Tabs value={filterType} onValueChange={handleFilterChange}>
          <TabsList>
            <TabsTrigger value="all" disabled={isPending}>All</TabsTrigger>
            <TabsTrigger value="free" disabled={isPending}>Free</TabsTrigger>
            <TabsTrigger value="enterprise" disabled={isPending}>Enterprise</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardContent>
    </Card>
  )
}
