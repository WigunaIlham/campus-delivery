import {NextRequest, NextResponse} from "next/server";
import {supabaseServer} from "@/lib/supabase/server";
import {createMidtransClient} from "@/lib/midtrans/client";

export async function POST(request: NextRequest) {
  try {
    const {orderId, amount, customerDetails} = await request.json();

    const {data: order, error: orderError} = await supabaseServer
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError) {
      return NextResponse.json({error: "Order not found"}, {status: 404});
    }

    const snap = createMidtransClient();
    const parameter = {
      transaction_details: {
        order_id: `ORDER-${orderId}-${Date.now()}`,
        gross_amount: amount,
      },
      customer_details: customerDetails,
      credit_card: {
        secure: true,
      },
    };

    const transaction = await snap.createTransaction(parameter);

    const {data: updatedOrder, error: updateError} = await supabaseServer
      .from("orders")
      .update({
        payment_token: transaction.token,
        midtrans_order_id: parameter.transaction_details.order_id,
        payment_status: "pending",
        status: "waiting_payment",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({error: updateError.message}, {status: 500});
    }

    return NextResponse.json({
      token: transaction.token,
      redirect_url: transaction.redirect_url,
      order: updatedOrder,
    });
  } catch (error: any) {
    console.error("Payment creation error:", error);
    return NextResponse.json(
      {error: error.message || "Payment creation failed"},
      {status: 500}
    );
  }
}
