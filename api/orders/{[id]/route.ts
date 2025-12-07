import {NextRequest, NextResponse} from "next/server";
import {supabaseServer} from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  {params}: {params: {id: string}}
) {
  try {
    const {data, error} = await supabaseServer
      .from("orders")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error) {
      return NextResponse.json({error: error.message}, {status: 404});
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}

export async function PUT(
  request: NextRequest,
  {params}: {params: {id: string}}
) {
  try {
    const updates = await request.json();

    const {data, error} = await supabaseServer
      .from("orders")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
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
