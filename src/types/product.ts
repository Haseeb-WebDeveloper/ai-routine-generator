export type ProductType =
  | "cleanser"
  | "moisturizer"
  | "sunscreen"
  | "toner"
  | "essence"
  | "hydrator"
  | "serum"
  | "ampoule"
  | "spotTreatment"
  | "exfoliant"
  | "retinoid"
  | "peptide"
  | "vitaminC"
  | "niacinamide"
  | "brightening"
  | "antiAging"
  | "sleepingMask"
  | "nightCream"
  | "faceOil"
  | "eyeCream"
  | "eyeSerum"
  | "lipBalm"
  | "lipCare"
  | "makeupRemover"
  | "cleansingBalm"
  | "micellarWater"
  | "oilCleanser"
  | "faceMask"
  | "sheetMask"
  | "clayMask"
  | "peelMask"
  | "scrubMask"
  | "hydratingMask"
  | "detoxMask"
  | "barrierCream"
  | "cicaCream"
  | "soothingCream"
  | "antiRedness"
  | "poreMinimizer"
  | "sebumControl";


  export type SkinType =
  | "oily"                  
  | "combination"
  | "dry"
  | "normal"
  | "sensitive"              
  | "mature"                


  export type SkinConcern =
  | "acne"                // Breakouts, pimples
  | "blackheads"          // Comedones
  | "dullness"            // Lack of radiance
  | "hyperpigmentation"   // Dark spots, uneven tone
  | "fine_lines"          // Early signs of aging
  | "wrinkles"            // Deeper aging lines
  | "dehydration"         // Lack of water in skin
  | "dryness"             // Lack of oil in skin
  | "redness"             // General redness, flushing
  | "sensitivity"         // Chronic sensitive skin
  | "pores"               // Enlarged or visible pores
  | "oiliness"            // Excess sebum
  | "uneven_texture"      // Rough, bumpy surface
  | "dark_circles"        // Under-eye darkness
  | "puffiness"           // Under-eye swelling
  | "scarring"            // Post-acne or injury marks
  | "sun_damage";         // Sunspots, UV-related issues


export type Gender = "male" | "female" | "unisex";
export type BudgetRange = "budgetFriendly" | "midRange" | "Premium";

export interface Ingredient {
  name: string;
  function: string; // e.g., "Exfoliant", "Hydrator", "Brightener"
}

export type Texture = "gel" | "cream" | "lotion" | "foam" | "oil" | "spray" | "mask" | "balm" ;
export type UseTime =
  | "morning"      // First skincare step of the day
  | "night"        // Before bed

export type Category =
  | "core"       // Essential daily use (e.g., cleanser, sunscreen)
  | "treatment"  // Condition-specific (e.g., acne, pigmentation, eczema)
  | "hydration"  // Primary goal is moisture repair
  | "special"    // Situational or seasonal use
  | "optional";  // Non-essential extras


export type AgeRange = "kids" | "teen" | "young" | "mature" | "senior" | "all"


export interface IProduct {
  name: string;
  brand: string;
  type: ProductType;
  gender: Gender;
  age: AgeRange[];
  budget: BudgetRange;
  category: Category;
  use_time: UseTime[];
  skin_types: SkinType[];
  skin_concerns: SkinConcern[];
  ingredients: Ingredient[];
  texture: Texture;
  fragrance_free: boolean;
  alcohol_free: boolean;
  instructions: string;
  price: number;
  purchase_link: string;
  image_url: string;
}
