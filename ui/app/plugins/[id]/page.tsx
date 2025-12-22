import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getApiUrl } from '../../lib/api'
import PluginTabs from './PluginTabs'
import DeleteButton from './DeleteButton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface PluginVersion {
  id: number
  version: string
  created_at: string
  download_count: number
  file_size: number
  channel: string
  readme_content?: string
  config_schema_json?: any // JSON Schema 配置
  config_values_json?: any // 配置值
}

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
  backend_install_guide?: string
  keywords: string
  versions?: PluginVersion[]
}

interface PluginResponse {
  code: number
  message: string
  data: Plugin
}

async function fetchPluginDetails(id: string): Promise<Plugin | null> {
  try {
    const baseUrl = getApiUrl()
    const response = await fetch(`${baseUrl}/api/v1/plugins/${id}`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      return null
    }
    
    const data: PluginResponse = await response.json()
    
    if (data.code === 200) {
      return data.data
    }
    
    return null
  } catch (error) {
    console.error('Failed to fetch plugin details:', error)
    return null
  }
}

interface PluginDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function PluginDetailPage({ params }: PluginDetailPageProps) {
  const { id } = await params
  const plugin = await fetchPluginDetails(id)

  if (!plugin) {
    notFound()
  }

  const latestVersion = plugin.versions?.[0]

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4">
          <Button asChild variant="ghost">
            <Link href="/plugins">← Back to plugins</Link>
          </Button>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <CardTitle className="text-4xl">
                    {plugin.display_name || plugin.npm_package_name}
                  </CardTitle>
                  {plugin.verified_publisher && (
                    <Badge variant="secondary">✓ Verified Publisher</Badge>
                  )}
                </div>
                <p className="text-lg text-muted-foreground mb-4">{plugin.description}</p>
                <div className="flex items-center gap-4 text-sm">
                  <Badge variant={plugin.type === 'free' ? 'default' : 'secondary'}>
                    {plugin.type}
                  </Badge>
                  <span className="text-muted-foreground">v{plugin.latest_version}</span>
                  <span className="text-muted-foreground">{plugin.download_count} downloads</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button size="lg">Install Plugin</Button>
                <DeleteButton 
                  pluginId={plugin.id} 
                  pluginName={plugin.display_name || plugin.npm_package_name}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {plugin.keywords && (
              <div className="flex gap-2 flex-wrap">
                {plugin.keywords.split(',').map((keyword, idx) => (
                  <Badge key={idx} variant="outline">
                    {keyword.trim()}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs */}
        <PluginTabs plugin={plugin} latestVersion={latestVersion} />
      </div>
    </div>
  )
}
