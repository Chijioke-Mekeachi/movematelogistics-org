import React, { useState } from 'react';
import { Search, Package, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface TrackingInputProps {
  onTrack: (trackingId: string) => void;
  isLoading?: boolean;
  variant?: 'default' | 'hero';
  placeholder?: string;
}

const TrackingInput: React.FC<TrackingInputProps> = ({
  onTrack,
  isLoading = false,
  variant = 'default',
  placeholder = 'Enter tracking ID (e.g., MM-LX-92F8A)',
}) => {
  const [trackingId, setTrackingId] = useState('');
  const [error, setError] = useState('');

  const validateTrackingId = (id: string): boolean => {
    // Format: MM-LX-XXXXX (5 alphanumeric characters)
    const pattern = /^MM-LX-[A-Z0-9]{5}$/i;
    return pattern.test(id.trim());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedId = trackingId.trim().toUpperCase();
    
    if (!trimmedId) {
      setError('Please enter a tracking ID');
      return;
    }

    if (!validateTrackingId(trimmedId)) {
      setError('Invalid tracking ID format. Use MM-LX-XXXXX');
      return;
    }

    onTrack(trimmedId);
  };

  const isHero = variant === 'hero';

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div
        className={cn(
          "flex flex-col sm:flex-row gap-3",
          isHero && "glass-card p-2 rounded-2xl"
        )}
      >
        <div className="relative flex-1">
          <Package className={cn(
            "absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5",
            isHero ? "text-accent" : "text-muted-foreground"
          )} />
          <Input
            type="text"
            value={trackingId}
            onChange={(e) => {
              setTrackingId(e.target.value.toUpperCase());
              setError('');
            }}
            placeholder={placeholder}
            className={cn(
              "pl-12 h-14 text-base font-mono",
              isHero && "bg-background/80 border-0 focus-visible:ring-accent",
              error && "border-destructive focus-visible:ring-destructive"
            )}
            disabled={isLoading}
          />
        </div>
        <Button
          type="submit"
          disabled={isLoading}
          className={cn(
            "h-14 px-8 text-base font-semibold",
            isHero ? "btn-gradient-accent min-w-[160px]" : "btn-gradient"
          )}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Tracking...
            </>
          ) : (
            <>
              <Search className="h-5 w-5 mr-2" />
              Track
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>
      {error && (
        <p className="mt-2 text-sm text-destructive animate-fade-in">
          {error}
        </p>
      )}
    </form>
  );
};

export default TrackingInput;
