import { action } from "@solidjs/router";
import { insertGameServerAction } from "./server";

export const insertGameAction = action(insertGameServerAction);
