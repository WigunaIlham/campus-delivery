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
import Map from "@/components/ui/Map";

import {Order} from "@/types";
import {LatLng} from "@/types";
import {
  Package,
  MapPin,
  Clock,
  DollarSign,
  TrendingUp,
  Zap,
  Users,
  CheckCircle,
} from "lucide-react";
import {cn} from "@/lib/utils";
import Footer from "@/components/ui/Footer";

export default function CourierPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [currentLocation, setCurrentLocation] = useState<LatLng | null>(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    completedDeliveries: 0,
    activeDeliveries: 0,
    rating: 4.8,
  });
  const {user, signOut} = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user || user.role !== "kurir") {
      router.push("/login");
      return;
    }

    getLocation();
    fetchOrders();

    const channel = supabase
      .channel("courier-orders")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        () => {
          fetchOrders();
          fetchAvailableOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, router]);

  useEffect(() => {
    if (currentLocation) {
      updateLocation();
    }
  }, [currentLocation]);

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          setCurrentLocation({lat: -6.2, lng: 106.8});
        }
      );
    }
  };

  const updateLocation = async () => {
    if (!user || !currentLocation) return;

    await supabase.from("courier_locations").upsert({
      courier_id: user.id,
      coordinates: [currentLocation.lat, currentLocation.lng],
      is_available: isAvailable,
      last_updated: new Date().toISOString(),
    });
  };

  const fetchOrders = async () => {
    if (!user) return;

    const {data, error} = await supabase
      .from("orders")
      .select("*")
      .eq("courier_id", user.id)
      .order("created_at", {ascending: false});

    if (!error && data) {
      setOrders(data);

      const completedDeliveries = data.filter(
        (o) => o.status === "delivered"
      ).length;
      const activeDeliveries = data.filter((o) =>
        ["matched", "picked_up", "on_delivery"].includes(o.status)
      ).length;
      const totalEarnings = data
        .filter((o) => o.status === "delivered")
        .reduce((sum, order) => sum + order.fee, 0);

      setStats({
        ...stats,
        totalEarnings,
        completedDeliveries,
        activeDeliveries,
      });
    }
    setLoading(false);
  };

  const fetchAvailableOrders = async () => {
    const {data, error} = await supabase
      .from("orders")
      .select("*")
      .eq("status", "searching_courier")
      .order("created_at", {ascending: false});

    if (!error && data) {
      setAvailableOrders(data);
    }
  };

  const handleToggleAvailability = async () => {
    const newAvailability = !isAvailable;
    setIsAvailable(newAvailability);

    if (currentLocation) {
      await supabase.from("courier_locations").upsert({
        courier_id: user!.id,
        coordinates: [currentLocation.lat, currentLocation.lng],
        is_available: newAvailability,
        last_updated: new Date().toISOString(),
      });
    }
  };

  const handleAcceptOrder = async (orderId: string) => {
    if (!user) return;

    const {error} = await supabase
      .from("orders")
      .update({
        courier_id: user.id,
        status: "matched",
      })
      .eq("id", orderId);

    if (!error) {
      setAvailableOrders(
        availableOrders.filter((order) => order.id !== orderId)
      );
      fetchOrders();
    }
  };

  const handleUpdateStatus = async (
    orderId: string,
    newStatus: Order["status"]
  ) => {
    const {error} = await supabase
      .from("orders")
      .update({status: newStatus})
      .eq("id", orderId);

    if (!error) {
      fetchOrders();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  const markers = currentLocation
    ? [
        {
          position: currentLocation,
          title: "Your Location",
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 animate-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant={isAvailable ? "success" : "secondary"}>
                  {isAvailable ? "Available" : "Unavailable"}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {user?.role}
                </Badge>
              </div>
              <h1 className="text-3xl font-bold tracking-tight">
                Courier <span className="text-primary">Dashboard</span>
              </h1>
              <p className="text-muted-foreground mt-2">
                Manage deliveries and track your earnings
              </p>
            </div>
            <Button
              variant={isAvailable ? "default" : "secondary"}
              onClick={handleToggleAvailability}
              className="group"
            >
              <Zap
                className={cn("mr-2 h-4 w-4", isAvailable && "animate-pulse")}
              />
              {isAvailable ? "Available" : "Go Online"}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-none shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Earnings
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-emerald-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                Rp {stats.totalEarnings.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                All time earnings
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.completedDeliveries}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Successful deliveries
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Package className="h-4 w-4 text-orange-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeDeliveries}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Current deliveries
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Rating</CardTitle>
              <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-amber-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.rating}/5</div>
              <p className="text-xs text-muted-foreground mt-1">
                Customer satisfaction
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Map & Available Orders */}
          <div className="lg:col-span-2 space-y-6">
            {/* Map */}
            <Card className="border-none shadow-soft">
              <CardHeader>
                <CardTitle>Live Location</CardTitle>
                <CardDescription>
                  Your location is shared with customers for tracking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 rounded-xl overflow-hidden">
                  <Map
                    center={currentLocation || {lat: -6.2, lng: 106.8}}
                    markers={markers}
                    zoom={13}
                  />
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="h-3 w-3 rounded-full bg-primary" />
                    <span>Your Location</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={getLocation}>
                    <MapPin className="mr-2 h-3 w-3" />
                    Update Location
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Available Orders */}
            <Card className="border-none shadow-soft">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Available Orders</CardTitle>
                    <CardDescription>
                      Accept new delivery requests
                    </CardDescription>
                  </div>
                  <Badge variant="outline">
                    {availableOrders.length} Available
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {availableOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                      <Package className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      No available orders
                    </h3>
                    <p className="text-muted-foreground">
                      New orders will appear here when available
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {availableOrders.slice(0, 3).map((order) => (
                      <div
                        key={order.id}
                        className="rounded-lg border p-4 hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-semibold">
                                Order #{order.id.slice(0, 8)}
                              </h4>
                              <Badge
                                variant="outline"
                                className="bg-blue-500/10 text-blue-600"
                              >
                                New
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              <div className="flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {order.pickup_address}
                              </div>
                              <div className="flex items-center mt-1">
                                <MapPin className="h-3 w-3 mr-1" />
                                {order.delivery_address}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg">
                              Rp {order.fee.toLocaleString()}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Delivery Fee
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>Ready for pickup</span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleAcceptOrder(order.id)}
                            disabled={!isAvailable}
                          >
                            <Users className="mr-2 h-3 w-3" />
                            Accept Order
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Your Orders */}
          <div className="space-y-6">
            <Card className="border-none shadow-soft">
              <CardHeader>
                <CardTitle>Your Orders</CardTitle>
                <CardDescription>Currently assigned deliveries</CardDescription>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                      <Package className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      No active orders
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Accept orders from the available list
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setIsAvailable(true)}
                    >
                      Go Online
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders
                      .filter(
                        (order) =>
                          order.status !== "delivered" &&
                          order.status !== "cancelled"
                      )
                      .slice(0, 3)
                      .map((order) => (
                        <div
                          key={order.id}
                          className="rounded-lg border p-4 hover:bg-accent/50 transition-colors"
                        >
                          <div className="mb-3">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold">
                                Order #{order.id.slice(0, 8)}
                              </h4>
                              <Badge
                                className={cn(
                                  "text-xs",
                                  order.status === "matched"
                                    ? "bg-purple-500/20 text-purple-600"
                                    : order.status === "picked_up"
                                    ? "bg-indigo-500/20 text-indigo-600"
                                    : "bg-green-500/20 text-green-600"
                                )}
                              >
                                {order.status.replace("_", " ")}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {order.pickup_address} → {order.delivery_address}
                            </div>
                          </div>

                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-bold">
                                Rp {order.fee.toLocaleString()}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Earnings
                              </div>
                            </div>

                            <div className="flex space-x-2">
                              {order.status === "matched" && (
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    handleUpdateStatus(order.id, "picked_up")
                                  }
                                >
                                  Pick Up
                                </Button>
                              )}
                              {order.status === "picked_up" && (
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    handleUpdateStatus(order.id, "on_delivery")
                                  }
                                >
                                  Start Delivery
                                </Button>
                              )}
                              {order.status === "on_delivery" && (
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    handleUpdateStatus(order.id, "delivered")
                                  }
                                >
                                  Mark Delivered
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}

                    {orders.filter(
                      (o) => !["delivered", "cancelled"].includes(o.status)
                    ).length > 0 && (
                      <Button
                        variant="ghost"
                        className="w-full"
                        onClick={() => router.push("/courier/active-orders")}
                      >
                        View all active orders
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-none shadow-soft bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Tips for Success</h3>
                    <p className="text-sm text-muted-foreground">
                      Maximize your earnings
                    </p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-primary mr-2" />
                    Stay online during peak hours
                  </li>
                  <li className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-primary mr-2" />
                    Update location regularly
                  </li>
                  <li className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-primary mr-2" />
                    Communicate with customers
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-none shadow-soft">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => router.push("/courier/history")}
                  >
                    <Package className="mr-2 h-4 w-4" />
                    Delivery History
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => router.push("/settings")}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    Earnings Report
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setIsAvailable(!isAvailable)}
                  >
                    <Zap className="mr-2 h-4 w-4" />
                    {isAvailable ? "Go Offline" : "Go Online"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
