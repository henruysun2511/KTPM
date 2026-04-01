export interface IPayosRequestPaymentItem {
  name: string;
  quantity: number;
  price: number;
}

export interface IPayosRequestPaymentPayload {
  orderCode: number;
  description: string;
  amount: number;
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  buyerAddress?: string;
  items?: IPayosRequestPaymentItem[];
  cancelUrl: string;
  returnUrl: string;
  expiredAt?: number;
  signature: string;
}
