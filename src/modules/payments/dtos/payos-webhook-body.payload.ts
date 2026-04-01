export interface IPayosWebhookData {
  accountNumber: string;
  amount: number;
  description: string;
  reference: string;
  transactionDateTime: string;
  virtualAccountNumber: string;
  counterAccountBankId: string;
  counterAccountBankName: string;
  counterAccountName: string;
  counterAccountNumber: string;
  virtualAccountName: string;
  currency: string;
  orderCode: number;
  paymentLinkId: string;
  code: string;
  desc: string;
}

export interface IPayosWebhookBodyPayload {
  code: string;
  desc: string;
  success: boolean;
  data: IPayosWebhookData;
  signature: string;
}
