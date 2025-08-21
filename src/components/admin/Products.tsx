'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus, Upload, Download, FileText, Save, X, AlertCircle, Package } from 'lucide-react'
import toast from 'react-hot-toast'
import { IProduct } from '@/types/product'
import ProductCard from './ProductCard'
import ProductFormDialog from './ProductFormDialog'
import SearchAndFilters from './SearchAndFilters'
import { 
  Filters, 
  applyFilters, 
  clearFilters as clearFiltersUtil, 
  getBudgetColor,
  parseCsvData,
  validateCsvData,
  downloadProductTemplate
} from './productUtils'

interface Product extends IProduct {
  id: string
  created_at?: string
  updated_at?: string
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showFormDialog, setShowFormDialog] = useState(false)
  const [showBulkUpload, setShowBulkUpload] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [csvData, setCsvData] = useState<any[]>([])
  const [csvHeaders, setCsvHeaders] = useState<string[]>([])
  const [csvErrors, setCsvErrors] = useState<string[]>([])
  const [isProcessingCsv, setIsProcessingCsv] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<Filters>(clearFiltersUtil())
  const [showFilters, setShowFilters] = useState(false)
  
  const [formData, setFormData] = useState<IProduct>({
    id: '',
    name: '',
    brand: '',
    type: 'cleanser',
    gender: 'unisex',
    age: [],
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

  // Apply filters whenever products or filters change
  useEffect(() => {
    const filtered = applyFilters(products, searchTerm, filters)
    setFilteredProducts(filtered)
  }, [products, searchTerm, filters])

  // Sync form data when editing product changes
  useEffect(() => {
    if (editingProduct) {
      console.log('Editing product changed, syncing form:', editingProduct)
      
      // Ensure all arrays are properly formatted and mapped correctly
      const mappedFormData = {
        id: editingProduct.id,
        name: editingProduct.name,
        brand: editingProduct.brand,
        type: editingProduct.type,
        gender: editingProduct.gender,
        age: Array.isArray(editingProduct.age) ? editingProduct.age : (editingProduct.age ? [editingProduct.age] : []),
        budget: editingProduct.budget,
        category: editingProduct.category,
        use_time: Array.isArray(editingProduct.use_time) ? editingProduct.use_time : (editingProduct.use_time ? [editingProduct.use_time] : []),
        skin_types: Array.isArray(editingProduct.skin_types) ? editingProduct.skin_types : (editingProduct.skin_types ? [editingProduct.skin_types] : []),
        skin_concerns: Array.isArray(editingProduct.skin_concerns) ? editingProduct.skin_concerns : (editingProduct.skin_concerns ? [editingProduct.skin_concerns] : []),
        ingredients: Array.isArray(editingProduct.ingredients) ? editingProduct.ingredients : (editingProduct.ingredients ? [editingProduct.ingredients] : []),
        texture: editingProduct.texture,
        fragrance_free: editingProduct.fragrance_free,
        alcohol_free: editingProduct.alcohol_free,
        instructions: editingProduct.instructions,
        price: editingProduct.price,
        purchase_link: editingProduct.purchase_link,
        image_url: editingProduct.image_url
      }
      
      console.log('Setting form data to:', mappedFormData)
      setFormData(mappedFormData)
    }
  }, [editingProduct])

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
        setShowFormDialog(false)
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
    console.log('Editing product:', product)
    setEditingProduct(product)
    setShowFormDialog(true)
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
      id: '',
      name: '',
      brand: '',
      type: 'cleanser',
      gender: 'unisex',
      age: [],
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
          const errors = validateCsvData(result.data)
          setCsvErrors(errors)
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
  
  const handleCsvDataChange = (rowIndex: number, header: string, value: string) => {
    const newData = [...csvData]
    
    // Handle special cases based on header type
    if (['use_time', 'skin_types', 'skin_concerns'].includes(header)) {
      // For array values, split by comma or semicolon
      const separator = value.includes(';') ? ';' : ','
      newData[rowIndex][header] = value.split(separator).map(v => v.trim()).filter(Boolean)
    } else if (header === 'age') {
      // For age, split by semicolon or comma
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
    const errors = validateCsvData(newData)
    setCsvErrors(errors)
  }
  
  const handleBulkUpload = async () => {
    if (csvData.length === 0) return
    
    // Validate data before upload
    const errors = validateCsvData(csvData)
    if (errors.length === 0) {
      setIsProcessingCsv(true)
      
      try {
        // Convert CSV data to product format
        const productsToUpload = csvData.map(row => {
          // Ensure all arrays are properly formatted
          const use_time = Array.isArray(row.use_time) ? row.use_time : []
          const skin_types = Array.isArray(row.skin_types) ? row.skin_types : []
          const skin_concerns = Array.isArray(row.skin_concerns) ? row.skin_concerns : []
          const age = Array.isArray(row.age) ? row.age : (row.age ? [row.age] : [])
          
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
            id: '',
            name: row.name,
            brand: row.brand,
            type: row.type as any,
            gender: row.gender as any,
            age: age as any,
            budget: row.budget as any,
            category: row.category as any,
            use_time: use_time as any,
            skin_types: skin_types as any,
            skin_concerns: skin_concerns as any,
            ingredients: ingredients,
            texture: row.texture as any,
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

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleArrayFilterChange = (key: string, value: string, checked: boolean) => {
    setFilters(prev => {
      const currentArray = prev[key as keyof Filters] as string[]
      if (checked) {
        return { ...prev, [key]: [...currentArray, value] }
      } else {
        return { ...prev, [key]: currentArray.filter(item => item !== value) }
      }
    })
  }

  const clearFilters = () => {
    setSearchTerm('')
    setFilters(clearFiltersUtil())
  }

  const handleArrayChange = (field: keyof IProduct, value: string, checked: boolean) => {
    const currentArray = formData[field] as string[]
    if (checked) {
      if (!currentArray.includes(value)) {
        setFormData({
          ...formData,
          [field]: [...currentArray, value]
        })
      }
    } else {
      setFormData({
        ...formData,
        [field]: currentArray.filter(item => item !== value)
      })
    }
  }

  const openAddProductDialog = () => {
    resetForm()
    setEditingProduct(null)
    setShowFormDialog(true)
  }

  const closeFormDialog = () => {
    setShowFormDialog(false)
    setEditingProduct(null)
    resetForm()
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
          <h2 className="text-2xl font-bold text-gray-900">
            Skincare Products ({filteredProducts.length} of {products.length})
          </h2>
          <p className="text-gray-600">Manage your product database</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => {
            setShowBulkUpload(true)
            setShowFormDialog(false)
          }}>
            <Upload className="h-4 w-4 mr-2" />
            Bulk Upload
          </Button>
          <Button onClick={openAddProductDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <SearchAndFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filters={filters}
        setFilters={setFilters}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        clearFilters={clearFilters}
        handleFilterChange={handleFilterChange}
        handleArrayFilterChange={handleArrayFilterChange}
        filteredProductsCount={filteredProducts.length}
        totalProductsCount={products.length}
      />

      {showBulkUpload && (
        <Card>
          <CardContent className="p-6">
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
                                value={
                                  Array.isArray(row[header])
                                    ? row[header].join(';')
                                    : row[header] || ''
                                }
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

      {/* Product Form Dialog */}
      <ProductFormDialog
        formData={formData}
        setFormData={setFormData}
        editingProduct={editingProduct}
        loading={loading}
        onSubmit={handleSubmit}
        onCancel={closeFormDialog}
        handleArrayChange={handleArrayChange}
        open={showFormDialog}
        onOpenChange={setShowFormDialog}
      />

      <div className="grid gap-6 lg:grid-cols-2 2xl:grid-cols-3">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onEdit={handleEdit}
            onDelete={handleDelete}
            getBudgetColor={getBudgetColor}
          />
        ))}
      </div>

      {filteredProducts.length === 0 && !showFormDialog && (
        <Card>
          <CardContent className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || Object.values(filters).some(v => 
                Array.isArray(v) ? v.length > 0 : v !== '' && v !== null
              ) ? 'No products match your filters' : 'No products yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || Object.values(filters).some(v => 
                Array.isArray(v) ? v.length > 0 : v !== '' && v !== null
              ) ? 'Try adjusting your search criteria or filters' : 'Add your first skincare product to get started'}
            </p>
            <div className="space-x-2">
              {(searchTerm || Object.values(filters).some(v => 
                Array.isArray(v) ? v.length > 0 : v !== '' && v !== null
              )) && (
                <Button variant="outline" onClick={clearFilters} className="mr-2">
                  Clear Filters
                </Button>
              )}
              <Button onClick={openAddProductDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
