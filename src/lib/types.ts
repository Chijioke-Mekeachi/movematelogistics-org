export type ShipmentStatus =
  | 'pending'
  | 'picked_up'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered';

export interface Shipment {
  id: string;
  trackingId: string;
  packageDescription: string;
  senderName: string;
  receiverName: string;
  pickupLocation: string;
  deliveryLocation: string;
  currentLocation: string;
  status: ShipmentStatus;
  estimatedDelivery: string | null;
  createdAt: string;
  updatedAt: string;
}
