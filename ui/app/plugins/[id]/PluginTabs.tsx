'use client'

import { useState } from 'react'
import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'

interface PluginVersion {
  id: number
  version: string
  created_at: string
  download_count: number
  file_size: number
  channel: string
  readme_content?: string
  config_schema_json?: any
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

interface PluginTabsProps {
  plugin: Plugin
  latestVersion: PluginVersion | undefined
}

type TabType = 'readme' | 'config' | 'versions' | 'installation'

export default function PluginTabs({ plugin, latestVersion }: PluginTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('readme')
  const [configValues, setConfigValues] = useState<Record<string, any>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  
  const readme = latestVersion?.readme_content || 'No README available'
  const configSchema = latestVersion?.config_schema_json
  const savedConfigValues = latestVersion?.config_values_json
  const hasConfig = configSchema && Object.keys(configSchema).length > 0

  // 初始化配置值（优先使用保存的值，否则使用默认值）
  React.useEffect(() => {
    if (configSchema?.properties) {
      const initialValues: Record<string, any> = {}
      Object.entries(configSchema.properties).forEach(([key, prop]: [string, any]) => {
        // 优先使用保存的值
        if (savedConfigValues && savedConfigValues[key] !== undefined) {
          initialValues[key] = savedConfigValues[key]
        } else if (prop.default !== undefined) {
          initialValues[key] = prop.default
        } else if (prop.type === 'boolean') {
          initialValues[key] = false
        } else if (prop.type === 'array' || prop.type === 'object') {
          initialValues[key] = prop.type === 'array' ? [] : {}
        } else {
          initialValues[key] = ''
        }
      })
      setConfigValues(initialValues)
    }
  }, [configSchema, savedConfigValues])

  // 验证配置
  const validateConfig = (): boolean => {
    if (!configSchema?.properties) return false
    
    const errors: Record<string, string> = {}
    const { required = [] } = configSchema
    
    // 验证必填字段
    required.forEach((fieldName: string) => {
      const value = configValues[fieldName]
      if (value === undefined || value === null || value === '' || 
          (Array.isArray(value) && value.length === 0) ||
          (typeof value === 'object' && Object.keys(value).length === 0)) {
        errors[fieldName] = 'This field is required'
      }
    })
    
    // 验证字段类型和格式
    Object.entries(configSchema.properties).forEach(([key, prop]: [string, any]) => {
      const value = configValues[key]
      if (value === undefined || value === null || value === '') return
      
      const fieldType = prop.type || 'string'
      
      // 验证字符串类型
      if (fieldType === 'string' && typeof value === 'string') {
        if (prop.minLength && value.length < prop.minLength) {
          errors[key] = `Must be at least ${prop.minLength} characters`
        }
        if (prop.pattern) {
          const regex = new RegExp(prop.pattern)
          if (!regex.test(value)) {
            errors[key] = 'Invalid format'
          }
        }
      }
      
      // 验证数字类型
      if ((fieldType === 'integer' || fieldType === 'number') && typeof value === 'number') {
        if (prop.minimum !== undefined && value < prop.minimum) {
          errors[key] = `Must be at least ${prop.minimum}`
        }
        if (prop.maximum !== undefined && value > prop.maximum) {
          errors[key] = `Must be at most ${prop.maximum}`
        }
      }
    })
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // 保存配置
  const handleSaveConfig = async () => {
    // 前端验证
    if (!validateConfig()) {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
      return
    }
    
    setIsSaving(true)
    setSaveStatus('idle')
    
    try {
      const baseUrl = typeof window !== 'undefined' ? '' : 'http://localhost:8000'
      const response = await fetch(`${baseUrl}/api/v1/plugins/${plugin.id}/config?version_id=${latestVersion?.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configValues)
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to save configuration')
      }
      
      setSaveStatus('success')
      setTimeout(() => {
        setSaveStatus('idle')
        // 刷新页面以加载最新配置
        window.location.reload()
      }, 1500)
    } catch (error: any) {
      console.error('Failed to save config:', error)
      setSaveStatus('error')
      setValidationErrors({ _general: error.message || 'Failed to save configuration' })
      setTimeout(() => setSaveStatus('idle'), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  const renderConfigForm = () => {
    if (!configSchema || !configSchema.properties) {
      return <p className="text-muted-foreground">No configuration schema available</p>
    }

    const { properties, required = [], title, description } = configSchema

    return (
      <div className="space-y-6">
        {title && (
          <div>
            <CardTitle className="mb-2">{title}</CardTitle>
            {description && (
              <CardDescription>{description}</CardDescription>
            )}
          </div>
        )}

        <div className="space-y-4">
          {Object.entries(properties).map(([key, prop]: [string, any]) => {
            const isRequired = required.includes(key)
            const fieldTitle = prop.title || key
            const fieldDescription = prop.description || ''
            const fieldType = prop.type || 'string'
            const defaultValue = prop.default

            return (
              <Card key={key}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <Label htmlFor={key}>
                        {fieldTitle}
                        {isRequired && <span className="text-destructive ml-1">*</span>}
                      </Label>
                      {fieldDescription && (
                        <CardDescription className="mt-1">{fieldDescription}</CardDescription>
                      )}
                      {validationErrors[key] && (
                        <p className="text-sm text-destructive mt-1">{validationErrors[key]}</p>
                      )}
                    </div>
                    <Badge variant="outline">{fieldType}</Badge>
                  </div>

                  <div className="mt-3">
                    {fieldType === 'boolean' ? (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={key}
                          checked={configValues[key] ?? defaultValue ?? false}
                          onCheckedChange={(checked) => setConfigValues({ ...configValues, [key]: checked })}
                        />
                        <Label htmlFor={key} className="cursor-pointer">
                          {configValues[key] ?? defaultValue ? 'Enabled' : 'Disabled'}
                          {defaultValue !== undefined && ` (default: ${defaultValue})`}
                        </Label>
                      </div>
                    ) : fieldType === 'integer' || fieldType === 'number' ? (
                      <div>
                        <Input
                          type="number"
                          id={key}
                          value={configValues[key] ?? defaultValue ?? ''}
                          onChange={(e) => {
                            const value = e.target.value === '' ? '' : Number(e.target.value)
                            setConfigValues({ ...configValues, [key]: value })
                            if (validationErrors[key]) {
                              const newErrors = { ...validationErrors }
                              delete newErrors[key]
                              setValidationErrors(newErrors)
                            }
                          }}
                          min={prop.minimum}
                          max={prop.maximum}
                          className={validationErrors[key] ? 'border-destructive' : ''}
                          placeholder={prop.default !== undefined ? String(prop.default) : ''}
                        />
                        {prop.minimum !== undefined && prop.maximum !== undefined && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Range: {prop.minimum} - {prop.maximum}
                          </p>
                        )}
                      </div>
                    ) : fieldType === 'array' ? (
                      <div>
                        <Textarea
                          id={key}
                          rows={3}
                          value={configValues[key] !== undefined ? JSON.stringify(configValues[key], null, 2) : (defaultValue ? JSON.stringify(defaultValue, null, 2) : '')}
                          onChange={(e) => {
                            try {
                              const parsed = JSON.parse(e.target.value)
                              setConfigValues({ ...configValues, [key]: parsed })
                            } catch {
                              setConfigValues({ ...configValues, [key]: e.target.value })
                            }
                          }}
                          className="font-mono text-sm"
                          placeholder="Array configuration (JSON format)"
                        />
                        {prop.items && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Item type: {prop.items.type || 'any'}
                          </p>
                        )}
                      </div>
                    ) : fieldType === 'object' ? (
                      <div>
                        <Textarea
                          id={key}
                          rows={6}
                          value={configValues[key] !== undefined ? JSON.stringify(configValues[key], null, 2) : (defaultValue ? JSON.stringify(defaultValue, null, 2) : '{}')}
                          onChange={(e) => {
                            try {
                              const parsed = JSON.parse(e.target.value)
                              setConfigValues({ ...configValues, [key]: parsed })
                            } catch {
                              setConfigValues({ ...configValues, [key]: e.target.value })
                            }
                          }}
                          className="font-mono text-sm"
                          placeholder="Object configuration (JSON format)"
                        />
                        {prop.properties && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Nested properties: {Object.keys(prop.properties).join(', ')}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div>
                        <Input
                          type={prop.format === 'password' ? 'password' : 'text'}
                          id={key}
                          value={configValues[key] ?? defaultValue ?? ''}
                          onChange={(e) => {
                            setConfigValues({ ...configValues, [key]: e.target.value })
                            if (validationErrors[key]) {
                              const newErrors = { ...validationErrors }
                              delete newErrors[key]
                              setValidationErrors(newErrors)
                            }
                          }}
                          minLength={prop.minLength}
                          maxLength={prop.maxLength}
                          pattern={prop.pattern}
                          className={validationErrors[key] ? 'border-destructive' : ''}
                          placeholder={prop.default || `Enter ${fieldTitle.toLowerCase()}`}
                        />
                        {prop.pattern && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Pattern: {prop.pattern}
                          </p>
                        )}
                        {prop.format && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Format: {prop.format}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {required.length > 0 && (
          <Alert>
            <AlertDescription>
              <strong>Required fields:</strong> {required.join(', ')}
            </AlertDescription>
          </Alert>
        )}

        {/* 保存按钮 */}
        <div className="mt-6 flex items-center justify-between pt-4 border-t">
          <div className="text-sm">
            {saveStatus === 'success' && (
              <span className="text-green-600">✓ Configuration saved successfully</span>
            )}
            {saveStatus === 'error' && (
              <span className="text-destructive">
                ✗ {validationErrors._general || 'Failed to save configuration'}
              </span>
            )}
            {Object.keys(validationErrors).length > 0 && !validationErrors._general && (
              <span className="text-destructive">Please fix validation errors before saving</span>
            )}
          </div>
          <Button
            onClick={handleSaveConfig}
            disabled={isSaving || Object.keys(validationErrors).length > 0}
          >
            {isSaving ? 'Saving...' : 'Save Configuration'}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Card>
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabType)}>
        <TabsList className="w-full justify-start border-b rounded-none">
          <TabsTrigger value="readme">README</TabsTrigger>
          {hasConfig && <TabsTrigger value="config">Configuration</TabsTrigger>}
          <TabsTrigger value="versions">Versions ({plugin.versions?.length || 0})</TabsTrigger>
          {plugin.type === 'enterprise' && plugin.backend_install_guide && (
            <TabsTrigger value="installation">Installation Guide</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="readme" className="mt-6">
          {readme ? (
            <pre className="whitespace-pre-wrap bg-muted p-4 rounded border text-sm">
              {readme}
            </pre>
          ) : (
            <p className="text-muted-foreground">No README available for this plugin</p>
          )}
        </TabsContent>

        <TabsContent value="config" className="mt-6">
          {hasConfig && renderConfigForm()}
        </TabsContent>

        <TabsContent value="versions" className="mt-6">
          <div className="space-y-2">
            {plugin.versions && plugin.versions.length > 0 ? (
              plugin.versions.map((version) => (
                <Card key={version.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">v{version.version}</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(version.created_at).toLocaleDateString()}
                      </span>
                      <Badge variant="outline">{version.channel}</Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">
                        {(version.file_size / 1024).toFixed(2)} KB
                      </span>
                      <Button size="sm">Download</Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-muted-foreground">No versions available</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="installation" className="mt-6">
          {plugin.type === 'enterprise' && plugin.backend_install_guide && (
            <Alert>
              <AlertDescription>
                <CardTitle className="mb-4">Backend Installation Required</CardTitle>
                <pre className="whitespace-pre-wrap text-sm bg-background p-4 rounded border mt-2">
                  {plugin.backend_install_guide}
                </pre>
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  )
}

