export enum PurchaseHistoryStatus {
  PENDING = 'pending', // tạo đơn
  CONFIRMED = 'confirmed', // payment OK
  PROCESSING = 'processing', // đang xử lý
  SHIPPING = 'shipping', // đang giao
  DELIVERED = 'delivered', // đã giao
  CANCELLED = 'cancelled' // hủy đơn
}
