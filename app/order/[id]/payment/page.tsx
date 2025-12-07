"use client";

import {useEffect, useState} from "react";
import {useParams, useRouter} from "next/navigation";
import {supabase} from "@/lib/supabase/client";
import {useAuth} from "@/components/providers/AuthProvider";
import {Button} from "@/components/ui/Button";
import {Card} from "@/components/ui/Card";
import {formatCurrency} from "@/lib/utils";

declare global {
  interface Window {
    snap: any;
  }
}

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const {user} = useAuth();

  useEffect(() => {
    fetchOrder();
  }, [params.id]);

  const fetchOrder = async () => {
    const {data, error} = await supabase
      .from("orders")
      .select("*")
      .eq("id", params.id)
      .single();

    if (!error && data) {
      setOrder(data);
    }
    setLoading(false);
  };

  const handlePayment = async () => {
    if (!order || !user) return;

    setProcessing(true);

    try {
      const response = await fetch("/api/payment/create", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          orderId: order.id,
          amount: order.fee,
          customerDetails: {
            first_name: user.full_name || "",
            email: user.email,
            phone: user.phone || "",
          },
        }),
      });

      const paymentData = await response.json();

      if (paymentData.error) {
        throw new Error(paymentData.error);
      }

      const script = document.createElement("script");
      script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
      script.setAttribute(
        "data-client-key",
        process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!
      );
      script.onload = () => {
        window.snap.pay(paymentData.token, {
          onSuccess: async function (result: any) {
            await updateOrderPaymentStatus("paid", result);
            router.push(`/order/${order.id}`);
          },
          onPending: async function (result: any) {
            await updateOrderPaymentStatus("pending", result);
            router.push(`/order/${order.id}`);
          },
          onError: async function (result: any) {
            await updateOrderPaymentStatus("failed", result);
            alert("Payment failed. Please try again.");
          },
          onClose: function () {
            setProcessing(false);
          },
        });
      };
      document.body.appendChild(script);
    } catch (error: any) {
      alert(error.message || "Payment failed");
      setProcessing(false);
    }
  };

  const updateOrderPaymentStatus = async (status: string, result: any) => {
    await supabase
      .from("orders")
      .update({
        payment_status: status,
        midtrans_order_id: result.order_id,
        status: status === "paid" ? "searching_courier" : "waiting_payment",
      })
      .eq("id", order.id);
  };

  const handleCancel = () => {
    router.push(`/order/${order.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Order not found
          </h2>
          <Button onClick={() => router.push("/dashboard")}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button variant="outline" onClick={handleCancel} className="mb-6">
          ← Back to Order
        </Button>

        <Card>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment</h1>
          <p className="text-gray-600 mb-6">Order #{order.id.slice(0, 8)}</p>

          <div className="space-y-6">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3">Order Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span>{formatCurrency(order.fee)}</span>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total Amount</span>
                    <span>{formatCurrency(order.fee)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3">Payment Methods</h3>
              <div className="space-y-3">
                <div className="flex items-center p-3 border rounded hover:bg-gray-50 cursor-pointer">
                  <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-bold">CC</span>
                  </div>
                  <span>Credit/Debit Card</span>
                </div>
                <div className="flex items-center p-3 border rounded hover:bg-gray-50 cursor-pointer">
                  <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center mr-3">
                    <span className="text-green-600 font-bold">VA</span>
                  </div>
                  <span>Virtual Account</span>
                </div>
                <div className="flex items-center p-3 border rounded hover:bg-gray-50 cursor-pointer">
                  <div className="w-8 h-8 bg-orange-100 rounded flex items-center justify-center mr-3">
                    <span className="text-orange-600 font-bold">EW</span>
                  </div>
                  <span>E-Wallet</span>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePayment}
                loading={processing}
                className="flex-1"
              >
                Proceed to Payment
              </Button>
            </div>

            <div className="text-sm text-gray-500">
              <p>
                By proceeding, you agree to our Terms of Service and Privacy
                Policy.
              </p>
              <p className="mt-1">Secure payment powered by Midtrans.</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
