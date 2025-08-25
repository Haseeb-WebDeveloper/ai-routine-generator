import { sendMail } from "./send-mail";
import { planRoutine } from "./plan-routine";

export const agentTools = {
  send_mail: sendMail,
  plan_routine: planRoutine,
} as const;
