/**
 * Get the API base URL based on the environment
 * For server-side requests, use localhost:8000
 * For client-side requests, use relative paths (which will be rewritten by Next.js)
 */
export function getApiUrl(): string {
  // Check if we're on the server
  if (typeof window === 'undefined') {
    // Server-side: use environment variable or default to localhost
    return process.env.API_URL || 'http://localhost:8000'
  }
  
  // Client-side: use empty string to use relative URLs (Next.js will rewrite them)
  return ''
}
