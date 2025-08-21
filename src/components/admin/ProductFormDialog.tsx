'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { IProduct, BudgetRange, Gender, ProductType, AgeRange, Category, Texture, SkinType, SkinConcern, UseTime } from '@/types/product'
import { PRODUCT_TYPES, SKIN_TYPES, SKIN_CONCERNS, GENDERS, BUDGETS, TEXTURES, USE_TIMES, CATEGORIES, AGE_RANGES } from '@/constants/product'
import { Plus, Edit } from 'lucide-react'

interface Product extends IProduct {
  id: string
  created_at?: string
  updated_at?: string
}

interface ProductFormDialogProps {
  formData: IProduct
  setFormData: (data: IProduct) => void
  editingProduct: Product | null
  loading: boolean
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
  handleArrayChange: (field: keyof IProduct, value: string, checked: boolean) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function ProductFormDialog({
  formData,
  setFormData,
  editingProduct,
  loading,
  onSubmit,
  onCancel,
  handleArrayChange,
  open,
  onOpenChange
}: ProductFormDialogProps) {
  const [hasReadToBottom, setHasReadToBottom] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  const handleScroll = () => {
    const content = contentRef.current
    if (!content) return

    const scrollPercentage =
      content.scrollTop / (content.scrollHeight - content.clientHeight)
    if (scrollPercentage >= 0.99 && !hasReadToBottom) {
      setHasReadToBottom(true)
    }
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(e)
  }

  const handleCancel = () => {
    onCancel()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col gap-0 p-0 sm:max-h-[min(90vh,800px)] sm:max-w-4xl [&>button:last-child]:top-3.5">
        <DialogHeader className="contents space-y-0 text-left">
          <DialogTitle className="border-b px-6 py-4 text-lg font-semibold">
            {editingProduct ? (
              <div className="flex items-center space-x-2">
                <Edit className="h-5 w-5 text-blue-600" />
                <span>Edit Product</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Plus className="h-5 w-5 text-green-600" />
                <span>Add New Product</span>
              </div>
            )}
          </DialogTitle>
          <DialogDescription asChild>
            <div className="px-6 py-3 text-sm text-gray-600 border-b">
              {editingProduct ? 'Update product information' : 'Add a new skincare product to the database'}
            </div>
          </DialogDescription>
          
          <div
            ref={contentRef}
            onScroll={handleScroll}
            className="overflow-y-auto flex-1"
          >
            <form onSubmit={handleFormSubmit} className="px-6 py-4 space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-md font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Gentle Daily Cleanser"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="brand">Brand *</Label>
                    <Input
                      id="brand"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      placeholder="e.g., CeraVe"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Product Type *</Label>
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
              </div>

              {/* Demographics & Budget */}
              <div className="space-y-4">
                <h3 className="text-md font-semibold text-gray-900 border-b pb-2">Demographics & Budget</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender *</Label>
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
                    <Label>Age Range *</Label>
                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded-md p-2">
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
                    <Label htmlFor="budget">Budget *</Label>
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
                    <Label htmlFor="category">Category *</Label>
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
              </div>

              {/* Usage & Texture */}
              <div className="space-y-4">
                <h3 className="text-md font-semibold text-gray-900 border-b pb-2">Usage & Texture</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Use Time *</Label>
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
                    <Label htmlFor="texture">Texture *</Label>
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
              </div>

              {/* Skin Types & Concerns */}
              <div className="space-y-4">
                <h3 className="text-md font-semibold text-gray-900 border-b pb-2">Skin Types & Concerns</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Skin Types *</Label>
                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded-md p-2">
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
                    <Label>Skin Concerns *</Label>
                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded-md p-2">
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
              </div>

              {/* Product Properties & Price */}
              <div className="space-y-4">
                <h3 className="text-md font-semibold text-gray-900 border-b pb-2">Product Properties & Price</h3>
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
                    <Label htmlFor="price">Price (USD) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Links & Instructions */}
              <div className="space-y-4">
                <h3 className="text-md font-semibold text-gray-900 border-b pb-2">Links & Instructions</h3>
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
                  <Label htmlFor="instructions">Instructions *</Label>
                  <Textarea
                    id="instructions"
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    placeholder="How to use this product..."
                    rows={3}
                    required
                  />
                </div>
              </div>
            </form>
          </div>
        </DialogHeader>
        
        <DialogFooter className="border-t px-6 py-4 sm:items-center">
          <DialogClose asChild>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          </DialogClose>
          <Button 
            type="submit" 
            disabled={loading || !formData.name || !formData.brand || !formData.instructions}
            onClick={handleFormSubmit}
          >
            {loading ? 'Saving...' : (editingProduct ? 'Update Product' : 'Create Product')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
