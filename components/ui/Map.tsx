"use client";

import {useEffect, useRef} from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {LatLng} from "@/types";

/* -----------------------------------------------------
   FIX LEAFLET ICONS
----------------------------------------------------- */
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/leaflet/images/marker-icon-2x.png",
  iconUrl: "/leaflet/images/marker-icon.png",
  shadowUrl: "/leaflet/images/marker-shadow.png",
});

/* -----------------------------------------------------
   CUSTOM ICON
----------------------------------------------------- */
const createCustomIcon = (color: string) =>
  L.divIcon({
    html: `
      <div style="
        background: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
        "></div>
      </div>
    `,
    className: "",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

const pickupIcon = createCustomIcon("#3b82f6");
const deliveryIcon = createCustomIcon("#10b981");
const courierIcon = createCustomIcon("#f59e0b");

/* -----------------------------------------------------
   TYPE DEFINITIONS
----------------------------------------------------- */
interface MapProps {
  center: LatLng;
  zoom?: number;
  markers?: Array<{
    position: LatLng;
    title?: string;
    type?: "pickup" | "delivery" | "courier";
    draggable?: boolean;
    onDragEnd?: (position: LatLng) => void;
  }>;
  className?: string;
  showControls?: boolean;

  onMapClick?: (latlng: LatLng) => void; // CLICK SUPPORT
}

/* -----------------------------------------------------
   COMPONENT
----------------------------------------------------- */

export function Map({
  center,
  zoom = 13,
  markers = [],
  className = "",
  showControls = true,
  onMapClick,
}: MapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);

  /* -----------------------------------------------------
     INITIALIZE MAP (ONE TIME)
  ----------------------------------------------------- */
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: showControls,
      scrollWheelZoom: true,
    }).setView([center.lat, center.lng], zoom);

    mapRef.current = map;

    // Tile Layer
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
      }
    ).addTo(map);

    if (showControls) L.control.scale({imperial: false}).addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  /* -----------------------------------------------------
     MAP CLICK HANDLER (DEPENDENT ON onMapClick)
  ----------------------------------------------------- */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!onMapClick) return;

    const clickHandler = (e: L.LeafletMouseEvent) => {
      onMapClick({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      });
    };

    map.on("click", clickHandler);

    return () => {
      map.off("click", clickHandler);
    };
  }, [onMapClick]);

  /* -----------------------------------------------------
     UPDATE MARKERS WHEN "markers" CHANGE
  ----------------------------------------------------- */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    markers.forEach((m) => {
      const icon =
        m.type === "pickup"
          ? pickupIcon
          : m.type === "delivery"
          ? deliveryIcon
          : m.type === "courier"
          ? courierIcon
          : undefined;

      const leafletMarker = L.marker([m.position.lat, m.position.lng], {
        icon,
        draggable: m.draggable ?? false,
        title: m.title,
      }).addTo(map);

      if (m.title) {
        leafletMarker.bindTooltip(m.title, {
          direction: "top",
          offset: [0, -10],
          opacity: 0.9,
        });
      }

      /* SAFE DRAG HANDLER */
      if (m.draggable && typeof m.onDragEnd === "function") {
        leafletMarker.on("dragend", () => {
          const p = leafletMarker.getLatLng();
          m.onDragEnd!({lat: p.lat, lng: p.lng});
        });
      }

      markersRef.current.push(leafletMarker);
    });

    // Auto fit bounds if >1 marker
    if (markers.length > 1) {
      const group = new L.FeatureGroup(markersRef.current);
      map.fitBounds(group.getBounds().pad(0.1));
    }
  }, [markers]);

  /* -----------------------------------------------------
     RENDER
  ----------------------------------------------------- */
  return (
    <div className="relative">
      <div
        ref={mapContainerRef}
        className={`w-full h-96 rounded-xl overflow-hidden ${className}`}
      />
    </div>
  );
}
