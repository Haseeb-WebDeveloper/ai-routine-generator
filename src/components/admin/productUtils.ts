import { IProduct, BudgetRange, Gender, ProductType, AgeRange, Category, Texture, SkinType, SkinConcern, UseTime } from '@/types/product'
import { PRODUCT_TYPES, SKIN_TYPES, SKIN_CONCERNS, GENDERS, BUDGETS, TEXTURES, USE_TIMES, CATEGORIES, AGE_RANGES } from '@/constants/product'

interface Product extends IProduct {
  id: string
  created_at?: string
  updated_at?: string
}

export interface Filters {
  type: string
  budget: string
  gender: string
  category: string
  texture: string
  skinTypes: string[]
  skinConcerns: string[]
  useTime: string[]
  ageRanges: string[]
  fragranceFree: boolean | null
  alcoholFree: boolean | null
  priceRange: { min: string; max: string }
}

export const getBudgetColor = (budget: BudgetRange) => {
  const colors = {
    budgetFriendly: 'bg-green-100 text-green-800',
    midRange: 'bg-yellow-100 text-yellow-800',
    premium: 'bg-red-100 text-red-800'
  }
  return colors[budget]
}

export const applyFilters = (products: Product[], searchTerm: string, filters: Filters) => {
  let filtered = [...products]

  // Apply search term
  if (searchTerm) {
    const searchLower = searchTerm.toLowerCase()
    filtered = filtered.filter(product =>
      product.name.toLowerCase().includes(searchLower) ||
      product.brand.toLowerCase().includes(searchLower) ||
      product.instructions.toLowerCase().includes(searchLower)
    )
  }

  // Apply type filter
  if (filters.type && filters.type !== 'all') {
    filtered = filtered.filter(product => product.type === filters.type)
  }

  // Apply budget filter
  if (filters.budget && filters.budget !== 'all') {
    filtered = filtered.filter(product => product.budget === filters.budget)
  }

  // Apply gender filter
  if (filters.gender && filters.gender !== 'all') {
    filtered = filtered.filter(product => product.gender === filters.gender)
  }

  // Apply category filter
  if (filters.category && filters.category !== 'all') {
    filtered = filtered.filter(product => product.category === filters.category)
  }

  // Apply texture filter
  if (filters.texture && filters.texture !== 'all') {
    filtered = filtered.filter(product => product.texture === filters.texture)
  }

  // Apply skin types filter
  if (filters.skinTypes.length > 0) {
    filtered = filtered.filter(product =>
      product.skin_types.some(type => filters.skinTypes.includes(type))
    )
  }

  // Apply skin concerns filter
  if (filters.skinConcerns.length > 0) {
    filtered = filtered.filter(product =>
      product.skin_concerns.some(concern => filters.skinConcerns.includes(concern))
    )
  }

  // Apply use time filter
  if (filters.useTime.length > 0) {
    filtered = filtered.filter(product =>
      product.use_time.some(time => filters.useTime.includes(time))
    )
  }

  // Apply age ranges filter
  if (filters.ageRanges.length > 0) {
    filtered = filtered.filter(product =>
      product.age.some(age => filters.ageRanges.includes(age))
    )
  }

  // Apply fragrance free filter
  if (filters.fragranceFree !== null) {
    filtered = filtered.filter(product => product.fragrance_free === filters.fragranceFree)
  }

  // Apply alcohol free filter
  if (filters.alcoholFree !== null) {
    filtered = filtered.filter(product => product.alcohol_free === filters.alcoholFree)
  }

  // Apply price range filter
  if (filters.priceRange.min !== '' || filters.priceRange.max !== '') {
    filtered = filtered.filter(product => {
      const price = product.price
      const min = filters.priceRange.min !== '' ? parseFloat(filters.priceRange.min) : 0
      const max = filters.priceRange.max !== '' ? parseFloat(filters.priceRange.max) : Infinity
      return price >= min && price <= max
    })
  }

  return filtered
}

export const clearFilters = (): Filters => ({
  type: 'all',
  budget: 'all',
  gender: 'all',
  category: 'all',
  texture: 'all',
  skinTypes: [],
  skinConcerns: [],
  useTime: [],
  ageRanges: [],
  fragranceFree: null,
  alcoholFree: null,
  priceRange: { min: '', max: '' }
})

