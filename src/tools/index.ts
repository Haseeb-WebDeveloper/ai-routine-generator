import { sendMail } from "./send-mail";
import { findBestProducts } from "./find-best-products";
import { buildRoutine } from "./build-routine";
import { planRoutine } from "./plan-routine";
import { planAndSendRoutine } from "./plan-and-send";

export const agentTools = {
//   find_best_products: findBestProducts,
//   build_routine: buildRoutine,
  send_mail: sendMail,
//   plan_routine: planRoutine,
  plan_and_send_routine: planAndSendRoutine,
} as const;
