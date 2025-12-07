import {LatLng, DistanceMatrixResult} from "@/types";

export const calculateDistance = (point1: LatLng, point2: LatLng): number => {
  const R = 6371;
  const dLat = ((point2.lat - point1.lat) * Math.PI) / 180;
  const dLon = ((point2.lng - point1.lng) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((point1.lat * Math.PI) / 180) *
      Math.cos((point2.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const calculateFee = (
  distance: number,
  weight: number = 1,
  deliveryType: string = "standard"
): number => {
  const baseFee = 10000;
  const distanceFee = distance * 2000;
  const weightFee = weight * 1000;
  const typeFee = deliveryType === "express" ? 5000 : 0;

  return Math.round(baseFee + distanceFee + weightFee + typeFee);
};

export const getDistanceMatrix = async (
  origin: LatLng,
  destination: LatLng,
  weight: number = 1,
  deliveryType: string = "standard"
): Promise<DistanceMatrixResult> => {
  const distance = calculateDistance(origin, destination);
  const fee = calculateFee(distance, weight, deliveryType);

  return {
    distance,
    duration: Math.round(distance * 10),
    fee,
  };
};
