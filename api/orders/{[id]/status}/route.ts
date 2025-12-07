import {NextRequest, NextResponse} from "next/server";
import {supabaseServer} from "@/lib/supabase/server";

export async function PUT(
  request: NextRequest,
  {params}: {params: {id: string}}
) {
  try {
    const {status, notes} = await request.json();

    const {data, error} = await supabaseServer
      .from("orders")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({error: error.message}, {status: 500});
    }

    if (data) {
      await supabaseServer.from("order_tracking").insert([
        {
          order_id: params.id,
          status,
          notes,
          created_at: new Date().toISOString(),
        },
      ]);
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}
