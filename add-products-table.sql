-- Add products table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  gender VARCHAR(20) NOT NULL DEFAULT 'unisex',
  age INTEGER NOT NULL DEFAULT 18,
  budget VARCHAR(20) NOT NULL DEFAULT 'medium',
  category VARCHAR(50) NOT NULL DEFAULT 'core',
  
  use_time TEXT[] NOT NULL DEFAULT '{}',
  frequency VARCHAR(20) NOT NULL DEFAULT 'daily',
  
  skin_types TEXT[] NOT NULL DEFAULT '{}',
  skin_concerns TEXT[] NOT NULL DEFAULT '{}',
  
  ingredients JSONB NOT NULL DEFAULT '[]',
  avoid_with JSONB NOT NULL DEFAULT '[]',
  
  texture VARCHAR(50) NOT NULL DEFAULT 'cream',
  comedogenic BOOLEAN NOT NULL DEFAULT false,
  fragrance_free BOOLEAN NOT NULL DEFAULT true,
  alcohol_free BOOLEAN NOT NULL DEFAULT true,
  cruelty_free BOOLEAN NOT NULL DEFAULT true,
  vegan BOOLEAN NOT NULL DEFAULT false,
  
  instructions TEXT NOT NULL,
  benefits TEXT[] NOT NULL DEFAULT '{}',
  warnings TEXT[] DEFAULT '{}',
  
  price_usd DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  purchase_link TEXT,
  image_url TEXT,
  
  popularity_score INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0.00,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_type ON products(type);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_budget ON products(budget);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_skin_types ON products USING GIN(skin_types);
CREATE INDEX IF NOT EXISTS idx_products_skin_concerns ON products USING GIN(skin_concerns);
CREATE INDEX IF NOT EXISTS idx_products_use_time ON products USING GIN(use_time);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at 
  BEFORE UPDATE ON products 
  FOR EACH ROW 
  EXECUTE FUNCTION update_products_updated_at();
