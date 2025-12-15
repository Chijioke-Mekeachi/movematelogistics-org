import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import ShipmentCard from '@/components/tracking/ShipmentCard';
import { supabase } from '@/lib/supabaseClient';
import { Shipment } from '@/lib/types';
import { Search } from 'lucide-react';
import { toast } from 'sonner';

const TrackShipment: React.FC = () => {
  const [trackingId, setTrackingId] = useState('');
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTrack = async () => {
    if (!trackingId.trim()) {
      toast.error('Please enter a tracking ID');
      return;
    }

    setLoading(true);
    setShipment(null);

    const { data, error } = await supabase
      .from('shipments')
      .select('*')
      .eq('tracking_id', trackingId.trim())
      .single();

    if (error || !data) {
      toast.error('Shipment not found');
    } else {
      setShipment({
        id: data.id,
        trackingId: data.tracking_id,
        packageDescription: data.package_description,
        senderName: data.sender_name,
        receiverName: data.receiver_name,
        pickupLocation: data.pickup_location,
        deliveryLocation: data.delivery_location,
        currentLocation: data.current_location,
        status: data.status,
        estimatedDelivery: data.estimated_delivery,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      });
    }

    setLoading(false);
  };

  return (
    <Layout>
      <section className="py-12">
        <div className="container max-w-3xl space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Track Your Shipment</h1>
            <p className="text-muted-foreground">
              Enter your tracking number to see live shipment status
            </p>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Enter tracking ID"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
            />
            <Button onClick={handleTrack} disabled={loading} className="gap-2">
              <Search className="h-4 w-4" />
              {loading ? 'Searching...' : 'Track'}
            </Button>
          </div>

          {shipment && <ShipmentCard shipment={shipment} />}
        </div>
      </section>
    </Layout>
  );
};

export default TrackShipment;
