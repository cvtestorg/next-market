import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8">Next Market</h1>
        <p className="text-lg mb-4">Enterprise Plugin Distribution Platform</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <Link 
            href="/plugins"
            className="block p-6 border border-gray-300 rounded-lg hover:border-gray-500 transition-colors"
          >
            <h2 className="text-2xl font-semibold mb-2">Browse Plugins →</h2>
            <p className="text-gray-600">Explore available plugins in the marketplace</p>
          </Link>
          
          <Link 
            href="/upload"
            className="block p-6 border border-gray-300 rounded-lg hover:border-gray-500 transition-colors"
          >
            <h2 className="text-2xl font-semibold mb-2">Upload Plugin →</h2>
            <p className="text-gray-600">Publish your plugin to the marketplace</p>
          </Link>
        </div>

        <div className="mt-12">
          <h3 className="text-xl font-semibold mb-4">Features</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Automatic NPM package parsing</li>
            <li>Free and Enterprise plugins</li>
            <li>OpenFGA-based authorization</li>
            <li>Version lifecycle management</li>
            <li>Hybrid cloud deployment support</li>
          </ul>
        </div>
      </div>
    </main>
  )
}
