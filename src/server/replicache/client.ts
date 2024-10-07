import { action } from "@solidjs/router";
import { insertSpaceServerAction } from "./server";

export const insertSpaceAction = action(insertSpaceServerAction);
