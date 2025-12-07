"use client";

import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {supabase} from "@/lib/supabase/client";
import {useAuth} from "@/components/providers/AuthProvider";
import Navbar from "@/components/ui/Navbar";
import {Button} from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import {Badge} from "@/components/ui/Badge";
import {Progress} from "@/components/ui/Progress";
import {
  Package,
  Plus,
  Clock,
  CheckCircle,
  Truck,
  MapPin,
  ArrowRight,
  Bell,
  TrendingUp,
  Users,
} from "lucide-react";
import {Order} from "@/types";
import {formatCurrency, formatDate} from "@/lib/utils";
import {cn} from "@/lib/utils";
import Footer from "@/components/ui/Footer";

export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalSpent: 0,
  });
  const [loading, setLoading] = useState(true);
  const {user, signOut} = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    fetchOrders();

    const channel = supabase
      .channel("order-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, router]);

  const fetchOrders = async () => {
    if (!user) return;

    const {data, error} = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", {ascending: false})
      .limit(5);

    if (!error && data) {
      setOrders(data);

      const totalOrders = data.length;
      const pendingOrders = data.filter(
        (o) => o.status !== "delivered" && o.status !== "cancelled"
      ).length;
      const completedOrders = data.filter(
        (o) => o.status === "delivered"
      ).length;
      const totalSpent = data.reduce((sum, order) => sum + order.fee, 0);

      setStats({
        totalOrders,
        pendingOrders,
        completedOrders,
        totalSpent,
      });
    }
    setLoading(false);
  };

  const handleCreateOrder = () => {
    router.push("/dashboard/create-order");
  };

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-600";
      case "waiting_payment":
        return "bg-orange-500/20 text-orange-600";
      case "searching_courier":
        return "bg-blue-500/20 text-blue-600";
      case "matched":
        return "bg-purple-500/20 text-purple-600";
      case "picked_up":
        return "bg-indigo-500/20 text-indigo-600";
      case "on_delivery":
        return "bg-green-500/20 text-green-600";
      case "delivered":
        return "bg-emerald-500/20 text-emerald-600";
      case "cancelled":
        return "bg-red-500/20 text-red-600";
      default:
        return "bg-gray-500/20 text-gray-600";
    }
  };

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-4 w-4" />;
      case "on_delivery":
        return <Truck className="h-4 w-4" />;
      case "matched":
        return <Users className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Welcome back,{" "}
                <span className="text-primary">
                  {user?.full_name?.split(" ")[0] || "Student"}
                </span>
                !
              </h1>
              <p className="text-muted-foreground mt-2">
                Track your orders and manage your deliveries
              </p>
            </div>
            <Button onClick={handleCreateOrder} className="group">
              <Plus className="mr-2 h-4 w-4" />
              New Order
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-none shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Orders
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Package className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground mt-1">
                All time orders placed
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Active Orders
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Clock className="h-4 w-4 text-orange-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingOrders}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Currently being delivered
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedOrders}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Successfully delivered
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-purple-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.totalSpent)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                On food delivery
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <Card className="border-none shadow-soft">
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>
                  Your recent food delivery orders
                </CardDescription>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                      <Package className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      No orders yet
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first order to get started
                    </p>
                    <Button onClick={handleCreateOrder}>Create Order</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="group flex items-center justify-between rounded-lg border p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                        onClick={() => router.push(`/order/${order.id}`)}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            {getStatusIcon(order.status)}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium">
                                Order #{order.id.slice(0, 8)}
                              </h4>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-xs",
                                  getStatusColor(order.status)
                                )}
                              >
                                {order.status.replace("_", " ")}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {order.pickup_address} → {order.delivery_address}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDate(order.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">
                            {formatCurrency(order.fee)}
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    ))}

                    {orders.length > 0 && (
                      <Button
                        variant="ghost"
                        className="w-full mt-4"
                        onClick={() => router.push("/dashboard/orders")}
                      >
                        View all orders
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Progress */}
          <div className="space-y-6">
            <Card className="border-none shadow-soft">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleCreateOrder}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New Delivery Order
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push("/dashboard/orders")}
                >
                  <Package className="mr-2 h-4 w-4" />
                  View All Orders
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push("/settings")}
                >
                  <Bell className="mr-2 h-4 w-4" />
                  Notification Settings
                </Button>
              </CardContent>
            </Card>

            <Card className="border-none shadow-soft">
              <CardHeader>
                <CardTitle>Delivery Progress</CardTitle>
                <CardDescription>Your order completion rate</CardDescription>
              </CardHeader>
              <CardContent>
                <Progress
                  value={
                    stats.totalOrders > 0
                      ? (stats.completedOrders / stats.totalOrders) * 100
                      : 0
                  }
                  showLabel
                  className="mb-4"
                />
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      {stats.completedOrders}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Completed
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-500">
                      {stats.pendingOrders}
                    </div>
                    <div className="text-xs text-muted-foreground">Active</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {stats.totalOrders}
                    </div>
                    <div className="text-xs text-muted-foreground">Total</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-soft bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Need help?</h3>
                    <p className="text-sm text-muted-foreground">
                      Contact our campus support team
                    </p>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-4">
                  Get Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
