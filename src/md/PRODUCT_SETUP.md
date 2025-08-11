# Product Management System Setup

## Overview

The product management system allows you to create, edit, and manage skincare products in your database. Each product includes detailed information about ingredients, skin compatibility, usage instructions, and more.

## Features

- ✅ **Complete Product Management** - Create, edit, delete products
- ✅ **Detailed Product Information** - Ingredients, skin types, concerns, etc.
- ✅ **Advanced Filtering** - By type, brand, budget, skin type, etc.
- ✅ **Ingredient Compatibility** - Track ingredient interactions
- ✅ **Rich Product Data** - Instructions, benefits, warnings, pricing
- ✅ **Sample Data** - 5 pre-configured products for testing

## Database Setup

### 1. Run the Database Migration

Execute the SQL script to create the products table:

```sql
-- Run this in your Supabase SQL editor
-- File: add-products-table.sql
```

Or copy and paste the contents of `add-products-table.sql` into your Supabase SQL editor.

### 2. Verify Table Creation

Check that the `products` table was created successfully in your Supabase dashboard under:
- **Database** → **Tables** → **products**

## Adding Sample Products

### Option 1: Using the Script (Recommended)

Run the sample products script to add 5 pre-configured products:

```bash
bun run add-sample-products
```

This will add:
1. **Gentle Daily Cleanser** (CeraVe) - Low budget, core product
2. **Vitamin C Brightening Serum** (The Ordinary) - Medium budget, treatment
3. **Retinol Night Cream** (Neutrogena) - Medium budget, treatment
4. **SPF 50+ Sunscreen** (La Roche-Posay) - Medium budget, core product
5. **Hydrating Face Mask** (Laneige) - High budget, hydration

### Option 2: Manual Addition

1. Go to your admin panel: `http://localhost:3000/admin`
2. Click on the **Products** tab
3. Click **Add Product**
4. Fill in the product details
5. Click **Create Product**

## Product Data Structure

Each product includes:

### Basic Information
- **Name** - Product name
- **Brand** - Manufacturer
- **Type** - Product category (cleanser, serum, etc.)
- **Gender** - Target audience
- **Age Range** - Recommended age
- **Budget** - Price category (low/medium/high)
- **Category** - Core/treatment/hydration/special/optional

### Usage Information
- **Use Time** - When to apply (morning/afternoon/evening/night)
- **Frequency** - How often to use (daily/2-3x/week/as needed)
- **Instructions** - How to use the product

### Skin Compatibility
- **Skin Types** - Compatible skin types
- **Skin Concerns** - Target concerns
- **Texture** - Product consistency
- **Product Properties** - Fragrance-free, cruelty-free, etc.

### Ingredients
- **Active Ingredients** - Main ingredients with details
- **Avoid With** - Incompatible ingredients
- **Comedogenic Rating** - Pore-clogging potential
- **Irritancy Score** - Sensitivity potential

### Additional Information
- **Benefits** - What the product does
- **Warnings** - Safety precautions
- **Price** - Cost in USD
- **Purchase Link** - Where to buy
- **Image URL** - Product image

## API Endpoints

### Get All Products
```
GET /api/admin/products
```

### Get Single Product
```
GET /api/admin/products/{id}
```

### Create Product
```
POST /api/admin/products
Content-Type: application/json

{
  "name": "Product Name",
  "brand": "Brand Name",
  "type": "cleanser",
  // ... other fields
}
```

### Update Product
```
PUT /api/admin/products/{id}
Content-Type: application/json

{
  "name": "Updated Name",
  // ... other fields
}
```

### Delete Product
```
DELETE /api/admin/products/{id}
```

## Product Types Available

### Core Products
- `cleanser` - Face wash
- `moisturizer` - Hydration
- `sunscreen` - UV protection

### Treatment Products
- `serum` - Concentrated treatments
- `retinol` - Anti-aging
- `exfoliant (chemical)` - AHA/BHA/PHA
- `exfoliator (physical)` - Scrubs

