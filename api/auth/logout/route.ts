import {NextRequest, NextResponse} from "next/server";
import {supabaseServer} from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const {error} = await supabaseServer.auth.signOut();

    if (error) {
      return NextResponse.json({error: error.message}, {status: 500});
    }

    return NextResponse.json({success: true});
  } catch (error: any) {
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}
