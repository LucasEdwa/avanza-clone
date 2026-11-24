"use server";

import { redirect } from "next/navigation";
import { destroyAllSessions, destroySession, requireUser } from "@/lib/auth";

export async function logout(reason?: string) {
  await destroySession();
  redirect(reason === "idle" ? "/logga-in?utloggad=1" : "/");
}

export async function logoutEverywhere() {
  const user = await requireUser();
  await destroyAllSessions(user.id);
  redirect("/logga-in");
}
