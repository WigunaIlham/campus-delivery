import midtransClient from "midtrans-client";

export const createMidtransClient = () => {
  return new midtransClient.Snap({
    isProduction: process.env.NODE_ENV === "production",
    serverKey: process.env.MIDTRANS_SERVER_KEY!,
    clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!,
  });
};

export interface MidtransTransactionParams {
  order_id: string;
  gross_amount: number;
  customer_details: {
    first_name: string;
    last_name?: string;
    email: string;
    phone: string;
  };
}

// Type untuk response
export interface MidtransTransactionResponse {
  token: string;
  redirect_url: string;
}
