import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
      <div className="max-w-md text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Plugin Not Found</h2>
        <p className="text-gray-600 mb-8">
          The plugin you're looking for doesn't exist or has been removed.
        </p>
        <Link 
          href="/plugins"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
        >
          Back to Plugins
        </Link>
      </div>
    </div>
  )
}
