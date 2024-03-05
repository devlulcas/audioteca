import { fail } from "@sveltejs/kit";

export type ActionFailBody = {
  as: "warning" | "error";
  message: string;
} & Record<string, unknown>;

export const actionFail = (status: number, body: ActionFailBody) => fail(status, body);
