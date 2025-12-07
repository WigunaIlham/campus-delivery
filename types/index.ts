export type UserRole = "mahasiswa" | "kurir" | "admin";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  courier_id: string | null;
  pickup_address: string;
  pickup_coordinates: [number, number] | null;
  delivery_address: string;
  delivery_coordinates: [number, number] | null;
  item_description: string | null;
  item_weight: number | null;
  estimated_distance: number | null;
  fee: number;
  status:
    | "pending"
    | "waiting_payment"
    | "searching_courier"
    | "matched"
    | "picked_up"
    | "on_delivery"
    | "delivered"
    | "cancelled";
  payment_status: "unpaid" | "pending" | "paid" | "failed" | "expired";
  payment_token: string | null;
  midtrans_order_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CourierLocation {
  id: string;
  courier_id: string;
  coordinates: [number, number];
  is_available: boolean;
  last_updated: string;
}

export interface OrderTracking {
  id: string;
  order_id: string;
  status: string;
  location: [number, number] | null;
  notes: string | null;
  created_at: string;
}

export interface LatLng {
  lat: number;
  lng: number;
}

export interface DistanceMatrixResult {
  distance: number;
  duration: number;
  fee: number;
}
