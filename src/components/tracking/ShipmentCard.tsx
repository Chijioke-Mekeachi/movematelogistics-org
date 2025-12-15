import React from 'react';
import { Package, MapPin, Calendar, Clock, Copy, Check } from 'lucide-react';
import { Shipment } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface ShipmentCardProps {
  shipment: Shipment;
}

const statusLabels: Record<Shipment['status'], string> = {
  pending: 'Pending',
  picked_up: 'Picked Up',
  in_transit: 'In Transit',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
};

const statusStyles: Record<Shipment['status'], string> = {
  pending: 'status-pending',
  picked_up: 'status-transit',
  in_transit: 'status-transit',
  out_for_delivery: 'status-transit',
  delivered: 'status-delivered',
};

/**
 * ✅ SAFE DATE PARSER
 * Prevents: RangeError: Invalid time value
 */
const safeDate = (value?: string) => {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
};

const ShipmentCard: React.FC<ShipmentCardProps> = ({ shipment }) => {
  const [copied, setCopied] = React.useState(false);

  const copyTrackingId = async () => {
    await navigator.clipboard.writeText(shipment.trackingId);
    setCopied(true);
    toast.success('Tracking ID copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const progress = {
    pending: 10,
    picked_up: 25,
    in_transit: 50,
    out_for_delivery: 75,
    delivered: 100,
  }[shipment.status];

  const estimatedDate = safeDate(shipment.estimatedDelivery);
  const isDelivered = shipment.status === 'delivered';

  const timeRemaining =
    isDelivered
      ? 'Delivered'
      : estimatedDate
      ? formatDistanceToNow(estimatedDate, { addSuffix: true })
      : '—';

  return (
    <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/10 rounded-lg">
              <Package className="h-6 w-6 text-accent" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-semibold text-lg">
                  {shipment.trackingId}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={copyTrackingId}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-accent" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                {shipment.packageDescription}
              </p>
            </div>
          </div>
          <span className={cn('status-badge', statusStyles[shipment.status])}>
            <span className="w-2 h-2 rounded-full bg-current" />
            {statusLabels[shipment.status]}
          </span>
        </div>
      </div>

      {/* Progress */}
      <div className="px-6 py-4 bg-muted/30">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground">Shipment Progress</span>
          <span className="font-medium">{progress}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Details */}
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-1.5 bg-muted rounded">
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">From</p>
              <p className="font-medium">{shipment.pickupLocation}</p>
              <p className="text-sm text-muted-foreground">{shipment.senderName}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-1.5 bg-accent/10 rounded">
              <MapPin className="h-4 w-4 text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">To</p>
              <p className="font-medium">{shipment.deliveryLocation}</p>
              <p className="text-sm text-muted-foreground">{shipment.receiverName}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-1.5 bg-muted rounded">
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                {isDelivered ? 'Delivered On' : 'Estimated Delivery'}
              </p>
              <p className="font-medium">
                {estimatedDate
                  ? format(estimatedDate, 'EEEE, MMM d, yyyy')
                  : '—'}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-1.5 bg-muted rounded">
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Time Remaining
              </p>
              <p
                className={cn(
                  'font-medium',
                  isDelivered ? 'text-accent' : 'text-foreground'
                )}
              >
                {timeRemaining}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Current Location */}
      <div className="px-6 py-4 bg-accent/5 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
          <span className="text-sm">
            <span className="text-muted-foreground">Current Location: </span>
            <span className="font-medium">{shipment.currentLocation}</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default ShipmentCard;
