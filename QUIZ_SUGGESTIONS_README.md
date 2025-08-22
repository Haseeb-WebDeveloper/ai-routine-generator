# Quiz Dynamic Suggestions System

## Overview
The quiz page now includes a dynamic suggestion system that automatically detects when the AI is asking specific questions and provides relevant suggestion buttons for users to click. The system supports both single and multiple selections depending on the question type.

## How It Works

### 1. Question Detection
The system monitors AI responses and looks for text patterns like "Question 1 of 8", "Question 2 of 8", etc.

### 2. Dynamic Suggestion Generation
Based on the detected question number, the system automatically generates relevant suggestions:

- **Question 1**: Skin type options (Oily, Combination, Dry, Normal, Sensitive, Mature, Not sure) - **Single Selection**
- **Question 2**: Common skin concerns (Acne, Dark spots, Wrinkles, Dull skin, Redness, Large pores, Uneven texture) - **Multiple Selection**
- **Question 3**: Age ranges (18-25, 26-35, 36-45, 46-55, 56+) - **Single Selection**
- **Question 4**: Gender options (Female, Male, Prefer not to say) - **Single Selection**
- **Question 5**: Allergy options (No allergies, Fragrances, Essential oils, Retinoids) - **Multiple Selection** (No allergies is exclusive)
- **Question 6**: No suggestions (user describes current routine)
- **Question 7**: Time commitment (Minimal, Standard, Comprehensive) - **Single Selection**
- **Question 8**: Product preferences (Heavy creams, Oils, Sticky serums, Strong scents, None) - **Multiple Selection**

### 3. Selection Types

#### Single Selection Questions
- Users click a suggestion button and the answer is sent immediately
- Examples: Skin type, Age, Gender, Time commitment

#### Multiple Selection Questions
- Users can select multiple options by clicking them
- Selected options are subtly highlighted with darker background and border
- A "Select multiple options" hint appears above the suggestions
- Users press Enter to submit all selected options at once
- Special case: "No allergies" is exclusive and sends immediately when clicked
- Examples: Skin concerns, Allergies, Product preferences

### 4. User Interaction
- **Single Selection**: Click any suggestion button to automatically send that response
- **Multiple Selection**: 
  - Click suggestions to select/deselect them
  - Selected items are visually highlighted
  - Press Enter key to submit all selections
  - "No allergies" sends immediately (clears other selections)
- Suggestions are disabled while the AI is processing
- Clean, minimal UI without submit buttons or check icons

### 5. Implementation Details

#### Files Modified:
- `src/lib/quiz-suggestions.ts` - Updated with multi-selection support
- `src/app/quiz/page.tsx` - Enhanced with multi-selection UI and logic

#### Key Functions:
- `extractQuestionNumber(message)` - Extracts question number from AI text
- `getQuizSuggestions(questionNumber)` - Returns appropriate suggestions for each question
- `allowsMultipleSelections(questionNumber)` - Checks if question supports multiple selections
- `handleSuggestionClick(suggestion)` - Handles single/multiple suggestion clicks
- `handleMultipleSuggestionsSubmit()` - Submits multiple selected suggestions

#### State Management:
- `currentSuggestions` - Stores the current suggestion buttons to display
- `selectedSuggestions` - Tracks selected items for multiple choice questions
- `currentQuestionNumber` - Tracks the current question being asked
- Suggestions automatically update when new AI messages are received
- Selections are cleared when the quiz resets or questions change

## Benefits
1. **Improved User Experience** - Users don't need to type common answers
2. **Faster Quiz Completion** - One-click responses for standard options
3. **Reduced Typos** - Prevents user input errors
4. **Guided Experience** - Users see what options are available
5. **Accessibility** - Easier for users who prefer clicking over typing
6. **Flexibility** - Supports both single and multiple selections as appropriate
7. **Clean UI** - Minimal visual clutter with subtle selection indicators
8. **Smart Behavior** - "No allergies" automatically clears other allergy selections

## Future Enhancements
- Add more specific suggestions based on user's previous answers
- Implement suggestion analytics to improve options
- Add localization support for different languages
- Consider adding custom suggestion inputs for edge cases
- Add keyboard shortcuts for power users
- Implement suggestion history for complex multi-selection scenarios
