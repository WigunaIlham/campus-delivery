"use client";

import {useEffect, useState} from "react";
import {Map} from "@/components/ui/Map";
import {supabase} from "@/lib/supabase/client";
import {LatLng} from "@/types";

interface CourierMapProps {
  orderId: string;
  courierId?: string;
}

export function CourierMap({orderId, courierId}: CourierMapProps) {
  const [courierLocation, setCourierLocation] = useState<LatLng | null>(null);
  const [orderLocation, setOrderLocation] = useState<LatLng | null>(null);

  useEffect(() => {
    const fetchLocations = async () => {
      const {data: order} = await supabase
        .from("orders")
        .select("delivery_coordinates")
        .eq("id", orderId)
        .single();

      if (order?.delivery_coordinates) {
        setOrderLocation({
          lat: order.delivery_coordinates[0],
          lng: order.delivery_coordinates[1],
        });
      }

      const courierToFetch = courierId || (await getCourierId(orderId));
      if (courierToFetch) {
        const {data: location} = await supabase
          .from("courier_locations")
          .select("coordinates")
          .eq("courier_id", courierToFetch)
          .single();

        if (location?.coordinates) {
          setCourierLocation({
            lat: location.coordinates[0],
            lng: location.coordinates[1],
          });
        }
      }
    };

    fetchLocations();

    const channel = supabase
      .channel(`courier-location-${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "courier_locations",
        },
        async (payload) => {
          const order = await supabase
            .from("orders")
            .select("courier_id")
            .eq("id", orderId)
            .single();

          if (order.data?.courier_id === payload.new.courier_id) {
            setCourierLocation({
              lat: payload.new.coordinates[0],
              lng: payload.new.coordinates[1],
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, courierId]);

  const getCourierId = async (orderId: string) => {
    const {data: order} = await supabase
      .from("orders")
      .select("courier_id")
      .eq("id", orderId)
      .single();

    return order?.courier_id;
  };

  const markers = [];
  if (orderLocation) {
    markers.push({
      position: orderLocation,
      title: "Delivery Location",
    });
  }
  if (courierLocation) {
    markers.push({
      position: courierLocation,
      title: "Courier Location",
    });
  }

  const center = courierLocation || orderLocation || {lat: -6.2, lng: 106.8};

  return (
    <Map
      center={center}
      markers={markers}
      zoom={orderLocation && courierLocation ? 12 : 13}
      className="w-full h-96"
    />
  );
}
