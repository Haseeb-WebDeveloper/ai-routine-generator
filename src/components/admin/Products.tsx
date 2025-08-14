'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Edit, Trash2, Package, DollarSign, Star, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import { IProduct, BudgetRange, Gender, ProductType, AgeRange, Category, Texture } from '@/types/product'
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
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
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
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

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
