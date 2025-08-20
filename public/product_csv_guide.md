# Product CSV Upload Guide

This guide explains how to format your CSV file for bulk product uploads.

## CSV Format

Your CSV file must include the following columns, with each field formatted as described:

| Column          | Description             | Required | Format/Allowed Values                                                                 | Example                                         |
|-----------------|------------------------|----------|---------------------------------------------------------------------------------------|-------------------------------------------------|
| name            | Product name            | Yes      | Text                                                                                  | Gentle Hydrating Cleanser                       |
| brand           | Brand name              | Yes      | Text                                                                                  | CeraVe                                          |
| type            | Product type            | Yes      | One of: cleanser, moisturizer, sunscreen, toner, essence, hydrator, serum, ampoule, spotTreatment, exfoliant, retinoid, peptide, vitaminC, niacinamide, brightening, antiAging, sleepingMask, nightCream, faceOil, eyeCream, eyeSerum, lipBalm, lipCare, makeupRemover, cleansingBalm, micellarWater, oilCleanser, faceMask, sheetMask, clayMask, peelMask, scrubMask, hydratingMask, detoxMask, barrierCream, cicaCream, soothingCream, antiRedness, poreMinimizer, sebumControl | cleanser                                         |
| gender          | Target gender           | Yes      | male, female, unisex                                                                  | unisex                                          |
| age             | Age range               | Yes      | One of: 0-1, 1-3, 4-12, 13-17, 18-25, 26-35, 36-45, 46-60, 60+                        | 18-25                                           |
| budget          | Price range             | Yes      | budgetFriendly, midRange, Premium                                                     | budgetFriendly                                  |
| category        | Product category        | Yes      | core, treatment, hydration, special, optional                                         | core                                            |
| use_time        | When to use             | Yes      | Semicolon-separated list: morning;night                                               | morning;night                                   |
| skin_types      | Suitable skin types     | Yes      | Semicolon-separated list: oily;combination;dry;normal;sensitive;mature                | dry;sensitive                                   |
| skin_concerns   | Addressed concerns      | Yes      | Semicolon-separated list: acne;blackheads;dullness;hyperpigmentation;fine_lines;wrinkles;dehydration;dryness;redness;sensitivity;pores;oiliness;uneven_texture;dark_circles;puffiness;scarring;sun_damage | dryness;sensitivity                             |
| texture         | Product texture         | Yes      | gel, cream, lotion, foam, oil, spray, mask, balm                                      | cream                                           |
| fragrance_free  | Is fragrance free       | Yes      | true or false                                                                         | true                                            |
| alcohol_free    | Is alcohol free         | Yes      | true or false                                                                         | true                                            |
| ingredients     | Ingredients list        | No       | Semicolon-separated list of name:function pairs                                       | Ceramides:Hydration;Hyaluronic Acid:Moisture    |
| price           | Price in USD            | Yes      | Numeric value                                                                         | 12.99                                           |
| purchase_link   | Link to purchase        | No       | URL                                                                                   | https://example.com/product                     |
| image_url       | Product image           | No       | URL                                                                                   | https://example.com/image.jpg                   |
| instructions    | Usage instructions      | Yes      | Text                                                                                  | Apply to damp skin massage gently rinse thoroughly. |

**Formatting Notes:**
- For fields that accept multiple values (use_time, skin_types, skin_concerns, ingredients), separate each value with a semicolon (`;`).
- For boolean fields (fragrance_free, alcohol_free), use `true` or `false` (no quotes).
- For the `ingredients` field, each entry should be in the format `name:function` (e.g., `Ceramides:Hydration`).
- All required fields must be filled with valid values as specified above.

## Valid Values

### Product Types
cleanser, moisturizer, sunscreen, toner, essence, hydrator, serum, ampoule, spotTreatment, exfoliant, retinoid, peptide, vitaminC, niacinamide, brightening, antiAging, sleepingMask, nightCream, faceOil, eyeCream, eyeSerum, lipBalm, lipCare, makeupRemover, cleansingBalm, micellarWater, oilCleanser, faceMask, sheetMask, clayMask, peelMask, scrubMask, hydratingMask, detoxMask, barrierCream, cicaCream, soothingCream, antiRedness, poreMinimizer, sebumControl

### Age Ranges
0-1, 1-3, 4-12, 13-17, 18-25, 26-35, 36-45, 46-60, 60+

### Skin Types
oily, combination, dry, normal, sensitive, mature, all

### Skin Concerns
acne, blackheads, dullness, hyperpigmentation, fine_lines, wrinkles, dehydration, dryness, redness, sensitivity, pores, oiliness, uneven_texture, dark_circles, puffiness, scarring, sun_damage

## Important Notes

1. **Array Separators**: For fields that accept multiple values (use_time, skin_types, skin_concerns, ingredients), use semicolons (;) to separate values, not commas.

2. **Ingredients Format**: Each ingredient should be in the format `name:function`. Multiple ingredients should be separated by semicolons.

3. **Boolean Values**: For boolean fields (fragrance_free, alcohol_free), use "true" or "false" (without quotes).

4. **Required Fields**: All fields marked as required must have valid values.

5. **Validation**: The system will validate your data before import and show any errors that need to be fixed.

## Example

```
name,brand,type,gender,age,budget,category,use_time,skin_types,skin_concerns,texture,fragrance_free,alcohol_free,ingredients,price,purchase_link,image_url,instructions
Gentle Hydrating Cleanser,CeraVe,cleanser,unisex,18-25,budgetFriendly,core,morning;night,dry;sensitive,dryness;sensitivity,cream,true,true,Ceramides:Hydration;Hyaluronic Acid:Moisture,12.99,https://example.com/product,https://example.com/image.jpg,Apply to damp skin massage gently rinse thoroughly.
```

## Troubleshooting

If you encounter errors during upload:

1. Check that all required fields have valid values
2. Ensure array fields use semicolons as separators
3. Verify that values match the expected formats (e.g., product types, age ranges)
4. Make sure boolean fields are "true" or "false"
5. Check that numeric fields contain valid numbers
