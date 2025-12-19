'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadedPlugin, setUploadedPlugin] = useState<any>(null)

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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-4">
          <Link href="/" className="text-blue-600 hover:underline">
            ← Back to Home
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Plugin</h1>
          <p className="text-gray-600 mb-8">
            Upload your plugin as an NPM package (.tgz format)
          </p>

          {success && uploadedPlugin && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-green-800 font-semibold mb-2">✓ Upload Successful!</h3>
              <p className="text-green-700 mb-2">
                Plugin <strong>{uploadedPlugin.npm_package_name}</strong> version {uploadedPlugin.latest_version} has been uploaded.
              </p>
              <Link
                href={`/plugins/${uploadedPlugin.id}`}
                className="text-blue-600 hover:underline"
              >
                View plugin details →
              </Link>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleUpload}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plugin Package (.tgz)
              </label>
              <input
                id="file-input"
                type="file"
                accept=".tgz,.tar.gz"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none p-2.5"
              />
              <p className="mt-2 text-sm text-gray-500">
                Upload your NPM package in .tgz format
              </p>
            </div>

            {file && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Selected file:</strong> {file.name}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Size:</strong> {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={!file || uploading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold"
            >
              {uploading ? 'Uploading...' : 'Upload Plugin'}
            </button>
          </form>

          <div className="mt-8 p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Requirements</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Package must be in standard NPM .tgz format</li>
              <li>• Must contain a valid package.json file</li>
              <li>• Include a README.md file for documentation</li>
              <li>• Optionally include icon file specified in package.json</li>
              <li>• Use nextMarketConfig in package.json for configuration schema</li>
            </ul>
          </div>

          <div className="mt-6 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Example package.json</h3>
            <pre className="text-xs bg-white p-3 rounded border border-gray-200 overflow-x-auto">
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
          </div>
        </div>
      </div>
    </div>
  )
}
