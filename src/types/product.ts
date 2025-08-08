export type ProductType =
  // Core
  | "cleanser"
  | "moisturizer"
  | "sunscreen"

  // 🔄 Prep & Hydration
  | "toner"
  | "essence"
  | "hydrating mist"
  | "face mist"

  // 💧 Treatment-Focused
  | "serum"
  | "ampoule"
  | "spot treatment"
  | "exfoliant (chemical)" // AHA/BHA/PHA
  | "exfoliator (physical)"
  | "retinoid"
  | "retinol"
  | "peptide treatment"
  | "vitamin c treatment"
  | "niacinamide treatment"
  | "brightening treatment"
  | "anti-aging treatment"

  // 🌙 Night Care / Repair
  | "sleeping mask"
  | "night cream"
  | "overnight treatment"
  | "face oil"

  // 👁️ Targeted Areas
  | "eye cream"
  | "eye serum"
  | "lip balm"
  | "lip treatment"

  // 🧼 Cleansing Extras
  | "makeup remover"
  | "cleansing balm"
  | "micellar water"
  | "oil cleanser"

  // 🧖‍♀️ Occasional Treatments
  | "face mask"
  | "sheet mask"
  | "clay mask"
  | "peel-off mask"
  | "scrub mask"
  | "hydrating mask"
  | "detox mask"

  // 🚨 Special Purpose
  | "barrier repair cream"
  | "cica cream"
  | "soothing cream"
  | "anti-redness cream"
  | "pore minimizer"
  | "sebum control gel";

export type SkinType = "dry" | "oily" | "combination" | "sensitive" | "normal";

export type SkinConcern =
  | "acne"
  | "blackheads"
  | "dullness"
  | "hyperpigmentation"
  | "fine lines"
  | "dehydration"
  | "redness"
  | "pores"
  | "uneven texture";

export type Gender = "male" | "female" | "unisex";
export type BudgetRange = "low" | "medium" | "high";

export interface Ingredient {
  name: string;
  function: string; // e.g., "Exfoliant", "Hydrator", "Brightener"
  strength?: string; // e.g., "2%", "0.5%"
  comedogenic_rating?: number; // 0 to 5
  irritancy_score?: number; // 0 to 5
  compatible_with: string[]; // Helps routine logic
  avoid_with: string[]; // e.g., ["Vitamin C", "AHA"]
}

export type Texture = "gel" | "cream" | "lotion" | "foam" | "oil" | "spray";
export type Frequency = "daily" | "2-3x/week" | "as needed";
export type UseTime = "morning" | "afternoon" | "evening" | "night";
export type Category = "core" | "treatment" | "hydration" | "special" | "optional";

export interface Product {
  id: string;
  name: string;
  brand: string;
  type: ProductType;
  gender: Gender;
  age: number;
  budget: BudgetRange;
  category: Category;

  use_time: UseTime[];
  frequency: Frequency;

  skin_types: SkinType[];
  skin_concerns: SkinConcern[];

  ingredients: Ingredient[];
  avoid_with: Ingredient[];

  texture: Texture;
  comedogenic: boolean;
  fragrance_free: boolean;
  alcohol_free: boolean;
  cruelty_free: boolean;
  vegan: boolean;

  instructions: string;
  benefits: string[];
  warnings?: string[];

  price_usd: number;
  purchase_link: string;
  image_url: string;

  popularity_score?: number;
  rating?: number;

  created_at?: string;
  updated_at?: string;
}

export interface ProductCreateData {
  name: string;
  brand: string;
  type: ProductType;
  gender: Gender;
  age: number;
  budget: BudgetRange;
  category: Category;
  use_time: UseTime[];
  frequency: Frequency;
  skin_types: SkinType[];
  skin_concerns: SkinConcern[];
  ingredients: Ingredient[];
  avoid_with: Ingredient[];
  texture: Texture;
  comedogenic: boolean;
  fragrance_free: boolean;
  alcohol_free: boolean;
  cruelty_free: boolean;
  vegan: boolean;
  instructions: string;
  benefits: string[];
  warnings?: string[];
  price_usd: number;
  purchase_link: string;
  image_url: string;
}
