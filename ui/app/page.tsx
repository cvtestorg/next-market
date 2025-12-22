import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between">
        <h1 className="text-4xl font-bold mb-8">Next Market</h1>
        <p className="text-lg mb-4">Enterprise Plugin Distribution Platform</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Browse Plugins</CardTitle>
              <CardDescription>Explore available plugins in the marketplace</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/plugins">Browse Plugins →</Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Upload Plugin</CardTitle>
              <CardDescription>Publish your plugin to the marketplace</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/upload">Upload Plugin →</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-12">
          <CardHeader>
            <CardTitle>Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Automatic NPM package parsing</li>
              <li>Free and Enterprise plugins</li>
              <li>OpenFGA-based authorization</li>
              <li>Version lifecycle management</li>
              <li>Hybrid cloud deployment support</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
