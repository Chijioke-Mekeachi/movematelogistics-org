import React, { useState, useEffect } from 'react';
import {
  Package,
  TrendingUp,
  Clock,
  CheckCircle,
  Truck,
  AlertCircle,
  BarChart3,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Shipment {
  id: string;
  tracking_id: string;
  sender_name: string;
  receiver_name: string;
  pickup_location: string;
  delivery_location: string;
  package_description: string;
  weight: number;
  category: string;
  status: 'pending' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered';
  current_location: string;
  estimated_delivery: string;
  timeline: any[];
  created_at: string;
  updated_at: string;
}

const AnalyticsDashboard: React.FC = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchShipments = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('shipments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setShipments(data || []);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (error: any) {
      console.error('Error fetching shipments:', error);
      toast.error('Failed to load shipment data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  // Calculate statistics
  const stats = React.useMemo(() => {
    const total = shipments.length;
    const delivered = shipments.filter((s) => s.status === 'delivered').length;
    const inTransit = shipments.filter((s) => ['in_transit', 'out_for_delivery'].includes(s.status)).length;
    const pending = shipments.filter((s) => s.status === 'pending').length;
    const pickedUp = shipments.filter((s) => s.status === 'picked_up').length;

    return {
      total,
      delivered,
      inTransit,
      pending,
      pickedUp,
      deliveryRate: total > 0 ? ((delivered / total) * 100).toFixed(1) : '0',
    };
  }, [shipments]);

  // Status distribution for pie chart
  const statusDistribution = React.useMemo(() => {
    return [
      { name: 'Delivered', value: stats.delivered, color: 'hsl(160, 84%, 39%)' },
      { name: 'In Transit', value: stats.inTransit, color: 'hsl(200, 98%, 39%)' },
      { name: 'Pending', value: stats.pending, color: 'hsl(38, 92%, 50%)' },
      { name: 'Picked Up', value: stats.pickedUp, color: 'hsl(215, 50%, 50%)' },
    ].filter((item) => item.value > 0);
  }, [stats]);

  // Weekly trend data (based on actual shipments)
  const weeklyTrend = React.useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date();
    const dayOfWeek = today.getDay();
    
    return days.map((day, index) => {
      // Calculate date for each day of this week
      const date = new Date(today);
      date.setDate(today.getDate() - (dayOfWeek - index));
      date.setHours(0, 0, 0, 0);
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);
      
      // Count shipments created on that day
      const dayShipments = shipments.filter(s => {
        const created = new Date(s.created_at);
        return created >= date && created < nextDay;
      });
      
      const deliveredCount = dayShipments.filter(s => s.status === 'delivered').length;
      
      return {
        day,
        shipments: dayShipments.length,
        delivered: deliveredCount,
      };
    });
  }, [shipments]);

  // Category distribution
  const categoryDistribution = React.useMemo(() => {
    const categories: Record<string, number> = {};
    shipments.forEach((s) => {
      categories[s.category] = (categories[s.category] || 0) + 1;
    });
    return Object.entries(categories).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' '),
      value,
    }));
  }, [shipments]);

  // Average delivery time
  const averageDeliveryTime = React.useMemo(() => {
    const deliveredShipments = shipments.filter(s => s.status === 'delivered');
    if (deliveredShipments.length === 0) return 'N/A';
    
    const totalDays = deliveredShipments.reduce((acc, shipment) => {
      const created = new Date(shipment.created_at);
      const estimated = new Date(shipment.estimated_delivery);
      const diffTime = Math.abs(estimated.getTime() - created.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return acc + diffDays;
    }, 0);
    
    return (totalDays / deliveredShipments.length).toFixed(1);
  }, [shipments]);

  // On-time delivery rate
  const onTimeDeliveryRate = React.useMemo(() => {
    const deliveredShipments = shipments.filter(s => s.status === 'delivered');
    if (deliveredShipments.length === 0) return '0';
    
    const onTime = deliveredShipments.filter(shipment => {
      const estimated = new Date(shipment.estimated_delivery);
      const updated = new Date(shipment.updated_at);
      return updated <= estimated;
    }).length;
    
    return ((onTime / deliveredShipments.length) * 100).toFixed(1);
  }, [shipments]);

  const statCards = [
    {
      label: 'Total Shipments',
      value: stats.total,
      icon: Package,
      color: 'bg-primary/10 text-primary',
      trend: '+12%',
    },
    {
      label: 'Delivered',
      value: stats.delivered,
      icon: CheckCircle,
      color: 'bg-success/10 text-success',
      trend: '+8%',
    },
    {
      label: 'In Transit',
      value: stats.inTransit,
      icon: Truck,
      color: 'bg-info/10 text-info',
      trend: '+5%',
    },
    {
      label: 'Pending',
      value: stats.pending,
      icon: Clock,
      color: 'bg-warning/10 text-warning',
      trend: '-3%',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with refresh */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Last updated: {lastUpdated}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchShipments}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={cn('p-2 rounded-lg', stat.color)}>
                <stat.icon className="h-5 w-5" />
              </div>
              <span className={cn(
                'text-xs font-medium px-2 py-1 rounded-full',
                stat.trend.startsWith('+') ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
              )}>
                {stat.trend}
              </span>
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Status Distribution Pie Chart */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-accent" />
            Status Distribution
          </h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">Delivery Rate</p>
            <p className="text-3xl font-bold text-accent">{stats.deliveryRate}%</p>
          </div>
        </div>

        {/* Weekly Trend Line Chart */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-accent" />
            Weekly Trend
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="shipments"
                  stroke="hsl(215, 50%, 50%)"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(215, 50%, 50%)' }}
                  name="Total Shipments"
                />
                <Line
                  type="monotone"
                  dataKey="delivered"
                  stroke="hsl(160, 84%, 39%)"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(160, 84%, 39%)' }}
                  name="Delivered"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Category Bar Chart */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Package className="h-5 w-5 text-accent" />
          Shipments by Category
        </h3>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="value" fill="hsl(160, 84%, 39%)" radius={[4, 4, 0, 0]} name="Shipments" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Insights */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-success/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">On-Time Delivery</p>
              <p className="text-xl font-bold">{onTimeDeliveryRate}%</p>
            </div>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-success rounded-full" style={{ width: `${onTimeDeliveryRate}%` }} />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-info/10 rounded-lg">
              <Clock className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg. Delivery Time</p>
              <p className="text-xl font-bold">{averageDeliveryTime} days</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Based on delivered shipments</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-warning/10 rounded-lg">
              <AlertCircle className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Shipments</p>
              <p className="text-xl font-bold">
                {shipments.filter(s => !['delivered', 'cancelled'].includes(s.status)).length}
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Currently in progress</p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;