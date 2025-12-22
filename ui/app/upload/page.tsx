'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface UploadedPluginData {
  id: number
  npm_package_name: string
  latest_version: string
  display_name?: string
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadedPlugin, setUploadedPlugin] = useState<UploadedPluginData | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      
      // Validate file extension
      if (!selectedFile.name.endsWith('.tgz') && !selectedFile.name.endsWith('.tar.gz')) {
        setError('Please upload a .tgz or .tar.gz file')
        return
      }
      
      setFile(selectedFile)
      setError(null)
      setSuccess(false)
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!file) {
      setError('Please select a file to upload')
      return
    }

    try {
      setUploading(true)
      setError(null)
      setSuccess(false)

      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/v1/plugins/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (data.code === 200) {
        setSuccess(true)
        setUploadedPlugin(data.data)
        setFile(null)
        // Reset file input
        const fileInput = document.getElementById('file-input') as HTMLInputElement
        if (fileInput) fileInput.value = ''
      } else {
        setError(data.message || 'Upload failed')
      }
    } catch (err) {
      setError('Failed to upload plugin. Please try again.')
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-4">
          <Button asChild variant="ghost">
            <Link href="/">← Back to Home</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upload Plugin</CardTitle>
            <CardDescription>
              Upload your plugin as an NPM package (.tgz format)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {success && uploadedPlugin && (
              <Alert>
                <AlertTitle>✓ Upload Successful!</AlertTitle>
                <AlertDescription>
                  Plugin <strong>{uploadedPlugin.npm_package_name}</strong> version {uploadedPlugin.latest_version} has been uploaded.
                  <br />
                  <Button asChild variant="link" className="p-0 h-auto mt-2">
                    <Link href={`/plugins/${uploadedPlugin.id}`}>
                      View plugin details →
                    </Link>
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleUpload} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="file-input">Plugin Package (.tgz)</Label>
                <Input
                  id="file-input"
                  type="file"
                  accept=".tgz,.tar.gz"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
                <p className="text-sm text-muted-foreground">
                  Upload your NPM package in .tgz format
                </p>
              </div>

              {file && (
                <Alert>
                  <AlertDescription>
                    <strong>Selected file:</strong> {file.name}
                    <br />
                    <strong>Size:</strong> {(file.size / 1024).toFixed(2)} KB
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={!file || uploading}
                className="w-full"
                size="lg"
              >
                {uploading ? 'Uploading...' : 'Upload Plugin'}
              </Button>
            </form>

            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                  <li>Package must be in standard NPM .tgz format</li>
                  <li>Must contain a valid package.json file</li>
                  <li>Include a README.md file for documentation</li>
                  <li>Optionally include icon file specified in package.json</li>
                  <li>Use nextMarketConfig in package.json for configuration schema</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Example package.json</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-muted p-3 rounded border overflow-x-auto">
{`{
  "name": "my-awesome-plugin",
  "version": "1.0.0",
  "description": "An awesome plugin",
  "type": "free",
  "icon": "assets/logo.png",
  "nextMarketConfig": {
    "type": "object",
    "properties": {
      "apiKey": {
        "type": "string",
        "title": "API Key"
      }
    }
  }
}`}
                </pre>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
