
import { tool } from "ai";
import { z } from "zod";

export const sendMail = tool({
  description: `Use this tool to send a personalized skincare routine summary to a user's email address. This should be used after creating a complete skincare routine for the user.`,
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
      console.log("[TOOL/send_mail] sending to:", email)
      // Call your API route to send the email
      const response = await fetch('/api/send-mail', {
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

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send email');
      }

      return `✅ Successfully sent your personalized skincare routine to ${email}! Check your inbox (and spam folder) for your custom routine.`;
      
    } catch (error) {
      console.error('[TOOL/send_mail] error:', error);
      return `❌ Sorry, I couldn't send the email to ${email}. Please try again or contact support. Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  },
});