export const parseCsvData = (csvText: string) => {
  const lines = csvText.split('\n')
  const headers = lines[0].split(',').map(header => header.trim())
  
  // Validate required headers
  const requiredHeaders = ['name', 'brand', 'type', 'gender', 'age', 'budget', 'category', 'texture', 'price', 'instructions']
  const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))
  
  if (missingHeaders.length > 0) {
    throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`)
  }
  
  const data = []
  
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue
    
    // Handle quoted fields with commas inside them
    let values: string[] = []
    let currentLine = lines[i]
    
    // Parse CSV line handling quoted values with commas
    let inQuotes = false
    let currentValue = ''
    
    for (let j = 0; j < currentLine.length; j++) {
      const char = currentLine[j]
      
      if (char === '"' && (j === 0 || currentLine[j-1] !== '\\')) {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        values.push(currentValue.trim())
        currentValue = ''
      } else {
        currentValue += char
      }
    }
    
    // Add the last value
    values.push(currentValue.trim())
    
    // Clean up quotes from values
    values = values.map(v => v.replace(/^"|"$/g, ''))
    
    const row: Record<string, any> = {}
    
    headers.forEach((header, index) => {
      // Handle array values that might be in format "value1,value2" or comma-separated list
      if (['use_time', 'skin_types', 'skin_concerns'].includes(header)) {
        let arrayValue = values[index] || ''
        
        // If it looks like a JSON array, try to parse it
        if (arrayValue.startsWith('[') && arrayValue.endsWith(']')) {
          try {
            row[header] = JSON.parse(arrayValue)
          } catch {
            // If parsing fails, fall back to comma splitting
            arrayValue = arrayValue.replace(/^\[|\]$/g, '').trim()
            row[header] = arrayValue ? arrayValue.split(',').map(v => v.trim()) : []
          }
        } else {
          // Simple comma or semicolon-separated list
          const separator = arrayValue.includes(';') ? ';' : ','
          row[header] = arrayValue ? arrayValue.split(separator).map(v => v.trim()) : []
        }
        
        // Validate use_time values against USE_TIMES
        if (header === 'use_time') {
          row[header] = row[header].filter((time: string) => USE_TIMES.includes(time as UseTime))
        }
      } 
      // Handle boolean values
      else if (['fragrance_free', 'alcohol_free'].includes(header)) {
        const value = values[index]?.toLowerCase()
        row[header] = value === 'true' || value === 'yes' || value === '1'
      }
      // Handle numeric values
      else if (header === 'price') {
        row[header] = parseFloat(values[index] || '0')
      }
      // Handle ingredients as array of objects
      else if (header === 'ingredients') {
        try {
          let ingredientsStr = values[index] || ''
          
          // If it looks like a JSON array, try to parse it
          if (ingredientsStr.startsWith('[') && ingredientsStr.endsWith(']')) {
            try {
              row[header] = JSON.parse(ingredientsStr)
            } catch {
              row[header] = []
            }
          } else {
            // Parse format like "name1:function1;name2:function2" or with commas
            const separator = ingredientsStr.includes(';') ? ';' : ','
            const ingredients = ingredientsStr.split(separator).map(item => {
              const [name, func] = item.split(':').map(part => part.trim())
              return { name, function: func || '' }
            }).filter(item => item.name) // Filter out empty items
            
            row[header] = ingredients
          }
        } catch {
          row[header] = []
        }
      }
      // Handle age as array
      else if (header === 'age') {
        let ageValue = values[index] || ''
        // If it looks like a JSON array, try to parse it
        if (ageValue.startsWith('[') && ageValue.endsWith(']')) {
          try {
            row[header] = JSON.parse(ageValue)
          } catch {
            ageValue = ageValue.replace(/^\[|\]$/g, '').trim()
            row[header] = ageValue ? ageValue.split(';').map(v => v.trim()) : []
          }
        } else {
          // Simple semicolon or comma-separated list
          const separator = ageValue.includes(';') ? ';' : ','
          row[header] = ageValue ? ageValue.split(separator).map(v => v.trim()) : []
        }
      }
      // Handle regular string values
      else {
        row[header] = values[index] || ''
      }
    })
    
    data.push(row)
  }
  
  return { headers, data }
}

export const validateCsvData = (data: any[]) => {
  const errors: string[] = []
  
  data.forEach((row, index) => {
    // Check required fields
    if (!row.name) errors.push(`Row ${index + 1}: Product name is required`)
    if (!row.brand) errors.push(`Row ${index + 1}: Brand is required`)
    if (!row.instructions) errors.push(`Row ${index + 1}: Instructions are required`)
    
    // Validate product type
    if (!row.type || !PRODUCT_TYPES.includes(row.type)) {
      errors.push(`Row ${index + 1}: Invalid product type: ${row.type}. Must be one of: ${PRODUCT_TYPES.join(', ')}`)
    }
    
    // Validate gender
    if (!row.gender || !GENDERS.includes(row.gender)) {
      errors.push(`Row ${index + 1}: Invalid gender: ${row.gender}. Must be one of: ${GENDERS.join(', ')}`)
    }
    
    // Validate age range (now as array)
    if (!row.age || !Array.isArray(row.age) || row.age.length === 0) {
      errors.push(`Row ${index + 1}: At least one age range is required`)
    } else {
      row.age.forEach((ageVal: string) => {
        if (!AGE_RANGES.includes(ageVal as AgeRange)) {
          errors.push(`Row ${index + 1}: Invalid age range: ${ageVal}. Must be one of: ${AGE_RANGES.join(', ')}`)
        }
      })
    }
    
    // Validate budget
    if (!row.budget || !BUDGETS.includes(row.budget)) {
      errors.push(`Row ${index + 1}: Invalid budget: ${row.budget}. Must be one of: ${BUDGETS.join(', ')}`)
    }
    
    // Validate category
    if (!row.category || !CATEGORIES.includes(row.category)) {
      errors.push(`Row ${index + 1}: Invalid category: ${row.category}. Must be one of: ${CATEGORIES.join(', ')}`)
    }
    
    // Validate texture
    if (!row.texture || !TEXTURES.includes(row.texture)) {
      errors.push(`Row ${index + 1}: Invalid texture: ${row.texture}. Must be one of: ${TEXTURES.join(', ')}`)
    }
    
    // Validate use_time values
    if (row.use_time && Array.isArray(row.use_time)) {
      if (row.use_time.length === 0) {
        errors.push(`Row ${index + 1}: At least one use time is required`)
      } else {
        row.use_time.forEach((time: string) => {
          if (!USE_TIMES.includes(time as UseTime)) {
            errors.push(`Row ${index + 1}: Invalid use time: ${time}. Must be one of: ${USE_TIMES.join(', ')}`)
          }
        })
      }
    } else {
      errors.push(`Row ${index + 1}: Use time must be an array`)
    }
    
    // Validate skin_types values
    if (row.skin_types && Array.isArray(row.skin_types)) {
      if (row.skin_types.length === 0) {
        errors.push(`Row ${index + 1}: At least one skin type is required`)
      } else {
        row.skin_types.forEach((type: string) => {
          if (!SKIN_TYPES.includes(type as SkinType)) {
            errors.push(`Row ${index + 1}: Invalid skin type: ${type}. Must be one of: ${SKIN_TYPES.join(', ')}`)
          }
        })
      }
    } else {
      errors.push(`Row ${index + 1}: Skin types must be an array`)
    }
    
    // Validate skin_concerns values
    if (row.skin_concerns && Array.isArray(row.skin_concerns)) {
      if (row.skin_concerns.length === 0) {
        errors.push(`Row ${index + 1}: At least one skin concern is required`)
      } else {
        row.skin_concerns.forEach((concern: string) => {
          if (!SKIN_CONCERNS.includes(concern as SkinConcern)) {
            errors.push(`Row ${index + 1}: Invalid skin concern: ${concern}. Must be one of: ${SKIN_CONCERNS.join(', ')}`)
          }
        })
      }
    } else {
      errors.push(`Row ${index + 1}: Skin concerns must be an array`)
    }
    
    // Validate ingredients
    if (row.ingredients) {
      if (!Array.isArray(row.ingredients)) {
        errors.push(`Row ${index + 1}: Ingredients must be an array`)
      } else if (row.ingredients.length === 0) {
        // Empty ingredients array is allowed, but we'll warn about it
        console.warn(`Row ${index + 1}: No ingredients provided`)
      } else {
        // Check that each ingredient has name and function
        row.ingredients.forEach((ingredient: any, i: number) => {
          if (!ingredient.name) {
            errors.push(`Row ${index + 1}: Ingredient ${i + 1} is missing a name`)
          }
          if (!ingredient.function) {
            errors.push(`Row ${index + 1}: Ingredient ${i + 1} is missing a function`)
          }
        })
      }
    }
    
    // Validate price is a number
    if (isNaN(row.price)) {
      errors.push(`Row ${index + 1}: Price must be a number`)
    }
  })
  
  return errors
}

export const downloadProductTemplate = () => {
  // Create a template with all required fields and examples
  const headers = [
    'name',
    'brand',
    'type',
    'gender',
    'age',
    'budget',
    'category',
    'use_time',
    'skin_types',
    'skin_concerns',
    'texture',
    'fragrance_free',
    'alcohol_free',
    'ingredients',
    'price',
    'purchase_link',
    'image_url',
    'instructions'
  ].join(',')
  
  // Example row 1
  const exampleRow1 = [
    'Gentle Hydrating Cleanser',
    'CeraVe',
    'cleanser',
    'unisex',
    '18-25',
    'budgetFriendly',
    'core',
    'morning;night',
    'dry;sensitive',
    'dryness;sensitivity',
    'cream',
    'true',
    'true',
    'Ceramides:Hydration;Hyaluronic Acid:Moisture',
    '12.99',
    'https://example.com/product',
    'https://example.com/image.jpg',
    'Apply to damp skin massage gently rinse thoroughly.'
  ].join(',')
  
  // Example row 2
  const exampleRow2 = [
    'Vitamin C Brightening Serum',
    'The Ordinary',
    'vitaminC',
    'unisex',
    '26-35',
    'midRange',
    'treatment',
    'morning',
    'combination;normal',
    'dullness;hyperpigmentation',
    'gel',
    'true',
    'true',
    'Vitamin C:Brightening;Ferulic Acid:Antioxidant',
    '6.99',
    'https://example.com/product2',
    'https://example.com/image2.jpg',
    'Apply a few drops to clean skin in the morning before moisturizer.'
  ].join(',')
  
  // Add a comment line explaining the format
  const comment = '# IMPORTANT: For arrays (age, use_time, skin_types, skin_concerns), use SEMICOLONS (;) as separators, not commas. For ingredients, use format "name:function;name2:function2". See product_csv_guide.md for full documentation.'
  
  const csvContent = `${comment}\n${headers}\n${exampleRow1}\n${exampleRow2}`
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'product_template.csv'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}
