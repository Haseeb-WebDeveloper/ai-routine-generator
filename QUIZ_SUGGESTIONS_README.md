# Quiz Dynamic Suggestions System

## Overview
The quiz page now includes a dynamic suggestion system that automatically detects when the AI is asking specific questions and provides relevant suggestion buttons for users to click.

## How It Works

### 1. Question Detection
The system monitors AI responses and looks for text patterns like "Question 1 of 9", "Question 2 of 9", etc.

### 2. Dynamic Suggestion Generation
Based on the detected question number, the system automatically generates relevant suggestions:

- **Question 1**: Skin type options (Oily, Combination, Dry, Normal, Sensitive, Mature, Not sure)
- **Question 2**: Common skin concerns (Acne, Dark spots, Wrinkles, Dull skin, Redness, Large pores, Uneven texture)
- **Question 3**: Age ranges (18-25, 26-35, 36-45, 46-55, 56+)
- **Question 4**: Gender options (Female, Male, Prefer not to say)
- **Question 5**: Allergy options (No allergies, Fragrances, Essential oils, Retinoids, Not sure)
- **Question 6**: No suggestions (user describes current routine)
- **Question 7**: Climate options (Hot, Cold, Moderate/varies)
- **Question 8**: Time commitment (Minimal, Standard, Comprehensive)
- **Question 9**: Product preferences (Heavy creams, Oils, Sticky serums, Strong scents, None)

### 3. User Interaction
- Users can click any suggestion button to automatically send that response
- Suggestions are disabled while the AI is processing
- The system shows a question indicator (e.g., "Question 3 of 9") above the suggestions

### 4. Implementation Details

#### Files Modified:
- `src/lib/quiz-suggestions.ts` - New utility file with suggestion logic
- `src/app/quiz/page.tsx` - Updated quiz page with dynamic suggestions

#### Key Functions:
- `extractQuestionNumber(message)` - Extracts question number from AI text
- `getQuizSuggestions(questionNumber)` - Returns appropriate suggestions for each question
- `handleSuggestionClick(suggestion)` - Handles suggestion button clicks

#### State Management:
- `currentSuggestions` - Stores the current suggestion buttons to display
- Suggestions automatically update when new AI messages are received
- Suggestions are cleared when the quiz is reset

## Benefits
1. **Improved User Experience** - Users don't need to type common answers
2. **Faster Quiz Completion** - One-click responses for standard options
3. **Reduced Typos** - Prevents user input errors
4. **Guided Experience** - Users see what options are available
5. **Accessibility** - Easier for users who prefer clicking over typing

## Future Enhancements
- Add more specific suggestions based on user's previous answers
- Implement suggestion analytics to improve options
- Add localization support for different languages
- Consider adding custom suggestion inputs for edge cases
