import { EmailTemplate } from "@/types/admin"

export const DEFAULT_TEMPLATES: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>[] = [
    {
      name: 'Skincare Quiz Invitation',
      subject: 'Your Personalized Skincare Routine Awaits!',
      content: `Hi {{name}},
  
  We're excited to create a custom skincare routine just for you! 
  
  Our AI-powered system will analyze your skin type, concerns, and preferences to recommend the perfect products for your unique needs.
  
  It takes less than a minute to complete the quiz, and the results will stay with you forever.
  
  Click the button below to start your personalized skincare quiz:
  
  {{LINK}}
  
  This link is unique to you and will expire after use.
  
  Best regards,
  The AI Routine Team`
    },
    {
      name: 'Follow-up Reminder',
      subject: 'Don\'t miss out on your personalized skincare routine!',
      content: `Hi {{name}},
  
  We noticed you haven't completed your skincare quiz yet. 
  
  Your personalized routine is waiting for you! It only takes a minute to complete, and you'll get:
  
  • Custom product recommendations
  • Personalized routine schedule
  • Expert skincare tips
  • Ongoing support
  
  Click here to complete your quiz now:
  
  {{LINK}}
  
  This offer expires soon, so don't wait!
  
  Best regards,
  The AI Routine Team`
    },
    {
      name: 'Welcome Back',
      subject: 'Welcome back! Let\'s update your skincare routine',
      content: `Hi {{name}},
  
  Welcome back! It's been a while since you last visited us.
  
  Your skin changes over time, and so should your skincare routine. Let's update your personalized recommendations to match your current needs.
  
  Take our quick quiz to refresh your routine:
  
  {{LINK}}
  
  It only takes a minute, and you'll get updated recommendations based on your current skin condition.
  
  Best regards,
  The AI Routine Team`
    }
  ]
  