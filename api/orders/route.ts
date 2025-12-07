import {NextRequest, NextResponse} from "next/server";
import {supabaseServer} from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const {searchParams} = new URL(request.url);
    const userId = searchParams.get("user_id");
    const courierId = searchParams.get("courier_id");
    const status = searchParams.get("status");

    let query = supabaseServer.from("orders").select("*");

    if (userId) {
      query = query.eq("user_id", userId);
    }

    if (courierId) {
      query = query.eq("courier_id", courierId);
    }

    if (status) {
      query = query.eq("status", status);
    }

    query = query.order("created_at", {ascending: false});

    const {data, error} = await query;

    if (error) {
      return NextResponse.json({error: error.message}, {status: 500});
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}

export async function POST(request: NextRequest) {
  try {
    const order = await request.json();

    const {data, error} = await supabaseServer
      .from("orders")
      .insert([order])
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
