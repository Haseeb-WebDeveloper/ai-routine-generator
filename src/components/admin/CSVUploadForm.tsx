'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'
import { Upload, Download, CheckCircle, AlertCircle, FileText } from 'lucide-react'
import toast from 'react-hot-toast'

interface CSVUser {
  name: string
  email: string
}

export default function CSVUploadForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setSelectedFile(file)
        setResult(null)
      } else {
        toast.error('Please select a valid CSV file')
        setSelectedFile(null)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedFile) {
      toast.error('Please select a CSV file')
      return
    }

    setIsLoading(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await fetch('/api/admin/upload-csv', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
        toast.success(`Successfully processed CSV: ${data.added} users added`)
        setSelectedFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      } else {
        toast.error(data.error || 'Failed to process CSV')
        setResult({ error: data.error })
      }
    } catch (error) {
      toast.error('An error occurred while processing the CSV')
      setResult({ error: 'Network error' })
    } finally {
      setIsLoading(false)
    }
  }

  const downloadTemplate = () => {
    const csvContent = 'name,email\nJohn Doe,john@example.com\nJane Smith,jane@example.com\nBob Johnson,bob@example.com'
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'user_template.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload CSV File</CardTitle>
        <CardDescription>
          Upload a CSV file containing user names and email addresses to bulk import users.
          The CSV should have "name" and "email" columns with valid data.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isLoading}
              />
              
              {!selectedFile ? (
                <div className="space-y-4">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Select CSV File
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500">
                    or drag and drop a CSV file here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <FileText className="mx-auto h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedFile.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedFile(null)
                      if (fileInputRef.current) {
                        fileInputRef.current.value = ''
                      }
                    }}
                    disabled={isLoading}
                  >
                    Remove File
                  </Button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={downloadTemplate}
                disabled={isLoading}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading || !selectedFile}
            className="w-full"
          >
            {isLoading ? 'Processing CSV...' : 'Upload and Process CSV'}
          </Button>
        </form>

        {result && (
          <div className="mt-6">
            {result.error ? (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <div className="ml-2">
                  <h4 className="text-sm font-medium text-red-800">Error</h4>
                  <p className="text-sm text-red-700">{result.error}</p>
                </div>
              </Alert>
            ) : (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div className="ml-2">
                  <h4 className="text-sm font-medium text-green-800">Success</h4>
                  <div className="text-sm text-green-700 space-y-1">
                    <p>Added: {result.added} users</p>
                    {result.existing > 0 && (
                      <p>Already existed: {result.existing} users</p>
                    )}
                    <p>Total processed: {result.total} users</p>
                  </div>
                </div>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