### Hydration Products
- `toner` - pH balancing
- `essence` - Light hydration
- `face mist` - Refreshing spray

### Special Products
- `eye cream` - Eye area treatment
- `face mask` - Treatment masks
- `sleeping mask` - Overnight treatments

## Skin Types & Concerns

### Skin Types
- `dry` - Lacks oil
- `oily` - Excess oil
- `combination` - Mixed
- `sensitive` - Easily irritated
- `normal` - Balanced

### Skin Concerns
- `acne` - Breakouts
- `blackheads` - Clogged pores
- `dullness` - Lack of radiance
- `hyperpigmentation` - Dark spots
- `fine lines` - Aging signs
- `dehydration` - Lack of water
- `redness` - Inflammation
- `pores` - Enlarged pores
- `uneven texture` - Rough skin

## Usage Examples

### Creating a New Product

1. **Navigate to Products Tab**
   ```
   Admin Panel → Products → Add Product
   ```

2. **Fill Basic Information**
   - Name: "Gentle Foaming Cleanser"
   - Brand: "CeraVe"
   - Type: "cleanser"
   - Budget: "low"

3. **Set Usage Details**
   - Use Time: ["morning", "evening"]
   - Frequency: "daily"
   - Instructions: "Apply to damp skin, massage gently, rinse"

4. **Configure Skin Compatibility**
   - Skin Types: ["dry", "normal", "sensitive"]
   - Skin Concerns: ["dehydration", "redness"]

5. **Add Ingredients**
   ```json
   [
     {
       "name": "Ceramides",
       "function": "Barrier Repair",
       "strength": "3 essential ceramides",
       "comedogenic_rating": 0,
       "irritancy_score": 0,
       "compatible_with": ["All ingredients"],
       "avoid_with": []
     }
   ]
   ```

6. **Set Properties**
   - Texture: "foam"
   - Fragrance Free: ✅
   - Alcohol Free: ✅
   - Cruelty Free: ✅

7. **Add Benefits & Warnings**
   - Benefits: ["Removes dirt", "Strengthens barrier"]
   - Warnings: ["Avoid eyes", "Stop if irritation"]

8. **Set Pricing**
   - Price: $14.99
   - Purchase Link: "https://example.com"
   - Image URL: "https://example.com/image.jpg"

### Filtering Products

The system supports filtering by:
- **Type** - Cleanser, serum, etc.
- **Brand** - Manufacturer
- **Budget** - Low, medium, high
- **Skin Type** - Dry, oily, etc.
- **Category** - Core, treatment, etc.

## Testing

### 1. Add Sample Products
```bash
bun run add-sample-products
```

### 2. Verify in Admin Panel
- Go to `http://localhost:3000/admin`
- Click **Products** tab
- Verify 5 products are listed

### 3. Test Product Management
- **Create** - Add a new product
- **Edit** - Modify existing product
- **Delete** - Remove a product
- **View** - Check product details

## Troubleshooting

### Common Issues

1. **Products Not Loading**
   - Check database connection
   - Verify products table exists
   - Check API endpoint logs

2. **Form Validation Errors**
   - Ensure required fields are filled
   - Check data types (arrays for skin_types, etc.)
   - Verify ingredient JSON format

3. **Image Not Displaying**
   - Check image URL is accessible
   - Verify URL format
   - Test image link in browser

### Database Issues

1. **Table Not Found**
   ```sql
   -- Check if table exists
   SELECT * FROM information_schema.tables 
   WHERE table_name = 'products';
   ```

2. **Permission Errors**
   - Verify RLS policies
   - Check user permissions
   - Ensure admin access

## Next Steps

1. **Add More Products** - Expand your product database
2. **Customize Fields** - Add product-specific attributes
3. **Integrate with Quiz** - Connect products to user recommendations
4. **Add Product Images** - Upload and manage product photos
5. **Product Analytics** - Track popular products and usage

## Support

For issues or questions:
1. Check the console logs for errors
2. Verify database schema matches
3. Test API endpoints directly
4. Review product data format

The product management system is now ready to use! 🎉
