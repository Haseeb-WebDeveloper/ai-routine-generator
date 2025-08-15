import { formatRoutineText } from "@/lib/format-text-content";
import { ProductCard } from "./ProductCard";
import { ShoppingBag } from "lucide-react";

interface ProductData {
  productName: string;
  price: number;
  brand: string;
  type: string;
  imageUrl: string;
  buyLink: string;
}

interface RoutineWithProductsProps {
  content: string;
  className?: string;
}

export function RoutineWithProducts({
  content,
  className = "",
}: RoutineWithProductsProps) {
  // Parse the content to extract routine text and products
  const parseContent = (text: string) => {
    const productsMatch = text.match(
      /\[PRODUCTS_JSON\]([\s\S]*?)\[\/PRODUCTS_JSON\]/
    );

    if (!productsMatch) {
      return { routineText: text, products: [] };
    }

    try {
      const productsJson = productsMatch[1].trim();
      const products: ProductData[] = JSON.parse(productsJson);

      // Remove the products JSON section from the routine text
      const routineText = text
        .replace(/\[PRODUCTS_JSON\][\s\S]*?\[\/PRODUCTS_JSON\]/, "")
        .trim();

      return { routineText, products };
    } catch (error) {
      console.error("Error parsing products JSON:", error);
      return { routineText: text, products: [] };
    }
  };

  const { routineText, products } = parseContent(content);



  return (
    <div className={`space-y-12 ${className}`}>
      {/* Routine Text */}
      <div>
        <div className="pt-6">
          <div
            className="routine-prose max-w-none"
            dangerouslySetInnerHTML={{ __html: formatRoutineText(routineText) }}
            // dangerouslySetInnerHTML={{ __html: routineText }}
          />
        </div>
      </div>

      {/* Products Section */}
      {products.length > 0 && (
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 text-foreground">
              <ShoppingBag className="h-5 w-5 text-blue-500" />
              Recommended Products
            </div>
          </div>
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.map((product, index) => (
                <ProductCard
                  key={`${product.productName}-${index}`}
                  product={product}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
