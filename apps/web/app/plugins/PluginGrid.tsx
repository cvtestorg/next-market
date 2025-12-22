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

interface PluginGridProps {
  plugins: Plugin[]
}

export default function PluginGrid({ plugins }: PluginGridProps) {
  if (plugins.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <p className="text-gray-600 text-lg">No plugins found</p>
        <Link href="/upload" className="mt-4 inline-block text-blue-600 hover:underline">
          Upload the first plugin →
        </Link>
      </div>
    )
  }

  return (
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
  )
}
