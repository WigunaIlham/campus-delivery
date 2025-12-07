import {NextRequest, NextResponse} from "next/server";
import {supabaseServer} from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const {email, password} = await request.json();

    const {data, error} = await supabaseServer.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json({error: error.message}, {status: 400});
    }

    return NextResponse.json({user: data.user});
  } catch (error: any) {
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}
