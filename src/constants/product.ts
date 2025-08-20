import {
  IProduct,
  ProductType,
  SkinType,
  SkinConcern,
  Gender,
  BudgetRange,
  Texture,
  UseTime,
  Category,
  AgeRange,
} from "@/types/product";

export const PRODUCT_TYPES: ProductType[] = [
  "cleanser",
  "moisturizer",
  "sunscreen",
  "toner",
  "essence",
  "faceCream",
  "primer",
  "hydrator",
  "serum",
  "ampoule",
  "spotTreatment",
  "exfoliant",
  "retinoid",
  "peptide",
  "vitaminC",
  "niacinamide",
  "brightening",
  "antiAging",
  "sleepingMask",
  "nightCream",
  "faceOil",
  "eyeCream",
  "eyeSerum",
  "eyeGel",
  "lipBalm",
  "lipCare",
  "makeupRemover",
  "cleansingBalm",
  "micellarWater",
  "oilCleanser",
  "faceMask",
  "sheetMask",
  "clayMask",
  "peelMask",
  "scrubMask",
  "hydratingMask",
  "detoxMask",
  "barrierCream",
  "cicaCream",
  "soothingCream",
  "antiRedness",
  "poreMinimizer",
  "sebumControl",
];

export const SKIN_TYPES: SkinType[] = [
  "oily",
  "combination",
  "dry",
  "normal",
  "sensitive",
  "mature",
  "all",
];

export const SKIN_CONCERNS: SkinConcern[] = [
  "acne",
  "blackheads",
  "dullness",
  "hyperpigmentation",
  "chapped_lips",
  "loss_of_firmness",
  "fine_lines",
  "wrinkles",
  "dehydration",
  "dryness",
  "redness",
  "sensitivity",
  "pores",
  "oiliness",
  "uneven_texture",
  "elasticity",
  "uneven_tone",
  "dark_circles",
  "puffiness",
  "scarring",
  "sun_damage",
];

export const GENDERS: Gender[] = [
  "male",
  "female",
  "unisex",
];

export const BUDGETS: BudgetRange[] = [
  "budgetFriendly",
  "midRange",
  "premium",
];

export const TEXTURES: Texture[] = [
  "gel",
  "cream",
  "lotion",
  "foam",
  "oil",
  "spray",
  "mask",
  "balm",
  "fluid",
  "liquid",
];

export const USE_TIMES: UseTime[] = [
  "morning",
  "night",
  "day",
];

export const CATEGORIES: Category[] = [
  "core",
  "treatment",
  "hydration",
  "special",
  "optional",
];

export const AGE_RANGES: AgeRange[] = [
  "kids",
  "teen",
  "young",
  "mature",
  "senior",
  "all",
];
