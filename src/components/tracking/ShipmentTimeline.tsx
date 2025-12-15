import React from 'react';
import { Check, Circle, Package, Truck, MapPin, Home } from 'lucide-react';
import { TimelineEvent } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface ShipmentTimelineProps {
  events: TimelineEvent[];
}

const statusIcons: Record<string, React.ElementType> = {
  'Order Received': Package,
  'Picked Up': Package,
  'In Transit': Truck,
  'Out for Delivery': MapPin,
  'Delivered': Home,
};

const ShipmentTimeline: React.FC<ShipmentTimelineProps> = ({ events }) => {
  return (
    <div className="relative">
      {events.map((event, index) => {
        const Icon = statusIcons[event.status] || Circle;
        const isLast = index === events.length - 1;
        const isCompleted = event.completed;
        const isCurrent = isCompleted && !events[index + 1]?.completed;

        return (
          <div
            key={event.id}
            className={cn(
              "relative flex gap-4 pb-8 last:pb-0",
              "animate-fade-in"
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Timeline Line */}
            {!isLast && (
              <div
                className={cn(
                  "absolute left-[19px] top-10 w-0.5 h-[calc(100%-24px)]",
                  isCompleted ? "bg-accent" : "bg-border"
                )}
              />
            )}

            {/* Icon */}
            <div
              className={cn(
                "relative z-10 flex items-center justify-center w-10 h-10 rounded-full shrink-0 transition-all duration-300",
                isCompleted
                  ? "bg-accent text-accent-foreground shadow-glow"
                  : "bg-muted text-muted-foreground",
                isCurrent && "ring-4 ring-accent/20 animate-pulse-ring"
              )}
            >
              {isCompleted ? (
                <Check className="h-5 w-5" />
              ) : (
                <Icon className="h-5 w-5" />
              )}
            </div>

            {/* Content */}
            <div className={cn(
              "flex-1 pt-1",
              !isCompleted && "opacity-50"
            )}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <h4 className={cn(
                  "font-semibold",
                  isCurrent && "text-accent"
                )}>
                  {event.status}
                </h4>
                <time className="text-sm text-muted-foreground">
                  {format(new Date(event.timestamp), 'MMM d, yyyy • h:mm a')}
                </time>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {event.location}
              </p>
              <p className="text-sm mt-2">
                {event.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ShipmentTimeline;
