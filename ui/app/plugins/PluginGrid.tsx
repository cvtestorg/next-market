import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

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

interface PluginGridProps {
  plugins: Plugin[]
}

export default function PluginGrid({ plugins }: PluginGridProps) {
  if (plugins.length === 0) {
    return (
      <Card className="p-12 text-center">
        <CardContent>
          <p className="text-muted-foreground text-lg mb-4">No plugins found</p>
          <Button asChild>
            <Link href="/upload">Upload the first plugin →</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {plugins.map((plugin) => (
        <Card key={plugin.id} className="hover:shadow-lg transition-shadow">
          <Link href={`/plugins/${plugin.id}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="mb-1">
                    {plugin.display_name || plugin.npm_package_name}
                  </CardTitle>
                  <CardDescription>{plugin.npm_package_name}</CardDescription>
                </div>
                {plugin.verified_publisher && (
                  <Badge variant="secondary">✓ Verified</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                {plugin.description || 'No description available'}
              </p>

              <div className="flex items-center justify-between text-sm mb-2">
                <Badge variant={plugin.type === 'free' ? 'default' : 'secondary'}>
                  {plugin.type}
                </Badge>
                <span className="text-muted-foreground">v{plugin.latest_version}</span>
              </div>

              <div className="text-sm text-muted-foreground">
                {plugin.download_count} downloads
              </div>
            </CardContent>
          </Link>
        </Card>
      ))}
    </div>
  )
}
