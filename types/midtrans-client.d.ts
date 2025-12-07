declare module "midtrans-client" {
  export interface SnapOptions {
    isProduction: boolean;
    serverKey: string;
    clientKey: string;
  }

  export interface TransactionParams {
    transaction_details: {
      order_id: string;
      gross_amount: number;
    };
    customer_details?: {
      first_name?: string;
      last_name?: string;
      email?: string;
      phone?: string;
      billing_address?: any;
      shipping_address?: any;
    };
    credit_card?: {
      secure?: boolean;
      save_card?: boolean;
      channel?: string;
      bank?: string;
      installment?: any;
      whitelist_bins?: string[];
      dynamic_descriptor?: string;
    };
    item_details?: Array<{
      id?: string;
      price: number;
      quantity: number;
      name: string;
      brand?: string;
      category?: string;
      merchant_name?: string;
    }>;
    expiry?: {
      unit: string;
      duration: number;
    };
    custom_field1?: string;
    custom_field2?: string;
    custom_field3?: string;
  }

  export interface TransactionResult {
    token: string;
    redirect_url: string;
  }

  export class Snap {
    constructor(options: SnapOptions);
    createTransaction(parameter: TransactionParams): Promise<TransactionResult>;
    createTransactionToken(parameter: TransactionParams): Promise<string>;
    createTransactionRedirectUrl(parameter: TransactionParams): Promise<string>;
  }

  export class CoreApi {
    constructor(options: SnapOptions);
    charge(parameter: any): Promise<any>;
    capture(parameter: any): Promise<any>;
    cardRegister(parameter: any): Promise<any>;
    cardToken(parameter: any): Promise<any>;
    cardPointInquiry(token: string): Promise<any>;
  }

  export interface IrisOptions {
    isProduction: boolean;
    serverKey: string;
  }

  export class Iris {
    constructor(options: IrisOptions);
    createBeneficiaries(parameter: any): Promise<any>;
    updateBeneficiaries(aliasName: string, parameter: any): Promise<any>;
    getBeneficiaries(): Promise<any>;
    createPayouts(parameter: any): Promise<any>;
    approvePayouts(parameter: any): Promise<any>;
    rejectPayouts(parameter: any): Promise<any>;
    getPayoutDetails(referenceNo: string): Promise<any>;
    getTransactionHistory(parameter?: any): Promise<any>;
    getTopupChannels(): Promise<any>;
    getBalance(): Promise<any>;
    getFacilitatorBankAccounts(): Promise<any>;
    getBeneficiaryBanks(): Promise<any>;
    validateBankAccount(parameter: any): Promise<any>;
  }
}
