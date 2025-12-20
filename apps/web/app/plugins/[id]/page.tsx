import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getApiUrl } from '../../lib/api'

interface PluginVersion {
  id: number
  version: string
  created_at: string
  download_count: number
  file_size: number
  channel: string
  readme_content?: string
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
  const readme = latestVersion?.readme_content || 'No README available'

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4">
          <Link href="/plugins" className="text-blue-600 hover:underline">
            ← Back to plugins
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold text-gray-900">
                  {plugin.display_name || plugin.npm_package_name}
                </h1>
                {plugin.verified_publisher && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                    ✓ Verified Publisher
                  </span>
                )}
              </div>
              <p className="text-lg text-gray-600 mb-4">{plugin.description}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className={`px-3 py-1 rounded ${plugin.type === 'free' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'}`}>
                  {plugin.type}
                </span>
                <span>v{plugin.latest_version}</span>
                <span>{plugin.download_count} downloads</span>
              </div>
            </div>
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">
              Install Plugin
            </button>
          </div>

          {plugin.keywords && (
            <div className="mt-6 flex gap-2 flex-wrap">
              {plugin.keywords.split(',').map((keyword, idx) => (
                <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                  {keyword.trim()}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex gap-8 px-8 pt-6">
              <button className="pb-4 border-b-2 border-blue-600 text-blue-600 font-medium">
                README
              </button>
              <button className="pb-4 text-gray-500 hover:text-gray-700">
                Versions ({plugin.versions?.length || 0})
              </button>
              {plugin.type === 'enterprise' && (
                <button className="pb-4 text-gray-500 hover:text-gray-700">
                  Installation Guide
                </button>
              )}
            </nav>
          </div>

          <div className="p-8">
            {/* README Content */}
            <div className="prose max-w-none">
              {readme ? (
                <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded border border-gray-200 text-sm">
                  {readme}
                </pre>
              ) : (
                <p className="text-gray-500">No README available for this plugin</p>
              )}
            </div>

            {/* Installation Guide for Enterprise */}
            {plugin.type === 'enterprise' && plugin.backend_install_guide && (
              <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Backend Installation Required</h3>
                <pre className="whitespace-pre-wrap text-sm">
                  {plugin.backend_install_guide}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Versions Sidebar */}
        {plugin.versions && plugin.versions.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">Available Versions</h3>
            <div className="space-y-2">
              {plugin.versions.map((version) => (
                <div
                  key={version.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded hover:bg-gray-50"
                >
                  <div>
                    <span className="font-medium">v{version.version}</span>
                    <span className="ml-3 text-sm text-gray-500">
                      {new Date(version.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">
                      {version.channel}
                    </span>
                    <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
