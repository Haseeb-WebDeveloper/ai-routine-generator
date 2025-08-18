'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Edit, Trash2, Package, DollarSign, Star, Users, Upload, Download, FileText, Save, X, Check, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { IProduct, BudgetRange, Gender, ProductType, AgeRange, Category, Texture, SkinType, SkinConcern, UseTime } from '@/types/product'
import { PRODUCT_TYPES, SKIN_TYPES, SKIN_CONCERNS, GENDERS, BUDGETS, TEXTURES, USE_TIMES, CATEGORIES, AGE_RANGES } from '@/constants/product'


interface Product extends IProduct {
  id: string
  created_at?: string
  updated_at?: string
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showBulkUpload, setShowBulkUpload] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [csvData, setCsvData] = useState<any[]>([])
  const [csvHeaders, setCsvHeaders] = useState<string[]>([])
  const [csvErrors, setCsvErrors] = useState<string[]>([])
  const [isProcessingCsv, setIsProcessingCsv] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState<IProduct>({
    name: '',
    brand: '',
    type: 'cleanser',
    gender: 'unisex',
    age: '18-25',
    budget: 'midRange',
    category: 'core',
    use_time: [],
    skin_types: [],
    skin_concerns: [],
    ingredients: [],
    texture: 'cream',
    fragrance_free: true,
    alcohol_free: true,
    instructions: '',
    price: 0,
    purchase_link: '',
    image_url: ''
  })

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/admin/products')
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products)
      } else {
        toast.error('Failed to load products')
      }
    } catch (error) {
      console.error('Error loading products:', error)
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editingProduct 
        ? `/api/admin/products/${editingProduct.id}`
        : '/api/admin/products'
      
      const method = editingProduct ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success(editingProduct ? 'Product updated!' : 'Product created!')
        setShowForm(false)
        setEditingProduct(null)
        resetForm()
        await loadProducts()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Something went wrong')
      }
    } catch (error) {
      toast.error('Failed to save product')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      brand: product.brand,
      type: product.type,
      gender: product.gender,
      age: product.age,
      budget: product.budget,
      category: product.category,
      use_time: product.use_time,
      skin_types: product.skin_types,
      skin_concerns: product.skin_concerns,
      ingredients: product.ingredients,
      texture: product.texture,
      fragrance_free: product.fragrance_free,
      alcohol_free: product.alcohol_free,
      instructions: product.instructions,
      price: product.price,
      purchase_link: product.purchase_link,
      image_url: product.image_url
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Product deleted!')
        await loadProducts()
      } else {
        toast.error('Failed to delete product')
      }
    } catch (error) {
      toast.error('Failed to delete product')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      brand: '',
      type: 'cleanser',
      gender: 'unisex',
      age: '18-25',
      budget: 'midRange',
      category: 'core',
      use_time: [],
      skin_types: [],
      skin_concerns: [],
      ingredients: [],
      texture: 'cream',
      fragrance_free: true,
      alcohol_free: true,
      instructions: '',
      price: 0,
      purchase_link: '',
      image_url: ''
    })
    setEditingProduct(null)
  }

  const handleCsvFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
      setIsProcessingCsv(true)
      setCsvErrors([])
      
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const text = event.target?.result as string
          const result = parseCsvData(text)
          setCsvHeaders(result.headers)
          setCsvData(result.data)
          validateCsvData(result.data)
        } catch (error) {
          setCsvErrors([`Failed to parse CSV file: ${error instanceof Error ? error.message : String(error)}`])
          setCsvData([])
          setCsvHeaders([])
        } finally {
          setIsProcessingCsv(false)
        }
      }
      
      reader.onerror = () => {
        setCsvErrors(['Failed to read the file'])
        setIsProcessingCsv(false)
      }
      
      reader.readAsText(file)
    } else {
      toast.error('Please select a valid CSV file')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }
  
  const parseCsvData = (csvText: string) => {
    const lines = csvText.split('\n')
    const headers = lines[0].split(',').map(header => header.trim())
    
    // Validate required headers
    const requiredHeaders = ['name', 'brand', 'type', 'gender', 'age', 'budget', 'category', 'texture', 'price', 'instructions']
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))
    
    if (missingHeaders.length > 0) {
      throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`)
    }
    
    const data = []
    
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue
      
      // Handle quoted fields with commas inside them
      let values: string[] = []
      let currentLine = lines[i]
      
      // Parse CSV line handling quoted values with commas
      let inQuotes = false
      let currentValue = ''
      
      for (let j = 0; j < currentLine.length; j++) {
        const char = currentLine[j]
        
        if (char === '"' && (j === 0 || currentLine[j-1] !== '\\')) {
          inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
          values.push(currentValue.trim())
          currentValue = ''
        } else {
          currentValue += char
        }
      }
      
      // Add the last value
      values.push(currentValue.trim())
      
      // Clean up quotes from values
      values = values.map(v => v.replace(/^"|"$/g, ''))
      
      const row: Record<string, any> = {}
      
      headers.forEach((header, index) => {
        // Handle array values that might be in format "value1,value2" or comma-separated list
        if (['use_time', 'skin_types', 'skin_concerns'].includes(header)) {
          let arrayValue = values[index] || ''
          
          // If it looks like a JSON array, try to parse it
          if (arrayValue.startsWith('[') && arrayValue.endsWith(']')) {
            try {
              row[header] = JSON.parse(arrayValue)
            } catch {
              // If parsing fails, fall back to comma splitting
              arrayValue = arrayValue.replace(/^\[|\]$/g, '').trim()
              row[header] = arrayValue ? arrayValue.split(',').map(v => v.trim()) : []
            }
          } else {
            // Simple comma or semicolon-separated list
            const separator = arrayValue.includes(';') ? ';' : ','
            row[header] = arrayValue ? arrayValue.split(separator).map(v => v.trim()) : []
          }
          
          // Validate use_time values against USE_TIMES
          if (header === 'use_time') {
            row[header] = row[header].filter((time: string) => USE_TIMES.includes(time as UseTime))
          }
        } 
        // Handle boolean values
        else if (['fragrance_free', 'alcohol_free'].includes(header)) {
          const value = values[index]?.toLowerCase()
          row[header] = value === 'true' || value === 'yes' || value === '1'
        }
        // Handle numeric values
        else if (header === 'price') {
          row[header] = parseFloat(values[index] || '0')
        }
        // Handle ingredients as array of objects
        else if (header === 'ingredients') {
          try {
            let ingredientsStr = values[index] || ''
            
            // If it looks like a JSON array, try to parse it
            if (ingredientsStr.startsWith('[') && ingredientsStr.endsWith(']')) {
              try {
                row[header] = JSON.parse(ingredientsStr)
              } catch {
                row[header] = []
              }
            } else {
              // Parse format like "name1:function1;name2:function2" or with commas
              const separator = ingredientsStr.includes(';') ? ';' : ','
              const ingredients = ingredientsStr.split(separator).map(item => {
                const [name, func] = item.split(':').map(part => part.trim())
                return { name, function: func || '' }
              }).filter(item => item.name) // Filter out empty items
              
              row[header] = ingredients
            }
          } catch {
            row[header] = []
          }
        }
        // Handle regular string values
        else {
          row[header] = values[index] || ''
        }
      })
      
      data.push(row)
    }
    
    return { headers, data }
  }
  
  const validateCsvData = (data: any[]) => {
    const errors: string[] = []
    
    data.forEach((row, index) => {
      // Check required fields
      if (!row.name) errors.push(`Row ${index + 1}: Product name is required`)
      if (!row.brand) errors.push(`Row ${index + 1}: Brand is required`)
      if (!row.instructions) errors.push(`Row ${index + 1}: Instructions are required`)
      
      // Validate product type
      if (!row.type || !PRODUCT_TYPES.includes(row.type)) {
        errors.push(`Row ${index + 1}: Invalid product type: ${row.type}. Must be one of: ${PRODUCT_TYPES.join(', ')}`)
      }
      
      // Validate gender
      if (!row.gender || !GENDERS.includes(row.gender)) {
        errors.push(`Row ${index + 1}: Invalid gender: ${row.gender}. Must be one of: ${GENDERS.join(', ')}`)
      }
      
      // Validate age range
      if (!row.age || !AGE_RANGES.includes(row.age)) {
        errors.push(`Row ${index + 1}: Invalid age range: ${row.age}. Must be one of: ${AGE_RANGES.join(', ')}`)
      }
      
      // Validate budget
      if (!row.budget || !BUDGETS.includes(row.budget)) {
        errors.push(`Row ${index + 1}: Invalid budget: ${row.budget}. Must be one of: ${BUDGETS.join(', ')}`)
      }
      
      // Validate category
      if (!row.category || !CATEGORIES.includes(row.category)) {
        errors.push(`Row ${index + 1}: Invalid category: ${row.category}. Must be one of: ${CATEGORIES.join(', ')}`)
      }
      
      // Validate texture
      if (!row.texture || !TEXTURES.includes(row.texture)) {
        errors.push(`Row ${index + 1}: Invalid texture: ${row.texture}. Must be one of: ${TEXTURES.join(', ')}`)
      }
      
      // Validate use_time values
      if (row.use_time && Array.isArray(row.use_time)) {
        if (row.use_time.length === 0) {
          errors.push(`Row ${index + 1}: At least one use time is required`)
        } else {
          row.use_time.forEach((time: string) => {
            if (!USE_TIMES.includes(time as UseTime)) {
              errors.push(`Row ${index + 1}: Invalid use time: ${time}. Must be one of: ${USE_TIMES.join(', ')}`)
            }
          })
        }
      } else {
        errors.push(`Row ${index + 1}: Use time must be an array`)
      }
      
      // Validate skin_types values
      if (row.skin_types && Array.isArray(row.skin_types)) {
        if (row.skin_types.length === 0) {
          errors.push(`Row ${index + 1}: At least one skin type is required`)
        } else {
          row.skin_types.forEach((type: string) => {
            if (!SKIN_TYPES.includes(type as SkinType)) {
              errors.push(`Row ${index + 1}: Invalid skin type: ${type}. Must be one of: ${SKIN_TYPES.join(', ')}`)
            }
          })
        }
      } else {
        errors.push(`Row ${index + 1}: Skin types must be an array`)
      }
      
      // Validate skin_concerns values
      if (row.skin_concerns && Array.isArray(row.skin_concerns)) {
        if (row.skin_concerns.length === 0) {
          errors.push(`Row ${index + 1}: At least one skin concern is required`)
        } else {
          row.skin_concerns.forEach((concern: string) => {
            if (!SKIN_CONCERNS.includes(concern as SkinConcern)) {
              errors.push(`Row ${index + 1}: Invalid skin concern: ${concern}. Must be one of: ${SKIN_CONCERNS.join(', ')}`)
            }
          })
        }
      } else {
        errors.push(`Row ${index + 1}: Skin concerns must be an array`)
      }
      
      // Validate ingredients
      if (row.ingredients) {
        if (!Array.isArray(row.ingredients)) {
          errors.push(`Row ${index + 1}: Ingredients must be an array`)
        } else if (row.ingredients.length === 0) {
          // Empty ingredients array is allowed, but we'll warn about it
          console.warn(`Row ${index + 1}: No ingredients provided`)
        } else {
          // Check that each ingredient has name and function
          row.ingredients.forEach((ingredient: any, i: number) => {
            if (!ingredient.name) {
              errors.push(`Row ${index + 1}: Ingredient ${i + 1} is missing a name`)
            }
            if (!ingredient.function) {
              errors.push(`Row ${index + 1}: Ingredient ${i + 1} is missing a function`)
            }
          })
        }
      }
      
      // Validate price is a number
      if (isNaN(row.price)) {
        errors.push(`Row ${index + 1}: Price must be a number`)
      }
    })
    
    setCsvErrors(errors)
    return errors.length === 0
  }
  
  const handleCsvDataChange = (rowIndex: number, header: string, value: string) => {
    const newData = [...csvData]
    
    // Handle special cases based on header type
    if (['use_time', 'skin_types', 'skin_concerns'].includes(header)) {
      // For array values, split by comma or semicolon
      const separator = value.includes(';') ? ';' : ','
      newData[rowIndex][header] = value.split(separator).map(v => v.trim()).filter(Boolean)
    } else if (['fragrance_free', 'alcohol_free'].includes(header)) {
      // For boolean values
      const lowerValue = value.toLowerCase()
      newData[rowIndex][header] = lowerValue === 'true' || lowerValue === 'yes' || lowerValue === '1'
    } else if (header === 'price') {
      // For numeric values
      newData[rowIndex][header] = parseFloat(value) || 0
    } else if (header === 'ingredients') {
      try {
        // Try to parse as JSON if it looks like JSON
        if (value.trim().startsWith('[')) {
          newData[rowIndex][header] = JSON.parse(value)
        } else {
          // Parse simple format: name1:function1;name2:function2 (or with commas)
          const separator = value.includes(';') ? ';' : ','
          const ingredients = value.split(separator).map(item => {
            const [name, func] = item.split(':').map(part => part.trim())
            return { name, function: func || '' }
          }).filter(item => item.name) // Filter out empty items
          
          newData[rowIndex][header] = ingredients
        }
      } catch {
        // Keep as string if parsing fails
        newData[rowIndex][header] = value
      }
    } else {
      // For regular string values
      newData[rowIndex][header] = value
    }
    
    setCsvData(newData)
    validateCsvData(newData)
  }
  
  const handleBulkUpload = async () => {
    if (csvData.length === 0) return
    
    // Validate data before upload
    if (validateCsvData(csvData)) {
      setIsProcessingCsv(true)
      
      try {
        // Convert CSV data to product format
        const productsToUpload = csvData.map(row => {
          // Ensure all arrays are properly formatted
          const use_time = Array.isArray(row.use_time) ? row.use_time : []
          const skin_types = Array.isArray(row.skin_types) ? row.skin_types : []
          const skin_concerns = Array.isArray(row.skin_concerns) ? row.skin_concerns : []
          
          // Ensure ingredients is an array of objects with name and function
          let ingredients = []
          if (Array.isArray(row.ingredients)) {
            ingredients = row.ingredients.map((ing: any) => {
              if (typeof ing === 'string') {
                // If it's a string, try to parse as "name:function"
                const [name, func] = ing.split(':').map(part => part.trim())
                return { name: name || '', function: func || '' }
              } else if (typeof ing === 'object' && ing !== null) {
                // If it's already an object, ensure it has name and function
                return {
                  name: ing.name || '',
                  function: ing.function || ''
                }
              }
              return { name: '', function: '' }
            }).filter((ing: any) => ing.name) // Filter out empty ingredients
          }
          
          const product: IProduct = {
            name: row.name,
            brand: row.brand,
            type: row.type as ProductType,
            gender: row.gender as Gender,
            age: row.age as AgeRange,
            budget: row.budget as BudgetRange,
            category: row.category as Category,
            use_time: use_time as UseTime[],
            skin_types: skin_types as SkinType[],
            skin_concerns: skin_concerns as SkinConcern[],
            ingredients: ingredients,
            texture: row.texture as Texture,
            fragrance_free: Boolean(row.fragrance_free),
            alcohol_free: Boolean(row.alcohol_free),
            instructions: row.instructions,
            price: parseFloat(row.price) || 0,
            purchase_link: row.purchase_link || '',
            image_url: row.image_url || ''
          }
          return product
        })
        
        // Send to API endpoint
        const response = await fetch('/api/admin/products/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ products: productsToUpload })
        })
        
        const result = await response.json()
        
        if (response.ok) {
          toast.success(`Successfully uploaded ${result.added} products`)
          setCsvData([])
          setCsvHeaders([])
          setCsvErrors([])
          setShowBulkUpload(false)
          await loadProducts()
        } else {
          toast.error(result.error || 'Failed to upload products')
        }
      } catch (error) {
        console.error('Error during bulk upload:', error)
        toast.error('Failed to process bulk upload')
      } finally {
        setIsProcessingCsv(false)
      }
    } else {
      toast.error('Please fix the validation errors before uploading')
    }
  }
  
    const downloadProductTemplate = () => {
    // Create a template with all required fields and examples
    const headers = [
      'name',
      'brand',
      'type',
      'gender',
      'age',
      'budget',
      'category',
      'use_time',
      'skin_types',
      'skin_concerns',
      'texture',
      'fragrance_free',
      'alcohol_free',
      'ingredients',
      'price',
      'purchase_link',
      'image_url',
      'instructions'
    ].join(',')
    
    // Example row 1
    const exampleRow1 = [
      'Gentle Hydrating Cleanser',
      'CeraVe',
      'cleanser',
      'unisex',
      '18-25',
      'budgetFriendly',
      'core',
      'morning;night',
      'dry;sensitive',
      'dryness;sensitivity',
      'cream',
      'true',
      'true',
      'Ceramides:Hydration;Hyaluronic Acid:Moisture',
      '12.99',
      'https://example.com/product',
      'https://example.com/image.jpg',
      'Apply to damp skin massage gently rinse thoroughly.'
    ].join(',')
    
    // Example row 2
    const exampleRow2 = [
      'Vitamin C Brightening Serum',
      'The Ordinary',
      'vitaminC',
      'unisex',
      '26-35',
      'midRange',
      'treatment',
      'morning',
      'combination;normal',
      'dullness;hyperpigmentation',
      'gel',
      'true',
      'true',
      'Vitamin C:Brightening;Ferulic Acid:Antioxidant',
      '6.99',
      'https://example.com/product2',
      'https://example.com/image2.jpg',
      'Apply a few drops to clean skin in the morning before moisturizer.'
    ].join(',')
    
    // Add a comment line explaining the format
    const comment = '# IMPORTANT: For arrays (use_time, skin_types, skin_concerns), use SEMICOLONS (;) as separators, not commas. For ingredients, use format "name:function;name2:function2". See product_csv_guide.md for full documentation.'
    
    const csvContent = `${comment}\n${headers}\n${exampleRow1}\n${exampleRow2}`
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'product_template.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const handleArrayChange = (field: keyof IProduct, value: string, checked: boolean) => {
    const currentArray = formData[field] as string[]
    if (checked) {
      setFormData({
        ...formData,
        [field]: [...currentArray, value]
      })
    } else {
      setFormData({
        ...formData,
        [field]: currentArray.filter(item => item !== value)
      })
    }
  }

  const getBudgetColor = (budget: BudgetRange) => {
    const colors = {
      budgetFriendly: 'bg-green-100 text-green-800',
      midRange: 'bg-yellow-100 text-yellow-800',
      Premium: 'bg-red-100 text-red-800'
    }
    return colors[budget]
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Skincare Products</h2>
          <p className="text-gray-600">Manage your product database</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => {
            setShowBulkUpload(true)
            setShowForm(false)
          }}>
            <Upload className="h-4 w-4 mr-2" />
            Bulk Upload
          </Button>
          <Button onClick={() => {
            setShowForm(true)
            setShowBulkUpload(false)
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {showBulkUpload && (
        <Card>
          <CardHeader>
            <CardTitle>Bulk Upload Products</CardTitle>
            <CardDescription>
              Upload a CSV file containing product data to import multiple products at once.
              You can edit the data before finalizing the import.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {csvData.length === 0 ? (
              <div className="space-y-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleCsvFileSelect}
                    className="hidden"
                    disabled={isProcessingCsv}
                  />
                  
                  <div className="space-y-4">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isProcessingCsv}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Select CSV File
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500">
                      or drag and drop a CSV file here
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={downloadProductTemplate}
                      disabled={isProcessingCsv}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Template
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open('/product_csv_guide.md', '_blank')}
                      disabled={isProcessingCsv}
                    >
                      View CSV Guide
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {csvErrors.length > 0 && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <div className="ml-2">
                      <h4 className="text-sm font-medium text-red-800">Validation Errors</h4>
                      <ul className="text-sm text-red-700 list-disc pl-5">
                        {csvErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </Alert>
                )}
                
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        {csvHeaders.map((header, index) => (
                          <th key={index} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {csvData.map((row, rowIndex) => (
                        <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          {csvHeaders.map((header, colIndex) => (
                            <td key={`${rowIndex}-${colIndex}`} className="px-4 py-2 text-sm text-gray-900">
                              <input
                                type="text"
                                className="w-full border-0 bg-transparent focus:ring-2 focus:ring-blue-500 rounded p-1"
                                value={row[header] || ''}
                                onChange={(e) => handleCsvDataChange(rowIndex, header, e.target.value)}
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="flex justify-between mt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCsvData([])
                      setCsvHeaders([])
                      setCsvErrors([])
                      if (fileInputRef.current) {
                        fileInputRef.current.value = ''
                      }
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleBulkUpload}
                    disabled={isProcessingCsv || csvErrors.length > 0}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isProcessingCsv ? 'Uploading...' : 'Save All Products'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</CardTitle>
            <CardDescription>
              {editingProduct ? 'Update product information' : 'Add a new skincare product to the database'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Gentle Daily Cleanser"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="e.g., CeraVe"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Product Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: ProductType) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCT_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value: Gender) => setFormData({ ...formData, gender: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {GENDERS.map((gender) => (
                        <SelectItem key={gender} value={gender}>
                          {gender}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">Age Range</Label>
                  <Select
                    value={formData.age}
                    onValueChange={(value: AgeRange) => setFormData({ ...formData, age: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AGE_RANGES.map((age) => (
                        <SelectItem key={age} value={age}>
                          {age}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget">Budget</Label>
                  <Select
                    value={formData.budget}
                    onValueChange={(value: BudgetRange) => setFormData({ ...formData, budget: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BUDGETS.map((budget) => (
                        <SelectItem key={budget} value={budget}>
                          {budget}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value: Category) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Use Time</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {USE_TIMES.map((time) => (
                      <div key={time} className="flex items-center space-x-2">
                        <Checkbox
                          id={`use_time_${time}`}
                          checked={formData.use_time.includes(time)}
                          onCheckedChange={(checked) => handleArrayChange('use_time', time, checked as boolean)}
                        />
                        <Label htmlFor={`use_time_${time}`} className="text-sm">
                          {time}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="texture">Texture</Label>
                  <Select
                    value={formData.texture}
                    onValueChange={(value: Texture) => setFormData({ ...formData, texture: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TEXTURES.map((texture) => (
                        <SelectItem key={texture} value={texture}>
                          {texture}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Skin Types</Label>
                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                    {SKIN_TYPES.map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={`skin_type_${type}`}
                          checked={formData.skin_types.includes(type)}
                          onCheckedChange={(checked) => handleArrayChange('skin_types', type, checked as boolean)}
                        />
                        <Label htmlFor={`skin_type_${type}`} className="text-sm">
                          {type}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Skin Concerns</Label>
                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                    {SKIN_CONCERNS.map((concern) => (
                      <div key={concern} className="flex items-center space-x-2">
                        <Checkbox
                          id={`concern_${concern}`}
                          checked={formData.skin_concerns.includes(concern)}
                          onCheckedChange={(checked) => handleArrayChange('skin_concerns', concern, checked as boolean)}
                        />
                        <Label htmlFor={`concern_${concern}`} className="text-sm">
                          {concern}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Product Properties</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="fragrance_free"
                        checked={formData.fragrance_free}
                        onCheckedChange={(checked) => setFormData({ ...formData, fragrance_free: checked as boolean })}
                      />
                      <Label htmlFor="fragrance_free" className="text-sm">Fragrance Free</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="alcohol_free"
                        checked={formData.alcohol_free}
                        onCheckedChange={(checked) => setFormData({ ...formData, alcohol_free: checked as boolean })}
                      />
                      <Label htmlFor="alcohol_free" className="text-sm">Alcohol Free</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price (USD)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="image_url">Image URL</Label>
                  <Input
                    id="image_url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purchase_link">Purchase Link</Label>
                  <Input
                    id="purchase_link"
                    value={formData.purchase_link}
                    onChange={(e) => setFormData({ ...formData, purchase_link: e.target.value })}
                    placeholder="https://example.com/product"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea
                  id="instructions"
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  placeholder="How to use this product..."
                  rows={3}
                  required
                />
              </div>

              <div className="flex space-x-2">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : (editingProduct ? 'Update Product' : 'Create Product')}
                </Button>
                <Button type="button" variant="outline" onClick={() => {
                  setShowForm(false)
                  resetForm()
                }}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2 2xl:grid-cols-3">
        {products.map((product) => (
          <Card key={product.id} className="flex flex-col h-full shadow-md hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-2 border-b">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">{product.name}</CardTitle>
                  <CardDescription className="text-sm text-gray-500">
                    <span className="font-medium">{product.brand}</span>
                    <span className="mx-1 text-gray-400">•</span>
                    <span>{product.type}</span>
                  </CardDescription>
                </div>
                <div className="flex flex-col items-end space-y-2 min-w-[90px]">
                  <Badge className={getBudgetColor(product.budget) + " px-2 py-1 text-sm"}>
                    ${product.price}
                  </Badge>
                  <div className="flex space-x-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEdit(product)}
                      aria-label="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDelete(product.id)}
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between py-4">
              <div className="grid grid-cols-2 md:grid-cols-2 gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-gray-400" />
                  <span className="text-xs text-gray-700">{product.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-xs text-gray-700 truncate">{product.skin_types.join(', ')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <span className="text-xs text-gray-700 capitalize">{product.budget} budget</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-gray-400" />
                  <span className="text-xs text-gray-700">{product.age}</span>
                </div>
              </div>
              <div className="mb-2">
                <div className="flex flex-wrap gap-1">
                  {product.skin_concerns.slice(0, 3).map((concern) => (
                    <Badge key={concern} variant="secondary" className="text-xs px-2 py-0.5">
                      {concern}
                    </Badge>
                  ))}
                  {product.skin_concerns.length > 3 && (
                    <Badge variant="secondary" className="text-xs px-2 py-0.5">
                      +{product.skin_concerns.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
              <div className="mt-2">
                <span className="block text-xs text-gray-500 font-medium mb-1">Use Time:</span>
                <div className="flex flex-wrap gap-1">
                  {product.use_time.map((time) => (
                    <Badge key={time} variant="outline" className="text-xs px-2 py-0.5">
                      {time}
                    </Badge>
                  ))}
                </div>
              </div>
              {product.purchase_link && (
                <div className="mt-3">
                  <a
                    href={product.purchase_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-xs text-blue-600 hover:underline"
                  >
                    Buy / View Product
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {products.length === 0 && !showForm && (
        <Card>
          <CardContent className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
            <p className="text-gray-600 mb-4">Add your first skincare product to get started</p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}