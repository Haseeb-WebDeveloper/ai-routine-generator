"use client";

import { ShoppingBag, ExternalLink } from "lucide-react";
import Image from "next/image";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";

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
  console.log("[ProductDisplay] Rendering with products:", products);
  
  if (!products || products.length === 0) {
    console.log("[ProductDisplay] No products to display");
    return null;
  }

  return (
    <div className="flex justify-start mb-4">
      <div className="lg:max-w-[80%] max-w-[95%] py-3 border-b border-foreground/20">
        {/* Products header as part of AI message */}
        <div className="flex items-center gap-2 mb-2 text-foreground">
          <ShoppingBag className="h-4 w-4" />
          <span className="text-sm font-medium">
            Recommended Products
          </span>
        </div>
        
        {/* Products carousel */}
        <div className="whitespace-pre-wrap">
          <Carousel 
            className="w-full mt-4"
            opts={{
              align: "start",
              loop: true,
            }}
          >
            <CarouselContent>
              {products.map((product, index) => (
                <CarouselItem key={`${product.productName}-${index}`} className="md:basis-1/2 lg:basis-1/3 cursor-grab">
                  <div className="group bg-background border border-border rounded-lg overflow-hidden shadow-sm h-full">
                    {/* Product image */}
                    <div className="relative aspect-square">
                      <Image
                        src={product.imageUrl}
                        alt={product.productName}
                        width={300}
                        height={300}
                        className="object-cover w-full h-full transition-transform duration-500"
                      />
                    </div>

                    {/* Product details */}
                    <div className="flex flex-col justify-between gap-2 p-3">
                      <h4 className="font-medium text-base leading-snug line-clamp-1">
                        {product.productName}
                      </h4>

                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold">
                          ${product.price.toFixed(2)}
                        </div>

                        <a
                          href={product.buyLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-1.5 bg-primary/80 text-background text-xs font-medium rounded-md"
                        >
                          Buy Now
                        </a>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-center mt-2">
              <CarouselPrevious className="static translate-y-0 translate-x-0 mx-1" />
              <CarouselNext className="static translate-y-0 translate-x-0 mx-1" />
            </div>
          </Carousel>
        </div>
      </div>
    </div>
  );
}
