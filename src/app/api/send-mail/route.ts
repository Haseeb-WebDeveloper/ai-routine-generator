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

    console.log("[API/send-mail] email:", email)
    console.log("[API/send-mail] summary:", summary)
    console.log("[API/send-mail] subject:", subject)

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
