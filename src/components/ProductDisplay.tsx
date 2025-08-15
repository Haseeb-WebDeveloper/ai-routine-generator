"use client";

import { ShoppingBag } from "lucide-react";
import Image from "next/image";

export interface Product {
  productName: string;
  price: number;
  brand: string;
  type: string;
  imageUrl: string;
  buyLink: string;
  description?: string;
}

interface ProductDisplayProps {
  products: Product[];
}

export function ProductDisplay({ products }: ProductDisplayProps) {
  // Don't render anything if no products
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="space-y-8 mt-8 pb-8">
      <div className="flex items-center gap-2 text-foreground">
        <ShoppingBag className="h-5 w-5 text-blue-500" />
        <h3 className="text-lg font-medium">Recommended Products</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {products.map((product, index) => (
          <div
            key={`${product.productName}-${index}`}
            className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col h-full">
              <div className="flex-1">
                <Image
                  src={product.imageUrl}
                  alt={product.productName}
                  width={100}
                  height={100}
                />
                <h4 className="text-lg font-medium">{product.productName}</h4>
                <p className="text-sm text-muted-foreground">{product.brand}</p>
                <div className="mt-2 mb-3">
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    {product.type}
                  </span>
                </div>
                {product.description && (
                  <p className="text-sm mt-2">{product.description}</p>
                )}
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="font-medium">${product.price.toFixed(2)}</span>
                <a
                  href={product.buyLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  View Product
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
