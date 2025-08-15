import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Create Brevo SMTP transporter
const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.BREVO_SMTP_USER, // Your Brevo SMTP username
    pass: process.env.BREVO_SMTP_PASS, // Your Brevo SMTP password
  },
});

export async function POST(request: NextRequest) {
  try {
    const { email, summary, subject = "Your Personalized Skincare Routine" } = await request.json();

    // Validate required fields
    if (!email || !summary) {
      return NextResponse.json(
        { error: 'Email and summary are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Create HTML email template
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              max-width: 600px; 
              margin: 0 auto; 
              padding: 20px; 
            }
            .header { 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
              color: white; 
              padding: 30px; 
              text-align: center; 
              border-radius: 10px 10px 0 0; 
            }
            .content { 
              background: #f9f9f9; 
              padding: 30px; 
              border-radius: 0 0 10px 10px; 
            }
            .routine-section { 
              background: white; 
              padding: 20px; 
              margin: 15px 0; 
              border-radius: 8px; 
              box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
            }
            .footer { 
              text-align: center; 
              margin-top: 30px; 
              color: #666; 
              font-size: 14px; 
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>✨ Your Personalized Skincare Routine</h1>
            <p>Crafted just for you by our AI skincare consultant</p>
          </div>
          <div class="content">
            <div class="routine-section">
              ${summary.replace(/\n/g, '<br>')}
            </div>
            <div class="footer">
              <p>💖 Take care of your beautiful skin!</p>
              <p><small>This routine was personalized based on your skin type, concerns, and preferences.</small></p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email using Brevo SMTP
    const mailOptions = {
      from: {
        name: 'Your Skincare AI',
        address: process.env.BREVO_SENDER_EMAIL || 'noreply@yourdomain.com'
      },
      to: email,
      subject: subject,
      text: summary, // Plain text version
      html: htmlContent, // HTML version
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email sent successfully:', info.messageId);
    
    return NextResponse.json({ 
      success: true, 
      message: `Email sent successfully to ${email}`,
      messageId: info.messageId 
    });

  } catch (error) {
    console.error('Error sending email:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to send email',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Optional: Add rate limiting
export async function GET() {
  return NextResponse.json({ message: 'Email API is running' });
}

















































// KLAVIYO

// import { NextRequest, NextResponse } from 'next/server';

// // Klaviyo API configuration
// const KLAVIYO_API_KEY = process.env.KLAVIYO_API_KEY
// const KLAVIYO_API_URL = 'https://a.klaviyo.com/api/v2'
// const KLAVIYO_LIST_ID = process.env.KLAVIYO_LIST_ID

// async function sendEmailViaKlaviyo(to: string, subject: string, content: string) {
//   if (!KLAVIYO_API_KEY) {
//     throw new Error('Klaviyo API key not configured')
//   }

//   if (!KLAVIYO_LIST_ID) {
//     throw new Error('Klaviyo List ID not configured')
//   }

//   try {
//     // First, add/update the contact in Klaviyo
//     const contactData = {
//       profiles: [{
//         email: to,
//         $consent: ['email'],
//         $email_subscribe: true
//       }]
//     }

//     const contactResponse = await fetch(`${KLAVIYO_API_URL}/list/${KLAVIYO_LIST_ID}/members`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
//         'Accept': 'application/json',
//         'Revision': '2023-12-15'
//       },
//       body: JSON.stringify(contactData)
//     })

//     if (!contactResponse.ok) {
//       const errorData = await contactResponse.text()
//       console.error('Klaviyo contact creation error:', errorData)
//       throw new Error(`Failed to create/update contact: ${contactResponse.status}`)
//     }

//     // Now send the email using Klaviyo's send email endpoint
//     const emailData = {
//       token: KLAVIYO_API_KEY,
//       event: 'Email Sent',
//       customer_properties: {
//         $email: to
//       },
//       properties: {
//         $subject: subject,
//         $content: content,
//         $email_body: content
//       }
//     }

//     const emailResponse = await fetch(`${KLAVIYO_API_URL}/track`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Accept': 'application/json'
//       },
//       body: JSON.stringify(emailData)
//     })

//     if (!emailResponse.ok) {
//       const errorData = await emailResponse.text()
//       console.error('Klaviyo email sending error:', errorData)
//       throw new Error(`Failed to send email: ${emailResponse.status}`)
//     }

//     const result = await emailResponse.json()
//     console.log('Klaviyo Success Response:', result)
//     return result

//   } catch (error) {
//     console.error('Klaviyo API error:', error)
//     throw error
//   }
// }

// export async function POST(request: NextRequest) {
//   try {
//     const { email, summary, subject = "Your Personalized Skincare Routine" } = await request.json();

//     console.log("[API/send-mail] email:", email)
//     console.log("[API/send-mail] summary:", summary)
//     console.log("[API/send-mail] subject:", subject)

//     // Validate required fields
//     if (!email || !summary) {
//       return NextResponse.json(
//         { error: 'Email and summary are required' },
//         { status: 400 }
//       );
//     }

//     // Validate email format
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//       return NextResponse.json(
//         { error: 'Invalid email format' },
//         { status: 400 }
//       );
//     }

//     // Create HTML email template
//     const htmlContent = `
//       <!DOCTYPE html>
//       <html>
//         <head>
//           <meta charset="utf-8">
//           <meta name="viewport" content="width=device-width, initial-scale=1.0">
//           <title>${subject}</title>
//           <style>
//             body { 
//               font-family: Arial, sans-serif; 
//               line-height: 1.6; 
//               color: #333; 
//               max-width: 600px; 
//               margin: 0 auto; 
//               padding: 20px; 
//             }
//             .header { 
//               background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
//               color: white; 
//               padding: 30px; 
//               text-align: center; 
//               border-radius: 10px 10px 0 0; 
//             }
//             .content { 
//               background: #f9f9f9; 
//               padding: 30px; 
//               border-radius: 0 0 10px 10px; 
//             }
//             .routine-section { 
//               background: white; 
//               padding: 20px; 
//               margin: 15px 0; 
//               border-radius: 8px; 
//               box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
//             }
//             .footer { 
//               text-align: center; 
//               margin-top: 30px; 
//               color: #666; 
//               font-size: 14px; 
//             }
//           </style>
//         </head>
//         <body>
//           <div class="header">
//             <h1>✨ Your Personalized Skincare Routine</h1>
//             <p>Crafted just for you by our AI skincare consultant</p>
//           </div>
//           <div class="content">
//             <div class="routine-section">
//               ${summary.replace(/\n/g, '<br>')}
//             </div>
//             <div class="footer">
//               <p>💖 Take care of your beautiful skin!</p>
//               <p><small>This routine was personalized based on your skin type, concerns, and preferences.</small></p>
//             </div>
//           </div>
//         </body>
//       </html>
//     `;

//     // Send email using Klaviyo API
//     const result = await sendEmailViaKlaviyo(email, subject, htmlContent);
    
//     console.log('Email sent successfully via Klaviyo');
    
//     return NextResponse.json({ 
//       success: true, 
//       message: `Email sent successfully to ${email} via Klaviyo`,
//       klaviyoResponse: result
//     });

//   } catch (error) {
//     console.error('Error sending email:', error);
    
//     return NextResponse.json(
//       { 
//         success: false, 
//         error: 'Failed to send email',
//         details: error instanceof Error ? error.message : 'Unknown error'
//       },
//       { status: 500 }
//     );
//   }
// }

// // Optional: Add rate limiting
// export async function GET() {
//   return NextResponse.json({ message: 'Email API is running' });
// }
