import React, { useEffect, useState } from 'react';
import { Truck, MapPin, Package, Home } from 'lucide-react';
import { Shipment } from '@/lib/mockData';
import { cn } from '@/lib/utils';

interface MapSimulationProps {
  shipment: Shipment;
}

const MapSimulation: React.FC<MapSimulationProps> = ({ shipment }) => {
  const [truckPosition, setTruckPosition] = useState(0);

  // Get progress based on status
  const statusProgress = {
    pending: 5,
    picked_up: 20,
    in_transit: 50,
    out_for_delivery: 80,
    delivered: 100,
  }[shipment.status];

  useEffect(() => {
    // Animate truck to current position
    const timer = setTimeout(() => {
      setTruckPosition(statusProgress);
    }, 500);

    return () => clearTimeout(timer);
  }, [statusProgress]);

  const isDelivered = shipment.status === 'delivered';

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      {/* Map Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold">Live Tracking</h3>
        <div className="flex items-center gap-2 text-sm">
          <span className={cn(
            "w-2 h-2 rounded-full",
            isDelivered ? "bg-accent" : "bg-accent animate-pulse"
          )} />
          <span className="text-muted-foreground">
            {isDelivered ? 'Delivered' : 'In Transit'}
          </span>
        </div>
      </div>

      {/* Map Visualization */}
      <div className="relative bg-gradient-to-br from-muted/50 to-muted p-8">
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Route Visualization */}
        <div className="relative">
          {/* Route Line */}
          <div className="relative h-32 flex items-center">
            {/* Background Route */}
            <div className="absolute inset-x-0 top-1/2 h-1 bg-border rounded-full" />
            
            {/* Completed Route */}
            <div 
              className="absolute left-0 top-1/2 h-1 bg-accent rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${truckPosition}%` }}
            />

            {/* Start Point */}
            <div className="absolute left-0 -translate-x-1/2 flex flex-col items-center">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg">
                <Package className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="mt-2 text-xs font-medium whitespace-nowrap">
                Origin
              </span>
            </div>

            {/* Waypoints */}
            <div className="absolute left-1/4 -translate-x-1/2 flex flex-col items-center">
              <div className={cn(
                "w-6 h-6 rounded-full border-2 transition-colors",
                truckPosition >= 25 
                  ? "bg-accent border-accent" 
                  : "bg-background border-border"
              )}>
                {truckPosition >= 25 && (
                  <span className="block w-full h-full" />
                )}
              </div>
              <span className="mt-2 text-xs text-muted-foreground">Hub A</span>
            </div>

            <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
              <div className={cn(
                "w-6 h-6 rounded-full border-2 transition-colors",
                truckPosition >= 50 
                  ? "bg-accent border-accent" 
                  : "bg-background border-border"
              )}>
                {truckPosition >= 50 && (
                  <span className="block w-full h-full" />
                )}
              </div>
              <span className="mt-2 text-xs text-muted-foreground">Hub B</span>
            </div>

            <div className="absolute left-3/4 -translate-x-1/2 flex flex-col items-center">
              <div className={cn(
                "w-6 h-6 rounded-full border-2 transition-colors",
                truckPosition >= 75 
                  ? "bg-accent border-accent" 
                  : "bg-background border-border"
              )}>
                {truckPosition >= 75 && (
                  <span className="block w-full h-full" />
                )}
              </div>
              <span className="mt-2 text-xs text-muted-foreground">Hub C</span>
            </div>

            {/* Truck */}
            {!isDelivered && (
              <div 
                className="absolute top-1/2 -translate-y-1/2 transition-all duration-1000 ease-out"
                style={{ left: `${truckPosition}%`, transform: `translateX(-50%) translateY(-50%)` }}
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-accent/30 blur-xl rounded-full scale-150 animate-pulse" />
                  <div className="relative w-10 h-10 bg-accent rounded-full flex items-center justify-center shadow-lg animate-marker-bounce">
                    <Truck className="h-5 w-5 text-accent-foreground" />
                  </div>
                </div>
              </div>
            )}

            {/* End Point */}
            <div className="absolute right-0 translate-x-1/2 flex flex-col items-center">
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-colors",
                isDelivered ? "bg-accent" : "bg-muted"
              )}>
                <Home className={cn(
                  "h-6 w-6",
                  isDelivered ? "text-accent-foreground" : "text-muted-foreground"
                )} />
              </div>
              <span className="mt-2 text-xs font-medium whitespace-nowrap">
                Destination
              </span>
            </div>
          </div>
        </div>

        {/* Route Info */}
        <div className="mt-8 flex justify-between text-sm">
          <div>
            <p className="text-muted-foreground">From</p>
            <p className="font-medium">{shipment.pickupLocation}</p>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground">To</p>
            <p className="font-medium">{shipment.deliveryLocation}</p>
          </div>
        </div>
      </div>

      {/* Map Footer */}
      <div className="p-4 bg-muted/30 text-center text-sm text-muted-foreground">
        <MapPin className="h-4 w-4 inline mr-1" />
        Current: {shipment.currentLocation}
      </div>
    </div>
  );
};

export default MapSimulation;
