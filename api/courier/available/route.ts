import {NextRequest, NextResponse} from "next/server";
import {supabaseServer} from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const {data, error} = await supabaseServer
      .from("courier_locations")
      .select("*")
      .eq("is_available", true);

    if (error) {
      return NextResponse.json({error: error.message}, {status: 500});
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}
