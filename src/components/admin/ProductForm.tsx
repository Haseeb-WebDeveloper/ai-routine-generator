'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { IProduct, BudgetRange, Gender, ProductType, AgeRange, Category, Texture, SkinType, SkinConcern, UseTime } from '@/types/product'
import { PRODUCT_TYPES, SKIN_TYPES, SKIN_CONCERNS, GENDERS, BUDGETS, TEXTURES, USE_TIMES, CATEGORIES, AGE_RANGES } from '@/constants/product'

interface Product extends IProduct {
  id: string
  created_at?: string
  updated_at?: string
}

interface ProductFormProps {
  formData: IProduct
  setFormData: (data: IProduct) => void
  editingProduct: Product | null
  loading: boolean
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
  handleArrayChange: (field: keyof IProduct, value: string, checked: boolean) => void
}

export default function ProductForm({
  formData,
  setFormData,
  editingProduct,
  loading,
  onSubmit,
  onCancel,
  handleArrayChange
}: ProductFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</CardTitle>
        <CardDescription>
          {editingProduct ? 'Update product information' : 'Add a new skincare product to the database'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
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
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                {AGE_RANGES.map((age) => (
                  <div key={age} className="flex items-center space-x-2">
                    <Checkbox
                      id={`age_${age}`}
                      checked={formData.age.includes(age)}
                      onCheckedChange={(checked) => handleArrayChange('age', age, checked as boolean)}
                    />
                    <Label htmlFor={`age_${age}`} className="text-sm">
                      {age}
                    </Label>
                  </div>
                ))}
              </div>
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
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
