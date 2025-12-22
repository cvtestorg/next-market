import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background p-8 flex items-center justify-center">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="text-3xl">Plugin Not Found</CardTitle>
          <CardDescription>
            The plugin you're looking for doesn't exist or has been removed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href="/plugins">Back to Plugins</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
