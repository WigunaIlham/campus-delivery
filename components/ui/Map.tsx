"use client";

import React, {useEffect, useRef} from "react";
import L from "leaflet";

type MapProps = {
  center: {lat: number; lng: number};
  zoom?: number;
  markers?: any[];
  onMapClick?: ({lat, lng}: {lat: number; lng: number}) => void;
};

function Map({center, zoom = 15, markers = [], onMapClick}: MapProps) {
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map("map-container").setView(
        [center.lat, center.lng],
        zoom
      );

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(mapRef.current);
    }

    return () => {
      mapRef.current?.remove();
    };
  }, []);

  return <div id="map-container" className="w-full h-64 rounded-lg" />;
}

export default Map;
