import {Order} from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import {Button} from "@/components/ui/Button";
import {Badge} from "@/components/ui/Badge";
import {Progress} from "@/components/ui/Progress";
import {
  Package,
  MapPin,
  Clock,
  DollarSign,
  ArrowRight,
  CheckCircle,
  Truck,
  User,
} from "lucide-react";
import {formatCurrency, formatDate} from "@/lib/utils";
import {cn} from "@/lib/utils";

interface OrderCardProps {
  order: Order;
  variant?: "default" | "compact";
  onViewDetails?: () => void;
  onTrack?: () => void;
  onPay?: () => void;
}

export function OrderCard({
  order,
  variant = "default",
  onViewDetails,
  onTrack,
  onPay,
}: OrderCardProps) {
  const getStatusConfig = (status: Order["status"]) => {
    const configs = {
      pending: {
        color: "bg-yellow-500/20 text-yellow-600",
        icon: Clock,
        label: "Pending",
        progress: 0,
      },
      waiting_payment: {
        color: "bg-orange-500/20 text-orange-600",
        icon: DollarSign,
        label: "Waiting Payment",
        progress: 20,
      },
      searching_courier: {
        color: "bg-blue-500/20 text-blue-600",
        icon: User,
        label: "Searching Courier",
        progress: 40,
      },
      matched: {
        color: "bg-purple-500/20 text-purple-600",
        icon: User,
        label: "Courier Assigned",
        progress: 60,
      },
      picked_up: {
        color: "bg-indigo-500/20 text-indigo-600",
        icon: Package,
        label: "Picked Up",
        progress: 80,
      },
      on_delivery: {
        color: "bg-green-500/20 text-green-600",
        icon: Truck,
        label: "On Delivery",
        progress: 90,
      },
      delivered: {
        color: "bg-emerald-500/20 text-emerald-600",
        icon: CheckCircle,
        label: "Delivered",
        progress: 100,
      },
      cancelled: {
        color: "bg-red-500/20 text-red-600",
        icon: Clock,
        label: "Cancelled",
        progress: 0,
      },
    };
    return configs[status] || configs.pending;
  };

  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;

  if (variant === "compact") {
    return (
      <Card className="border-none shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1 group cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className={cn(
                  "h-10 w-10 rounded-lg flex items-center justify-center",
                  statusConfig.color
                )}
              >
                <StatusIcon className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">
                  Order #{order.id.slice(0, 8)}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {formatDate(order.created_at)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold">{formatCurrency(order.fee)}</div>
              <Badge className={cn("text-xs mt-1", statusConfig.color)}>
                {statusConfig.label}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className={cn(
                "h-12 w-12 rounded-xl flex items-center justify-center",
                statusConfig.color
              )}
            >
              <StatusIcon className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-lg">
                Order #{order.id.slice(0, 8)}
              </CardTitle>
              <CardDescription>{formatDate(order.created_at)}</CardDescription>
            </div>
          </div>
          <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center text-sm text-muted-foreground mb-1">
              <MapPin className="h-3 w-3 mr-1" />
              Pickup
            </div>
            <p className="text-sm font-medium truncate">
              {order.pickup_address}
            </p>
          </div>
          <div>
            <div className="flex items-center text-sm text-muted-foreground mb-1">
              <MapPin className="h-3 w-3 mr-1" />
              Delivery
            </div>
            <p className="text-sm font-medium truncate">
              {order.delivery_address}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{statusConfig.progress}%</span>
          </div>
          <Progress value={statusConfig.progress} />
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-4">
            <div>
              <div className="text-sm text-muted-foreground">Item</div>
              <div className="font-medium text-sm">
                {order.item_description || "Food Delivery"}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Weight</div>
              <div className="font-medium text-sm">
                {order.item_weight || 1} kg
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Total</div>
            <div className="text-xl font-bold text-primary">
              {formatCurrency(order.fee)}
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-3">
        <div className="flex w-full justify-end space-x-2">
          {onViewDetails && (
            <Button
              variant="outline"
              size="sm"
              onClick={onViewDetails}
              className="group"
            >
              Details
              <ArrowRight className="ml-2 h-3 w-3 transition-transform group-hover:translate-x-1" />
            </Button>
          )}
          {onTrack &&
            order.status !== "pending" &&
            order.status !== "cancelled" && (
              <Button variant="secondary" size="sm" onClick={onTrack}>
                <Truck className="mr-2 h-3 w-3" />
                Track
              </Button>
            )}
          {onPay && order.payment_status === "unpaid" && (
            <Button variant="default" size="sm" onClick={onPay}>
              <DollarSign className="mr-2 h-3 w-3" />
              Pay Now
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
