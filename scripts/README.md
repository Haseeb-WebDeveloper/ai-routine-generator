# Scripts Directory

This directory contains utility scripts for the AI Routine project.

## create-prisma-admin.js

A Bun script to create admin accounts programmatically using Prisma and bcrypt password hashing.

### Prerequisites

1. **Database Connection**: Make sure your `DATABASE_URL` is set in your `.env` file
2. **Prisma Setup**: Ensure Prisma is properly configured and the database is migrated

### Usage

Run the script using bun:

```bash
# Using bun
bun run create-prisma-admin

# Or directly
bun scripts/create-prisma-admin.js
```

### What the script does

1. **Validates Input**: Checks email format and password requirements
2. **Hashes Password**: Uses bcrypt to securely hash the password
3. **Creates User**: Creates a user record in the database with admin role
4. **Provides Feedback**: Shows success/error messages and next steps

### Example Output

```
🔐 AI Routine - Admin Account Creator

Enter admin email: admin@example.com
Enter admin password (min 6 characters): ********
Confirm admin password: ********

🔄 Creating admin account...
✅ Admin account created successfully!
📧 Email: admin@example.com
🆔 User ID: clx1234567890abcdef
📅 Created: 12/19/2024, 2:30:45 PM

🎉 Admin account setup complete!

Next steps:
1. Restart your development server
2. Access the admin dashboard at http://localhost:3000/admin
3. Sign in with your new admin credentials
```

### Security Notes

- Passwords are securely hashed using bcrypt with 12 salt rounds
- The script creates users directly in the database (no external auth service)
- Passwords are validated for minimum length (6 characters)
- Admin role is automatically assigned

## add-sample-products.js

A Node.js script to add sample skincare products to the database for testing and development.

### Prerequisites

1. **Database Connection**: Make sure your `DATABASE_URL` is set in your `.env` file
2. **Prisma Setup**: Ensure Prisma is properly configured and the database is migrated

### Usage

Run the script using npm:

```bash
# Using npm
npm run add-sample-products

# Or directly
node scripts/add-sample-products.js
```

### What the script does

1. **Adds Sample Products**: Inserts 5 pre-configured skincare products
2. **Type-Safe Enum Mapping**: Uses comprehensive mapping functions to convert frontend enum values to Prisma enum values
3. **Provides Feedback**: Shows detailed mapping information and success/error messages for each product
4. **Error Handling**: Continues processing other products if one fails, with detailed error reporting

### Sample Products Included

- **Gentle Daily Cleanser** (CeraVe) - Low budget, core category
- **Vitamin C Brightening Serum** (The Ordinary) - Medium budget, treatment category
- **Retinol Night Cream** (Neutrogena) - Medium budget, treatment category
- **SPF 50+ Sunscreen** (La Roche-Posay) - Medium budget, core category
- **Hydrating Face Mask** (Laneige) - High budget, hydration category

### Features

- **Full Type Safety**: Comprehensive enum mapping with validation
- **Complete Product Data**: Including ingredients, benefits, warnings, and all required fields
- **Smart Mapping**: Handles edge cases like "serum" → "GEL" texture and "sun damage" → "HYPERPIGMENTATION"
- **Detailed Logging**: Shows exactly how each enum value is mapped
- **Robust Error Handling**: Individual product failures don't stop the entire process
- **Automatic Database Disconnection**: Proper cleanup after completion

### Type Safety Features

The script now includes comprehensive type-safe enum mapping functions:

- **Product Types**: Maps frontend types like "sleeping mask" to Prisma's "SLEEPING_MASK"
- **Skin Types**: Maps "all" to specific skin types for better compatibility
- **Frequencies**: Maps "2-3x/week" to "TWO_THREE_TIMES_WEEK"
- **Textures**: Maps "serum" to "GEL" as the closest texture type
- **Skin Concerns**: Maps "sun damage" to "HYPERPIGMENTATION"

### Troubleshooting

**"Error adding product"**
- Check that your database is running and accessible
- Verify the Prisma schema matches the expected structure
- Ensure all required fields are properly formatted
- Check the detailed error messages for specific enum mapping issues

**"Invalid product type/gender/budget/etc"**
- The script will show you exactly which values are valid
- All enum mappings are validated before database insertion
- Invalid values will cause the specific product to fail but won't stop other products
