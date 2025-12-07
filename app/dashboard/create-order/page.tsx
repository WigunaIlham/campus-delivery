"use client";

import {SetStateAction, useState} from "react";
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
import {Input} from "@/components/ui/Input";
import {Label} from "@/components/ui/Label";
import {Textarea} from "@/components/ui/Textarea";
import Map from "@/components/ui/Map";
import {LatLng, Order} from "@/types";
import {calculateFee} from "@/lib/map/distance";
import {formatCurrency} from "@/lib/utils";
import {
  ArrowLeft,
  Package,
  MapPin,
  Clock,
  DollarSign,
  Check,
  AlertCircle,
} from "lucide-react";
import {cn} from "@/lib/utils";
import Footer from "@/components/ui/Footer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {RadioGroup, RadioGroupItem} from "@/components/ui/RadioGroup";
import {Alert, AlertDescription} from "@/components/ui/Alert";

export default function CreateOrderPage() {
  const [step, setStep] = useState(1);
  const [pickupAddress, setPickupAddress] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [itemWeight, setItemWeight] = useState("1");
  const [itemType, setItemType] = useState("package");
  const [deliveryType, setDeliveryType] = useState("standard");
  const [pickupLocation, setPickupLocation] = useState<LatLng | null>(null);
  const [deliveryLocation, setDeliveryLocation] = useState<LatLng | null>(null);
  const [estimatedFee, setEstimatedFee] = useState<number | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<string>("30-45 minutes");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const {user} = useAuth();
  const router = useRouter();

  const handlePickupLocationSelect = (location: LatLng) => {
    setPickupLocation(location);
    calculateFeeIfBothLocationsSet(location, deliveryLocation);
  };

  const handleDeliveryLocationSelect = (location: LatLng) => {
    setDeliveryLocation(location);
    calculateFeeIfBothLocationsSet(pickupLocation, location);
  };

  const calculateFeeIfBothLocationsSet = (
    pickup: LatLng | null,
    delivery: LatLng | null
  ) => {
    if (pickup && delivery) {
      // Simplified distance calculation (in km)
      const distance =
        Math.sqrt(
          Math.pow(delivery.lat - pickup.lat, 2) +
            Math.pow(delivery.lng - pickup.lng, 2)
        ) * 111; // Convert to approximate kilometers

      const fee = calculateFee(distance, parseFloat(itemWeight), deliveryType);
      setEstimatedFee(fee);

      // Estimate delivery time
      const baseTime = deliveryType === "express" ? 15 : 30;
      const additionalTime = Math.ceil(distance * 5); // 5 minutes per km
      const totalTime = baseTime + additionalTime;
      setEstimatedTime(`${totalTime}-${totalTime + 15} minutes`);
    }
  };

  const handleNextStep = () => {
    if (
      step === 1 &&
      (!pickupAddress || !deliveryAddress || !itemDescription)
    ) {
      setError("Please fill in all required fields");
      return;
    }
    if (step === 2) {
      setError("");
      setStep(step + 1);
      return;
    }
    setStep(step + 1);
    setError("");
  };

  const handlePreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!user) {
      setError("You must be logged in to create an order");
      setLoading(false);
      return;
    }

    if (!pickupLocation || !deliveryLocation) {
      console.log(
        "Missing one or both coordinates. Proceeding with address only."
      );
    }

    try {
      const {data: order, error: orderError} = await supabase
        .from("orders")
        .insert([
          {
            user_id: user.id,
            pickup_address: pickupAddress,
            pickup_coordinates: pickupLocation
              ? [pickupLocation.lat, pickupLocation.lng]
              : null,
            delivery_address: deliveryAddress,
            delivery_coordinates: deliveryLocation
              ? [deliveryLocation.lat, deliveryLocation.lng]
              : null,
            item_description: itemDescription,
            item_type: itemType,
            item_weight: parseFloat(itemWeight),
            delivery_type: deliveryType,
            estimated_distance: estimatedFee ? estimatedFee / 2000 : 0,
            estimated_time: estimatedTime,
            fee: estimatedFee || 0,
            status: "pending",
            payment_status: "unpaid",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      // Call matchmaking API
      await fetch("/api/match", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({orderId: order.id}),
      });

      router.push(`/order/${order.id}/payment`);
    } catch (error: any) {
      setError(error.message || "Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  const markers = [];
  if (pickupLocation) {
    markers.push({
      position: pickupLocation,
      title: "Pickup Location",
      type: "pickup" as const,
      draggable: true,
      onDragEnd: handlePickupLocationSelect,
    });
  }
  if (deliveryLocation) {
    markers.push({
      position: deliveryLocation,
      title: "Delivery Location",
      type: "delivery" as const,
      draggable: true,
      onDragEnd: handleDeliveryLocationSelect,
    });
  }

  const center = pickupLocation || {lat: -6.2, lng: 106.8};

  const steps = [
    {number: 1, title: "Order Details", icon: Package},
    {number: 2, title: "Select Locations", icon: MapPin},
    {number: 3, title: "Review & Pay", icon: Check},
  ];

  const deliveryTypes = [
    {
      id: "standard",
      label: "Standard",
      description: "Delivery within 1-2 hours",
      priceMultiplier: 1,
    },
    {
      id: "express",
      label: "Express",
      description: "Delivery within 30-60 minutes",
      priceMultiplier: 1.5,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <h1 className="text-3xl font-bold">Create New Order</h1>
            <div className="w-24" /> {/* Spacer for alignment */}
          </div>

          <div className="relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-secondary -translate-y-1/2" />
            <div className="relative flex justify-between">
              {steps.map((stepItem, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center relative"
                >
                  <div
                    className={cn(
                      "h-12 w-12 rounded-full border-4 bg-background flex items-center justify-center transition-all duration-300",
                      step > stepItem.number
                        ? "border-primary bg-primary text-primary-foreground"
                        : step === stepItem.number
                        ? "border-primary bg-background text-primary"
                        : "border-secondary bg-background text-muted-foreground"
                    )}
                  >
                    {step > stepItem.number ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <stepItem.icon className="h-5 w-5" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "mt-2 text-sm font-medium",
                      step >= stepItem.number
                        ? "text-primary"
                        : "text-muted-foreground"
                    )}
                  >
                    {stepItem.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Step Content */}
        <div className="max-w-4xl mx-auto">
          {step === 1 && (
            <Card className="border-none shadow-lg animate-in">
              <CardHeader>
                <CardTitle>Order Details</CardTitle>
                <CardDescription>
                  Tell us about what you want to deliver
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="pickupAddress">
                      Pickup Address <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="pickupAddress"
                      placeholder="Where should we pick up your item?"
                      value={pickupAddress}
                      onChange={(e) => setPickupAddress(e.target.value)}
                      className="min-h-[100px]"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deliveryAddress">
                      Delivery Address{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="deliveryAddress"
                      placeholder="Where should we deliver your item?"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="min-h-[100px]"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="itemDescription">
                    Item Description <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="itemDescription"
                    placeholder="Describe your item in detail (food type, packaging, special instructions)"
                    value={itemDescription}
                    onChange={(e) => setItemDescription(e.target.value)}
                    className="min-h-[120px]"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="itemWeight">
                      Estimated Weight (kg){" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="itemWeight"
                      type="number"
                      min="0.1"
                      step="0.1"
                      placeholder="1.0"
                      value={itemWeight}
                      onChange={(e) => {
                        setItemWeight(e.target.value);
                        calculateFeeIfBothLocationsSet(
                          pickupLocation,
                          deliveryLocation
                        );
                      }}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Approximate weight including packaging
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="itemType">Item Type</Label>
                    <Select value={itemType} onValueChange={setItemType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select item type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="package">Package</SelectItem>
                        <SelectItem value="food">Food & Beverage</SelectItem>
                        <SelectItem value="document">Document</SelectItem>
                        <SelectItem value="electronics">Electronics</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Delivery Type</Label>
                    <RadioGroup
                      value={deliveryType}
                      onValueChange={(value: SetStateAction<string>) => {
                        setDeliveryType(value);
                        calculateFeeIfBothLocationsSet(
                          pickupLocation,
                          deliveryLocation
                        );
                      }}
                    >
                      {deliveryTypes.map((type) => (
                        <div
                          key={type.id}
                          className="flex items-center space-x-2"
                        >
                          <RadioGroupItem value={type.id} id={type.id} />
                          <Label
                            htmlFor={type.id}
                            className="flex-1 cursor-pointer"
                          >
                            <div className="font-medium">{type.label}</div>
                            <div className="text-xs text-muted-foreground">
                              {type.description}
                            </div>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card className="border-none shadow-lg animate-in">
              <CardHeader>
                <CardTitle>Select Locations</CardTitle>
                <CardDescription>
                  Click on the map to set pickup and delivery locations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="h-[400px] rounded-xl overflow-hidden border">
                  <Map
                    center={center}
                    markers={markers}
                    zoom={13}
                    onMapClick={(latlng) => {
                      if (!pickupLocation) {
                        handlePickupLocationSelect(latlng);
                      } else if (!deliveryLocation) {
                        handleDeliveryLocationSelect(latlng);
                      }
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="h-3 w-3 rounded-full bg-blue-500" />
                      <Label>Pickup Location</Label>
                    </div>
                    {pickupLocation ? (
                      <div className="rounded-lg border p-3 bg-blue-50/50">
                        <p className="text-sm">
                          Lat: {pickupLocation.lat.toFixed(6)}, Lng:{" "}
                          {pickupLocation.lng.toFixed(6)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Drag the blue marker to adjust
                        </p>
                      </div>
                    ) : (
                      <div className="rounded-lg border border-dashed p-6 text-center">
                        <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Click on the map to set pickup location
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="h-3 w-3 rounded-full bg-green-500" />
                      <Label>Delivery Location</Label>
                    </div>
                    {deliveryLocation ? (
                      <div className="rounded-lg border p-3 bg-green-50/50">
                        <p className="text-sm">
                          Lat: {deliveryLocation.lat.toFixed(6)}, Lng:{" "}
                          {deliveryLocation.lng.toFixed(6)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Drag the green marker to adjust
                        </p>
                      </div>
                    ) : (
                      <div className="rounded-lg border border-dashed p-6 text-center">
                        <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Click on the map to set delivery location
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {estimatedFee && (
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-5 w-5 text-primary" />
                        <span className="font-semibold">Estimated Fee</span>
                      </div>
                      <div className="text-2xl font-bold text-primary">
                        {formatCurrency(estimatedFee)}
                      </div>
                    </div>
                    <div className="flex items-center mt-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>Estimated delivery time: {estimatedTime}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card className="border-none shadow-lg animate-in">
              <CardHeader>
                <CardTitle>Review Order</CardTitle>
                <CardDescription>
                  Confirm your order details before payment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-lg flex items-center">
                        <Package className="h-5 w-5 mr-2" />
                        Order Summary
                      </h4>
                      <Card>
                        <CardContent className="p-4 space-y-3">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Item Type
                            </span>
                            <span className="font-medium capitalize">
                              {itemType}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Description
                            </span>
                            <span className="font-medium text-right max-w-xs">
                              {itemDescription}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Weight
                            </span>
                            <span className="font-medium">{itemWeight} kg</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Delivery Type
                            </span>
                            <span className="font-medium capitalize">
                              {deliveryType}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold text-lg flex items-center">
                        <MapPin className="h-5 w-5 mr-2" />
                        Delivery Route
                      </h4>
                      <Card>
                        <CardContent className="p-4 space-y-4">
                          <div className="flex items-start">
                            <div className="h-3 w-3 rounded-full bg-blue-500 mt-1.5 mr-3 flex-shrink-0" />
                            <div className="flex-1">
                              <div className="font-medium">Pickup Location</div>
                              <div className="text-muted-foreground text-sm mt-1">
                                {pickupAddress}
                              </div>
                              {pickupLocation && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  Coordinates: {pickupLocation.lat.toFixed(4)},{" "}
                                  {pickupLocation.lng.toFixed(4)}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-start">
                            <div className="h-3 w-3 rounded-full bg-green-500 mt-1.5 mr-3 flex-shrink-0" />
                            <div className="flex-1">
                              <div className="font-medium">
                                Delivery Location
                              </div>
                              <div className="text-muted-foreground text-sm mt-1">
                                {deliveryAddress}
                              </div>
                              {deliveryLocation && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  Coordinates: {deliveryLocation.lat.toFixed(4)}
                                  , {deliveryLocation.lng.toFixed(4)}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <div>
                    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 sticky top-24">
                      <CardHeader>
                        <CardTitle>Price Breakdown</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Base Fee
                            </span>
                            <span>Rp 10,000</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Distance Charge
                            </span>
                            <span>
                              Rp{" "}
                              {estimatedFee
                                ? (estimatedFee - 10000).toLocaleString()
                                : "0"}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Weight Charge ({itemWeight} kg)
                            </span>
                            <span>
                              Rp{" "}
                              {Math.round(
                                parseFloat(itemWeight) * 2000
                              ).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Service Fee
                            </span>
                            <span>Rp 2,000</span>
                          </div>
                          {deliveryType === "express" && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                Express Delivery
                              </span>
                              <span>Rp 5,000</span>
                            </div>
                          )}
                          <div className="border-t pt-3 mt-2">
                            <div className="flex justify-between font-bold text-lg">
                              <span>Total</span>
                              <span className="text-primary">
                                {estimatedFee
                                  ? formatCurrency(estimatedFee)
                                  : "Rp 0"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 pt-4 border-t">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="h-4 w-4 mr-2" />
                            <span>Estimated delivery: {estimatedTime}</span>
                          </div>
                          <Alert className="bg-blue-50 border-blue-200">
                            <AlertDescription className="text-sm">
                              Payment will be processed after delivery
                              confirmation
                            </AlertDescription>
                          </Alert>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handlePreviousStep}
              disabled={step === 1 || loading}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>

            {step < 3 ? (
              <Button onClick={handleNextStep} className="gap-2">
                Next Step
                <ArrowLeft className="h-4 w-4 rotate-180" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="gap-2"
              >
                {loading ? "Processing..." : "Confirm & Continue to Payment"}
                <Check className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
