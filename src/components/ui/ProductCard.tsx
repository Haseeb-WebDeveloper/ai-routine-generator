import { Card, CardContent, CardFooter, CardHeader } from "./card";
import { Button } from "./button";
import { Badge } from "./badge";
import { ExternalLink, ShoppingCart } from "lucide-react";

interface ProductData {
  productName: string;
  price: number;
  brand: string;
  type: string;
  imageUrl: string;
  buyLink: string;
}

interface ProductCardProps {
  product: ProductData;
  className?: string;
}

export function ProductCard({ product, className = "" }: ProductCardProps) {
  return (
    <div
      className={`overflow-hidden space-y-3 transition-shadow duration-300 ${className}`}
    >
      <div className="aspect-video overflow-hidden bg-gray-100 rounded-lg">
        <img
          src={product.imageUrl}
          alt={product.productName}
          className="w-full h-full object-cover rounded-lg transition-transform duration-300"
          onError={(e) => {
            // Fallback to a placeholder if image fails to load
            const target = e.target as HTMLImageElement;
            target.src =
              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='14' fill='%239ca3af'%3ENo Image%3C/text%3E%3C/svg%3E";
          }}
        />
      </div>

      <div className="space-y-4">
        <div className="space-y-2 w-full">
          <h3 className="text-lg leading-tight line-clamp-2 text-foreground">
            {product.productName}
          </h3>
          <p className="text-lg">${product.price}</p>
        </div>
        <Button
          className="w-full rounded-none py-5 hover:bg-foreground bg-foreground/95"
          onClick={() =>
            window.open(product.buyLink, "_blank", "noopener,noreferrer")
          }
        >
          <ShoppingCart className="h-3 w-3 mr-2" />
          Buy Now
        </Button>
      </div>
    </div>
  );
}
