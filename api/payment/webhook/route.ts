import {NextRequest, NextResponse} from "next/server";
import {supabaseServer} from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {order_id, transaction_status, fraud_status} = body;

    let paymentStatus = "pending";
    let orderStatus = "waiting_payment";

    if (transaction_status === "capture") {
      if (fraud_status === "challenge") {
        paymentStatus = "pending";
      } else if (fraud_status === "accept") {
        paymentStatus = "paid";
        orderStatus = "searching_courier";
      }
    } else if (transaction_status === "settlement") {
      paymentStatus = "paid";
      orderStatus = "searching_courier";
    } else if (transaction_status === "pending") {
      paymentStatus = "pending";
    } else if (
      transaction_status === "deny" ||
      transaction_status === "cancel" ||
      transaction_status === "expire"
    ) {
      paymentStatus = "failed";
    }

    const {data: order, error: orderError} = await supabaseServer
      .from("orders")
      .select("*")
      .eq("midtrans_order_id", order_id)
      .single();

    if (!orderError && order) {
      await supabaseServer
        .from("orders")
        .update({
          payment_status: paymentStatus,
          status: orderStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id);

      await supabaseServer.from("payments").insert([
        {
          order_id: order.id,
          midtrans_transaction_id: order_id,
          amount: order.fee,
          status: paymentStatus,
          payment_time: new Date().toISOString(),
          created_at: new Date().toISOString(),
        },
      ]);
    }

    return NextResponse.json({received: true});
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      {error: "Webhook processing failed"},
      {status: 500}
    );
  }
}
