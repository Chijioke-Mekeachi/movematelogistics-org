import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  Loader2, 
  CheckCircle, 
  Copy, 
  Download, 
  User,
  MapPin,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { addDays, addHours, format } from 'date-fns';
import { supabase } from '@/lib/supabaseClient';

const categories = [
  { value: 'documents', label: 'Documents' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'clothing', label: 'Clothing & Apparel' },
  { value: 'food', label: 'Food & Perishables' },
  { value: 'fragile', label: 'Fragile Items' },
  { value: 'other', label: 'Other' },
];

// Function to generate tracking ID in format MM-LX-XXXXX
const generateTrackingId = () => {
  const timestamp = Date.now();
  const randomNum = Math.floor(10000 + Math.random() * 90000); // 5-digit random number
  return `MM-LX-${randomNum}`;
};

// Timeline creation function
const createDefaultTimeline = (now: Date, pickupLocation: string, deliveryLocation: string) => {
  return [
    {
      id: "1",
      status: "Order Received",
      location: "Processing Center",
      completed: true,
      timestamp: now.toISOString(),
      description: "Your shipment request has been received and is being processed."
    },
    {
      id: "2",
      status: "Picked Up",
      location: pickupLocation,
      completed: false,
      timestamp: addHours(now, 4).toISOString(),
      description: "Package will be picked up from the sender."
    },
    {
      id: "3",
      status: "In Transit",
      location: "Regional Distribution Center",
      completed: false,
      timestamp: addDays(now, 1).toISOString(),
      description: "Your package will be on its way to the destination."
    },
    {
      id: "4",
      status: "Out for Delivery",
      location: deliveryLocation,
      completed: false,
      timestamp: addDays(now, 2).toISOString(),
      description: "Package will be out for delivery to the recipient."
    },
    {
      id: "5",
      status: "Delivered",
      location: deliveryLocation,
      completed: false,
      timestamp: addDays(now, 3).toISOString(),
      description: "Package will be delivered to the recipient."
    }
  ];
};

