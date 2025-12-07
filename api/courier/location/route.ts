import {NextRequest, NextResponse} from "next/server";
import {supabaseServer} from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const {courierId, coordinates, isAvailable} = await request.json();

    const {data, error} = await supabaseServer
      .from("courier_locations")
      .upsert({
        courier_id: courierId,
        coordinates,
        is_available: isAvailable,
        last_updated: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({error: error.message}, {status: 500});
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}

export async function GET(request: NextRequest) {
  try {
    const {searchParams} = new URL(request.url);
    const courierId = searchParams.get("courier_id");
    const availableOnly = searchParams.get("available_only") === "true";

    let query = supabaseServer.from("courier_locations").select("*");

    if (courierId) {
      query = query.eq("courier_id", courierId);
    }

    if (availableOnly) {
      query = query.eq("is_available", true);
    }

    const {data, error} = await query;

    if (error) {
      return NextResponse.json({error: error.message}, {status: 500});
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}
