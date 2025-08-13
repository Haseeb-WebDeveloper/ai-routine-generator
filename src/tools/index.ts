import { sendMail } from "./send-mail";
import { planAndSendRoutine } from "./plan-and-send";

export const agentTools = {
  send_mail: sendMail,
  plan_and_send_routine: planAndSendRoutine,
} as const;
