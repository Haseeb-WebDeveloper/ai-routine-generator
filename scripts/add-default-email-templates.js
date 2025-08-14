const { PrismaClient } = require('@prisma/client')
require('dotenv').config()

const prisma = new PrismaClient()

const defaultTemplates = [
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
  },
  {
    name: 'Product Recommendation',
    subject: 'New products perfect for your skin type!',
    content: `Hi {{name}},

We've found some amazing new products that are perfect for your skin type and concerns!

Based on your previous quiz results, we think you'll love these:

• {{PRODUCT_1}} - Perfect for your {{SKIN_TYPE}} skin
• {{PRODUCT_2}} - Addresses your {{SKIN_CONCERN}} concerns
• {{PRODUCT_3}} - Fits your {{BUDGET}} budget

Check them out here:

{{LINK}}

Your skin deserves the best!

Best regards,
The AI Routine Team`
  },
  {
    name: 'Seasonal Skincare Update',
    subject: 'Time to update your routine for {{SEASON}}!',
    content: `Hi {{name}},

The seasons are changing, and so should your skincare routine!

{{SEASON}} brings different challenges for your skin:
• {{SEASONAL_CONCERN_1}}
• {{SEASONAL_CONCERN_2}}
• {{SEASONAL_CONCERN_3}}

Let's update your routine to keep your skin healthy all year round:

{{LINK}}

Take our quick seasonal quiz to get updated recommendations!

Best regards,
The AI Routine Team`
  }
]

async function addDefaultEmailTemplates() {
  console.log('📧 Adding default email templates...')
  
  let successCount = 0
  let errorCount = 0
  
  try {
    for (const template of defaultTemplates) {
      try {
        console.log(`\n🔄 Processing: ${template.name}...`)
        
        const createdTemplate = await prisma.emailTemplate.create({
          data: template
        })

        console.log(`✅ Added: ${createdTemplate.name}`)
        successCount++
        
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`⚠️  Template "${template.name}" already exists, skipping...`)
        } else {
          console.error(`❌ Error adding ${template.name}:`, error.message)
          errorCount++
        }
      }
    }

    console.log('\n🎉 Email templates processing complete!')
    console.log(`✅ Successfully added: ${successCount} templates`)
    if (errorCount > 0) {
      console.log(`❌ Failed to add: ${errorCount} templates`)
    }
    console.log('You can now view them in the admin panel under Email Templates.')
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
addDefaultEmailTemplates()