const RequestTracking: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdShipment, setCreatedShipment] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState({
    senderName: '',
    senderPhone: '',
    receiverName: '',
    receiverPhone: '',
    pickupLocation: '',
    deliveryLocation: '',
    packageDescription: '',
    weight: '',
    category: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const requiredFields = [
      'senderName', 'senderPhone', 'receiverName', 'receiverPhone',
      'pickupLocation', 'deliveryLocation', 'packageDescription', 'weight', 'category'
    ];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const trackingId = generateTrackingId(); // Using MM-LX-XXXXX format
      const now = new Date();

      const baseDays = formData.category === 'documents' ? 2 : 
                       formData.category === 'fragile' ? 5 : 3;
      const weightFactor = Math.ceil(parseFloat(formData.weight) / 10);
      const deliveryDays = baseDays + weightFactor + Math.floor(Math.random() * 2);
      const deliveryHour = 9 + Math.floor(Math.random() * 9); 
      const estimatedDelivery = addHours(addDays(now, deliveryDays), deliveryHour - now.getHours());

      // Create timeline
      const timeline = createDefaultTimeline(now, formData.pickupLocation, formData.deliveryLocation);
      
      // Update the last timeline item's timestamp to match estimated delivery
      timeline[timeline.length - 1].timestamp = estimatedDelivery.toISOString();

      const { data, error } = await supabase.from('shipments').insert({
        tracking_id: trackingId,
        sender_name: formData.senderName,
        sender_phone: formData.senderPhone,
        receiver_name: formData.receiverName,
        receiver_phone: formData.receiverPhone,
        pickup_location: formData.pickupLocation,
        delivery_location: formData.deliveryLocation,
        package_description: formData.packageDescription,
        weight: parseFloat(formData.weight),
        category: formData.category,
        status: 'pending',
        current_location: 'Processing Center',
        estimated_delivery: estimatedDelivery.toISOString(),
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
        timeline: timeline,
      }).select().single();

      if (error || !data) throw error || new Error('Failed to create shipment');

      setCreatedShipment(data);
      setStep('success');
      toast.success('Shipment created successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create shipment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyTrackingId = async () => {
    if (!createdShipment) return;
    await navigator.clipboard.writeText(createdShipment.tracking_id);
    setCopied(true);
    toast.success('Tracking ID copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadReceipt = () => {
    if (!createdShipment) return;
    
    const receipt = `
MOVEMATE LOGISTICEXPRESS
========================
SHIPMENT RECEIPT

Tracking ID: ${createdShipment.tracking_id}
Date: ${format(new Date(createdShipment.created_at), 'PPP')}

SENDER DETAILS
--------------
Name: ${createdShipment.sender_name}
Phone: ${createdShipment.sender_phone}
Pickup: ${createdShipment.pickup_location}

RECEIVER DETAILS
----------------
Name: ${createdShipment.receiver_name}
Phone: ${createdShipment.receiver_phone}
Delivery: ${createdShipment.delivery_location}

PACKAGE DETAILS
---------------
Description: ${createdShipment.package_description}
Weight: ${createdShipment.weight} kg
Category: ${createdShipment.category}

ESTIMATED DELIVERY
------------------
${format(new Date(createdShipment.estimated_delivery), 'PPPP')}

Track your shipment at: movemate.com/track?id=${createdShipment.tracking_id}

Thank you for choosing Movemate LogisticExpress!
    `;

    const blob = new Blob([receipt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `movemate-receipt-${createdShipment.tracking_id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Receipt downloaded!');
  };

  // Success Step UI
  if (step === 'success' && createdShipment) {
    return (
      <Layout>
        <section className="py-16 bg-background">
          <div className="container max-w-2xl">
            <div className="bg-card rounded-3xl border border-border p-8 lg:p-12 text-center animate-scale-in">
              <div className="relative w-20 h-20 mx-auto mb-8">
                <div className="absolute inset-0 bg-success/20 rounded-full animate-pulse" />
                <div className="relative w-full h-full bg-success rounded-full flex items-center justify-center">
                  <CheckCircle className="h-10 w-10 text-success-foreground" />
                </div>
              </div>

              <h1 className="text-2xl lg:text-3xl font-bold mb-2">Shipment Created!</h1>
              <p className="text-muted-foreground mb-8">
                Your tracking ID has been generated. Use it to track your shipment status.
              </p>

              <div className="bg-muted rounded-2xl p-6 mb-8">
                <p className="text-sm text-muted-foreground mb-2">Your Tracking ID</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-3xl lg:text-4xl font-mono font-bold text-accent">
                    {createdShipment.tracking_id}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyTrackingId}
                    className="shrink-0"
                  >
                    {copied ? (
                      <CheckCircle className="h-5 w-5 text-success" />
                    ) : (
                      <Copy className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="bg-muted rounded-2xl p-6 mb-8 inline-block">
                <div className="bg-white p-3 rounded-lg mx-auto mb-3">
                  <QRCodeSVG 
                    value={`${window.location.origin}/track?id=${createdShipment.tracking_id}`}
                    size={128}
                    level="H"
                    includeMargin={false}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Scan to track your shipment</p>
              </div>

              <div className="bg-muted/50 rounded-xl p-4 mb-8 text-left">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">From</p>
                    <p className="font-medium">{createdShipment.pickup_location}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">To</p>
                    <p className="font-medium">{createdShipment.delivery_location}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Est. Delivery</p>
                    <p className="font-medium">
                      {format(new Date(createdShipment.estimated_delivery), 'MMM d, yyyy')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      by {format(new Date(createdShipment.estimated_delivery), 'h:mm a')}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Weight</p>
                    <p className="font-medium">{createdShipment.weight} kg</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={downloadReceipt} variant="outline" className="gap-2">
                  <Download className="h-5 w-5" />
                  Download Receipt
                </Button>
                <Button 
                  onClick={() => navigate(`/track?id=${createdShipment.tracking_id}`)}
                  className="btn-gradient-accent gap-2"
                >
                  <Package className="h-5 w-5" />
                  Track Shipment
                </Button>
              </div>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container max-w-3xl text-center">
          <Package className="h-12 w-12 text-accent mx-auto mb-4" />
          <h1 className="text-3xl lg:text-4xl font-bold mb-4">
            Request Tracking ID
          </h1>
          <p className="text-primary-foreground/70">
            Fill in your shipment details to generate a unique tracking ID for your package.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="py-12">
        <div className="container max-w-3xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Sender Details */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <User className="h-5 w-5 text-accent" />
                Sender Details
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="senderName">Full Name *</Label>
                  <Input
                    id="senderName"
                    value={formData.senderName}
                    onChange={(e) => setFormData(prev => ({ ...prev, senderName: e.target.value }))}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="senderPhone">Phone Number *</Label>
                  <Input
                    id="senderPhone"
                    value={formData.senderPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, senderPhone: e.target.value }))}
                    placeholder="+1 (555) 000-0000"
                    required
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="pickupLocation">Pickup Address *</Label>
                  <Input
                    id="pickupLocation"
                    value={formData.pickupLocation}
                    onChange={(e) => setFormData(prev => ({ ...prev, pickupLocation: e.target.value }))}
                    placeholder="123 Main St, New York, NY 10001"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Receiver Details */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-accent" />
                Receiver Details
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="receiverName">Full Name *</Label>
                  <Input
                    id="receiverName"
                    value={formData.receiverName}
                    onChange={(e) => setFormData(prev => ({ ...prev, receiverName: e.target.value }))}
                    placeholder="Jane Smith"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="receiverPhone">Phone Number *</Label>
                  <Input
                    id="receiverPhone"
                    value={formData.receiverPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, receiverPhone: e.target.value }))}
                    placeholder="+1 (555) 000-0000"
                    required
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="deliveryLocation">Delivery Address *</Label>
                  <Input
                    id="deliveryLocation"
                    value={formData.deliveryLocation}
                    onChange={(e) => setFormData(prev => ({ ...prev, deliveryLocation: e.target.value }))}
                    placeholder="456 Oak Ave, Los Angeles, CA 90001"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Package Details */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <Package className="h-5 w-5 text-accent" />
                Package Details
              </h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="packageDescription">Package Description *</Label>
                  <Textarea
                    id="packageDescription"
                    value={formData.packageDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, packageDescription: e.target.value }))}
                    placeholder="Describe your package contents..."
                    rows={3}
                    required
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg) *</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={formData.weight}
                      onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                      placeholder="2.5"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit */}
            <Button 
              type="submit" 
              className="w-full h-14 text-base btn-gradient-accent"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Creating Shipment...
                </>
              ) : (
                <>
                  <Package className="h-5 w-5 mr-2" />
                  Generate Tracking ID
                </>
              )}
            </Button>
          </form>
        </div>
      </section>
    </Layout>
  );
};

export default RequestTracking;