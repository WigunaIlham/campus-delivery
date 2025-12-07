"use client";

import {useEffect, useState} from "react";
import {useParams, useRouter} from "next/navigation";
import {supabase} from "@/lib/supabase/client";
import {useAuth} from "@/components/providers/AuthProvider";
import {Order} from "@/types";
import {OrderStatus} from "@/components/orders/OrderStatus";
import {CourierMap} from "@/components/courier/CourierMap";
import {Button} from "@/components/ui/Button";
import {Card} from "@/components/ui/Card";
import {formatCurrency, formatDate} from "@/lib/utils";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const {user} = useAuth();

  useEffect(() => {
    fetchOrder();

    const channel = supabase
      .channel(`order-${params.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${params.id}`,
        },
        (payload) => {
          setOrder(payload.new as Order);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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

  const handlePay = () => {
    router.push(`/order/${params.id}/payment`);
  };

  const handleBack = () => {
    if (user?.role === "kurir") {
      router.push("/courier");
    } else {
      router.push("/dashboard");
    }
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
          <Button onClick={handleBack}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button variant="outline" onClick={handleBack} className="mb-6">
          ← Back
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Order #{order.id.slice(0, 8)}
          </h1>
          <p className="text-gray-600">
            Created on {formatDate(order.created_at)}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card>
              <h2 className="text-lg font-semibold mb-4">Order Status</h2>
              <OrderStatus order={order} />
            </Card>

            <Card>
              <h2 className="text-lg font-semibold mb-4">Order Details</h2>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Pickup Address</p>
                    <p className="font-medium">{order.pickup_address}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Delivery Address</p>
                    <p className="font-medium">{order.delivery_address}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Item Description</p>
                    <p className="font-medium">{order.item_description}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Weight</p>
                    <p className="font-medium">{order.item_weight} kg</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Status</p>
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-sm font-medium ${
                      order.payment_status === "paid"
                        ? "bg-green-100 text-green-800"
                        : order.payment_status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {order.payment_status.toUpperCase()}
                  </span>
                </div>
              </div>
            </Card>

            <Card>
              <h2 className="text-lg font-semibold mb-4">
                Payment Information
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-medium">
                    {formatCurrency(order.fee)}
                  </span>
                </div>
                <div className="pt-3 border-t">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Amount</span>
                    <span>{formatCurrency(order.fee)}</span>
                  </div>
                </div>
                {order.payment_status === "unpaid" && (
                  <div className="pt-4">
                    <Button onClick={handlePay} className="w-full">
                      Pay Now
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </div>

          <div>
            <Card className="h-full">
              <h2 className="text-lg font-semibold mb-4">Delivery Tracking</h2>
              {order.status === "pending" ||
              order.status === "waiting_payment" ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">
                    Tracking will be available after payment
                  </p>
                </div>
              ) : (
                <>
                  <div className="h-96 mb-4">
                    <CourierMap
                      orderId={order.id}
                      courierId={order.courier_id || undefined}
                    />
                  </div>
                  <div className="text-sm text-gray-600">
                    {order.courier_id ? (
                      <p>The courier is on the way to deliver your order.</p>
                    ) : (
                      <p>Searching for an available courier...</p>
                    )}
                  </div>
                </>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
