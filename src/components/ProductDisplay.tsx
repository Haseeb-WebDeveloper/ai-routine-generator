"use client";

import { ShoppingBag, ExternalLink } from "lucide-react";
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
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 space-y-8">
      {/* Refined header */}
      <div className="flex items-center gap-3">
        <ShoppingBag className="h-5 w-5 text-neutral-400" />
        <h3 className="text-xl font-semibold text-neutral-900 tracking-tight">
          Recommended Products
        </h3>
      </div>

      {/* Premium product grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product, index) => (
          <div
            key={`${product.productName}-${index}`}
            className="group bg-background border border-border rounded-2xl transition-all duration-300"
          >
            {/* Product image */}
            <div className="relative aspect-square rounded-t-xl overflow-hidden">
              <Image
                src={product.imageUrl}
                alt={product.productName}
                width={400}
                height={400}
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* Product details */}
            <div className="flex flex-col justify-between gap-4 p-4">
              <h4 className="font-medium text-xl leading-snug line-clamp-1">
                {product.productName}
              </h4>

              <div className="flex items-center justify-between">
                <div className="text-base font-semibold">
                  ${product.price.toFixed(2)}
                </div>

                <a
                  href={product.buyLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2 bg-primary/80 text-background text-sm font-medium rounded-lg"
                >
                  Buy Now
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
