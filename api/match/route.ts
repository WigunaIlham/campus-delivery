import {NextRequest, NextResponse} from "next/server";
import {supabaseServer} from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const {orderId} = await request.json();

    const {data: order, error: orderError} = await supabaseServer
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError) {
      return NextResponse.json({error: "Order not found"}, {status: 404});
    }

    const {data: availableCouriers, error: couriersError} = await supabaseServer
      .from("courier_locations")
      .select("*")
      .eq("is_available", true);

    if (couriersError || !availableCouriers || availableCouriers.length === 0) {
      return NextResponse.json({error: "No available couriers"}, {status: 404});
    }

    const matchedCourier = availableCouriers[0];

    const {data: updatedOrder, error: updateError} = await supabaseServer
      .from("orders")
      .update({
        courier_id: matchedCourier.courier_id,
        status: "matched",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({error: updateError.message}, {status: 500});
    }

    await supabaseServer
      .from("courier_locations")
      .update({is_available: false})
      .eq("courier_id", matchedCourier.courier_id);

    return NextResponse.json(updatedOrder);
  } catch (error: any) {
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}
