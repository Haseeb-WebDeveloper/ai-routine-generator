import { sendMail } from "./send-mail";
import { planAndSendRoutine } from "./plan-and-send";
import { detectSkinTypeFromQuestions } from "./detect-skin-type-from-questions";
import { analyzeSkinTypeFromImage } from "./detect-skin-type-from-image";

export const agentTools = {
  // send_mail: sendMail,
  plan_and_send_routine: planAndSendRoutine,
  detect_skin_type_from_questions: detectSkinTypeFromQuestions,
  analyze_skin_type_from_image: analyzeSkinTypeFromImage,
} as const;
