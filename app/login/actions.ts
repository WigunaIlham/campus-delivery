"use server";

import {supabaseServer} from "@/lib/supabase/server";
import {redirect} from "next/navigation";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const {error, data} = await supabaseServer.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {error: error.message};
  }

  const {data: profile} = await supabaseServer
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  if (profile?.role === "kurir") {
    redirect("/courier");
  } else {
    redirect("/dashboard");
  }
}
