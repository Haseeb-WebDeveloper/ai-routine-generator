'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2, Package, DollarSign, Star, Users } from 'lucide-react'
import { IProduct, BudgetRange } from '@/types/product'

interface Product extends IProduct {
  id: string
  created_at?: string
  updated_at?: string
}

interface ProductCardProps {
  product: Product
  onEdit: (product: Product) => void
  onDelete: (id: string) => void
  getBudgetColor: (budget: BudgetRange) => string
}

export default function ProductCard({ product, onEdit, onDelete, getBudgetColor }: ProductCardProps) {
  return (
    <Card className="flex flex-col h-full shadow-md hover:shadow-lg transition-shadow duration-200">
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
                onClick={() => onEdit(product)}
                aria-label="Edit"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => onDelete(product.id)}
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
            <span className="text-xs text-gray-700">{Array.isArray(product.age) ? product.age.join(', ') : product.age}</span>
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
  )
}
