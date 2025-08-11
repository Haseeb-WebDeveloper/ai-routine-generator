
import { tool } from "ai";
import { z } from "zod";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const sendMail = tool({
  description: `Use this tool to send an routine to a user's email address.`,
  inputSchema: z.object({
    summary: z
      .string()
      .describe(
        "The complete skincare routine summary including morning/evening steps, product recommendations, and tips."
      ),
    email: z
      .string()
      .min(5)
      .describe("The recipient user's email address."),
    subject: z
      .string()
      .optional()
      .describe("Optional custom subject line for the email."),
  }),
  execute: async ({ summary, email, subject }) => {
    try {
      console.log("[TOOL/send_mail] === Starting email send ===");
      console.log("[TOOL/send_mail] baseUrl:", baseUrl);
      console.log("[TOOL/send_mail] summary length:", summary?.length);
      console.log("[TOOL/send_mail] summary preview:", summary?.substring(0, 100) + "...");
      console.log("[TOOL/send_mail] sending to:", email);
      console.log("[TOOL/send_mail] subject:", subject);
      
      // Call your API route to send the email
      const response = await fetch(`${baseUrl}/api/send-mail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          summary,
          subject: subject || "Your Personalized Skincare Routine ✨"
        }),
      });

      const result = await response.json();
      
      console.log("[TOOL/send_mail] API response status:", response.status);
      console.log("[TOOL/send_mail] API response:", result);

      if (!response.ok) {
        console.error("[TOOL/send_mail] API error:", result);
        throw new Error(result.error || 'Failed to send email');
      }

      console.log("[TOOL/send_mail] === Email sent successfully ===");
      return `✅ Successfully sent your personalized skincare routine to ${email}! Check your inbox (and spam folder) for your custom routine.`;
      
    } catch (error) {
      console.error('[TOOL/send_mail] error:', error);
      return `❌ Sorry, I couldn't send the email to ${email}. Please try again or contact support. Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  },
});
