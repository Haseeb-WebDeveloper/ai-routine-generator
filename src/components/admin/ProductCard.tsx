"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Package, DollarSign, Star, Users, ExternalLink } from "lucide-react";
import { IProduct, BudgetRange } from "@/types/product";

interface Product extends IProduct {
  id: string;
  created_at?: string;
  updated_at?: string;
}

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  getBudgetColor: (budget: BudgetRange) => string;
}

export default function ProductCard({
  product,
  onEdit,
  onDelete,
  getBudgetColor,
}: ProductCardProps) {
  return (
    <Card className="group flex flex-col h-full shadow-sm hover:shadow-xl transition-all duration-300 border-0 ring-1 ring-gray-200 hover:ring-gray-300 ">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          {/* Product Image */}
          {product.image_url ? (
            <div className="relative flex-shrink-0">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-16 h-16 object-cover  border border-gray-100"
              />
            </div>
          ) : (
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Package className="h-6 w-6 text-gray-400" />
            </div>
          )}

          {/* Product Info and Actions */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg font-bold text-gray-900 leading-tight line-clamp-2">
                  {product.name}
                </CardTitle>
                <CardDescription className="text-sm text-gray-600 mt-1">
                  <span className="font-medium text-gray-700">{product.brand}</span>
                  <span className="mx-2 text-gray-300">•</span>
                  <span className="capitalize">{product.type}</span>
                </CardDescription>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600"
                  onClick={() => onEdit(product)}
                  aria-label="Edit product"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                  onClick={() => onDelete(product.id)}
                  aria-label="Delete product"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Price Badge */}
        <div className="flex justify-end mt-3">
          <Badge
            className={`${getBudgetColor(product.budget)} px-3 py-1 text-sm font-semibold`}
          >
            ${product.price}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col pt-0 pb-4 space-y-4">
        {/* Key Details Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
            <Package className="h-4 w-4 text-gray-500" />
            <span className="text-xs font-medium text-gray-700 truncate">
              {product.category}
            </span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
            <DollarSign className="h-4 w-4 text-gray-500" />
            <span className="text-xs font-medium text-gray-700 capitalize truncate">
              {product.budget}
            </span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
            <Users className="h-4 w-4 text-gray-500" />
            <span className="text-xs font-medium text-gray-700 truncate">
              {Array.isArray(product.skin_types) 
                ? product.skin_types.slice(0, 2).join(", ")
                : product.skin_types}
              {Array.isArray(product.skin_types) && product.skin_types.length > 2 && " +"}
            </span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
            <Star className="h-4 w-4 text-gray-500" />
            <span className="text-xs font-medium text-gray-700 truncate">
              {Array.isArray(product.age)
                ? product.age.join(", ")
                : product.age}
            </span>
          </div>
        </div>

        {/* Skin Concerns */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
            Concerns
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {product.skin_concerns.slice(0, 4).map((concern, index) => (
              <Badge
                key={concern}
                variant="secondary"
                className="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
              >
                {concern}
              </Badge>
            ))}
            {product.skin_concerns.length > 4 && (
              <Badge 
                variant="secondary" 
                className="text-xs px-2.5 py-1 bg-gray-100 text-gray-600"
              >
                +{product.skin_concerns.length - 4}
              </Badge>
            )}
          </div>
        </div>

        {/* Use Time */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
            When to Use
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {product.use_time.map((time) => (
              <Badge
                key={time}
                variant="outline"
                className="text-xs px-2.5 py-1 border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                {time}
              </Badge>
            ))}
          </div>
        </div>

        {/* Purchase Link */}
        {product.purchase_link && (
          <div className="mt-auto pt-3 border-t border-gray-100">
            <a
              href={product.purchase_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors group/link"
            >
              <span>View Product</span>
              <ExternalLink className="h-3.5 w-3.5 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}