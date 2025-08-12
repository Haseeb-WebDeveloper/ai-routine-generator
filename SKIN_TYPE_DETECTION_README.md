# Skin Type Detection Feature

## Overview
The skin type detection feature allows users to determine their skin type through two methods:
1. **Question-based detection**: Answer 5 diagnostic questions
2. **Image-based detection**: Upload a photo for AI analysis

## How It Works

### Question-Based Detection (Simplified Flow)
1. **Main Agent Handles Questions**: The main AI agent asks the 5 diagnostic questions one by one
2. **Tool Analysis**: After collecting all 5 answers, the agent calls `detect_skin_type_from_questions` tool
3. **Result**: The tool analyzes responses and returns the detected skin type with recommendations

**The 5 Diagnostic Questions:**
1. "How does your skin typically feel after washing your face with a gentle cleanser?"
2. "How often do you notice shine or oiliness on your face throughout the day?"
3. "How does your skin react to new skincare products?"
4. "Do you experience any of these issues regularly: acne, blackheads, enlarged pores, dryness, flaking, redness, or irritation?"
5. "How does your skin feel in different weather conditions (hot/humid vs cold/dry)?"

### Image-Based Detection
1. User uploads a photo using the upload icon
2. Image is stored on Cloudinary
3. Main agent calls `analyze_skin_type_from_image` tool with the Cloudinary URL
4. Tool analyzes the image and returns skin type analysis

## Technical Implementation

### Tools

#### `detect_skin_type_from_questions`
- **Purpose**: Analyzes user responses to determine skin type
- **Input**: `{ userResponses: [5 answers] }`
- **Output**: `{ message, skinType, confidence, reasoning }`
- **AI Model**: Cohere `command-r-plus`

#### `analyze_skin_type_from_image`
- **Purpose**: Analyzes uploaded image to determine skin type
- **Input**: `{ imageUrl: "cloudinary_url" }`
- **Output**: `{ message }`
- **AI Model**: OpenAI `gpt-4o-mini`

### System Prompt Updates
The system prompt in `src/lib/ai-config.ts` has been simplified to:
- Have the main agent ask the 5 questions directly
- Only call the tool after collecting all answers
- Provide clear instructions for the simplified flow

## User Experience

### Frontend
- **Upload Icon**: Simple upload button next to the chat input
- **No Complex UI**: Removed "Analyze Skin with Photo" and "Help Me Find My Skin Type" buttons
- **Clean Interface**: Only upload icon for image analysis

### Conversation Flow
1. Agent asks: "What's your skin type?"
2. If "not sure": Agent asks 5 questions one by one
3. After all answers: Agent calls tool for analysis
4. Tool returns skin type and recommendations
5. Agent continues with next question in the routine

## Benefits of Simplified Approach

1. **Easier Debugging**: Main agent handles conversation flow
2. **Better User Experience**: No complex tool interactions
3. **Cleaner Code**: Tool only does analysis, not conversation management
4. **More Reliable**: Less chance of conversation getting stuck

## Testing

Use the `test-tools.js` script to test the simplified tools:
```bash
node test-tools.js
```

## Environment Variables

Ensure these are set for Cloudinary integration:
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
