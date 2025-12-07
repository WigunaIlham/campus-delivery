import {Order} from "@/types";

const statusSteps = [
  {key: "pending" as const, label: "Pending", description: "Order created"},
  {
    key: "waiting_payment" as const,
    label: "Payment",
    description: "Waiting for payment",
  },
  {
    key: "searching_courier" as const,
    label: "Searching",
    description: "Looking for courier",
  },
  {key: "matched" as const, label: "Matched", description: "Courier assigned"},
  {
    key: "picked_up" as const,
    label: "Picked Up",
    description: "Item collected",
  },
  {
    key: "on_delivery" as const,
    label: "On Delivery",
    description: "On the way",
  },
  {
    key: "delivered" as const,
    label: "Delivered",
    description: "Order completed",
  },
];

interface OrderStatusProps {
  order: Order;
}

export function OrderStatus({order}: OrderStatusProps) {
  const currentStepIndex = statusSteps.findIndex(
    (step) => step.key === order.status
  );

  return (
    <div className="w-full">
      <div className="flex justify-between mb-2">
        {statusSteps.map((step, index) => (
          <div
            key={step.key}
            className={`flex flex-col items-center text-center ${
              index <= currentStepIndex ? "text-blue-600" : "text-gray-400"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                index <= currentStepIndex
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200"
              }`}
            >
              {index + 1}
            </div>
            <span className="text-xs font-medium">{step.label}</span>
          </div>
        ))}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{
            width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%`,
          }}
        />
      </div>
      <p className="text-center mt-4 text-gray-600">
        Current status: {statusSteps[currentStepIndex]?.description}
      </p>
    </div>
  );
}
