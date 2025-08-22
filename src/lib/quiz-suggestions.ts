export interface QuizSuggestion {
  text: string;
  value: string;
}

export function getQuizSuggestions(questionNumber: number): QuizSuggestion[] {
  switch (questionNumber) {
    case 1:
      // Skin type suggestions
      return [
        { text: "Oily", value: "Oily" },
        { text: "Combination", value: "Combination" },
        { text: "Dry", value: "Dry" },
        { text: "Normal", value: "Normal" },
        { text: "Sensitive", value: "Sensitive" },
        { text: "Mature", value: "Mature" },
        { text: "Not sure", value: "Not sure" }
      ];
    
    case 2:
      // Skin concerns suggestions
      return [
        { text: "Acne", value: "Acne" },
        { text: "Dark spots", value: "Dark spots" },
        { text: "Wrinkles", value: "Wrinkles" },
        { text: "Dull skin", value: "Dull skin" },
        { text: "Redness", value: "Redness" },
        { text: "Large pores", value: "Large pores" },
        { text: "Uneven texture", value: "Uneven texture" }
      ];
    
    case 3:
      // Age suggestions (common age ranges)
      return [
        { text: "18-25", value: "18-25" },
        { text: "26-35", value: "26-35" },
        { text: "36-45", value: "36-45" },
        { text: "46-55", value: "46-55" },
        { text: "56+", value: "56+" }
      ];
    
    case 4:
      // Gender suggestions
      return [
        { text: "Female", value: "Female" },
        { text: "Male", value: "Male" },
        { text: "Prefer not to say", value: "Prefer not to say" }
      ];
    
    case 5:
      // Allergy suggestions
      return [
        { text: "No allergies", value: "No known allergies" },
        { text: "Fragrances", value: "Fragrances" },
        { text: "Essential oils", value: "Essential oils" },
        { text: "Retinoids", value: "Retinoids" },
      ];
    
    case 6:
      // Skip suggestions for current routine question
      return [];
    
    case 8:
      // Time commitment suggestions
      return [
        { text: "Minimal (5 min)", value: "Minimal (3-4 steps, 5 minutes max)" },
        { text: "Standard (10 min)", value: "Standard (5-7 steps, 10 minutes)" },
        { text: "Comprehensive (15+ min)", value: "Comprehensive (8+ steps, 15+ minutes)" }
      ];
    
    case 7:
      // Product preference suggestions
      return [
          { text: "None", value: "None" },
        { text: "Heavy creams", value: "I don't like heavy creams" },
        { text: "Oils", value: "I don't like oils" },
        { text: "Sticky serums", value: "I don't like sticky serums" },
        { text: "Strong scents", value: "I don't like strong scents" },
      ];
    
    default:
      return [];
  }
}

export function extractQuestionNumber(message: string): number | null {
  const regex = /Question (\d+) of 8/i;
  const match = message.match(regex);
  return match ? parseInt(match[1], 10) : null;
}
