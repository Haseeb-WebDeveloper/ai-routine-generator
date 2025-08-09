import { sendMail } from "./send-mail";
import { findBestProducts } from "./find-best-products";
import { buildRoutine } from "./build-routine";

export const agentTools = {
  find_best_products: findBestProducts,
  build_routine: buildRoutine,
  send_mail: sendMail,
} as const;
