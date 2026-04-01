export interface IPayosPaymentCancelDto {
  id: string;
  orderCode: number;
  amount: number;
  amountPaid: number;
  amountRemaining: number;
  status: string;
  createdAt: string;
  transactions: string[];
  canceledAt: string;
  cancellationReason?: string;
}
