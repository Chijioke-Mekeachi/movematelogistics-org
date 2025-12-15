import React, { useState, useEffect } from 'react';
import {
  Package,
  Search,
  Filter,
  Edit,
  MapPin,
  Calendar,
  Truck,
  CheckCircle,
  Clock,
  ArrowUpDown,
  MoreHorizontal,
  RefreshCw,
  Trash2,
  Eye,
  Download,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { format, formatDistanceToNow, addDays } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabaseClient';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

interface Shipment {
  id: string;
  tracking_id: string;
  sender_name: string;
  sender_phone: string;
  receiver_name: string;
  receiver_phone: string;
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

const statusOptions: { value: Shipment['status']; label: string; icon: React.ElementType }[] = [
  { value: 'pending', label: 'Pending', icon: Clock },
  { value: 'picked_up', label: 'Picked Up', icon: Package },
  { value: 'in_transit', label: 'In Transit', icon: Truck },
  { value: 'out_for_delivery', label: 'Out for Delivery', icon: MapPin },
  { value: 'delivered', label: 'Delivered', icon: CheckCircle },
];

const statusStyles: Record<Shipment['status'], string> = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  picked_up: 'bg-info/10 text-info border-info/20',
  in_transit: 'bg-info/10 text-info border-info/20',
  out_for_delivery: 'bg-accent/10 text-accent border-accent/20',
  delivered: 'bg-success/10 text-success border-success/20',
};

const categories = [
  'documents',
  'electronics',
  'clothing',
  'food',
  'fragile',
  'other'
];

const ShipmentManagement: React.FC = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [filteredShipments, setFilteredShipments] = useState<Shipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewingShipment, setViewingShipment] = useState<Shipment | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Shipment; direction: 'asc' | 'desc' } | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Edit form state
  const [editForm, setEditForm] = useState({
    status: '' as Shipment['status'],
    currentLocation: '',
    estimatedDelivery: '',
    weight: '',
    category: '',
    timeline: [] as any[],
  });

  useEffect(() => {
    loadShipments();
  }, []);

  useEffect(() => {
    filterShipments();
  }, [shipments, searchQuery, statusFilter, categoryFilter, sortConfig]);

  const loadShipments = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('shipments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setShipments(data || []);
    } catch (error: any) {
      console.error('Error loading shipments:', error);
      toast.error('Failed to load shipments');
    } finally {
      setIsLoading(false);
    }
  };

  const filterShipments = () => {
    let result = [...shipments];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.tracking_id.toLowerCase().includes(query) ||
          s.sender_name.toLowerCase().includes(query) ||
          s.receiver_name.toLowerCase().includes(query) ||
          s.pickup_location.toLowerCase().includes(query) ||
          s.delivery_location.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((s) => s.status === statusFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      result = result.filter((s) => s.category === categoryFilter);
    }

    // Sorting
    if (sortConfig) {
      result.sort((a, b) => {
        let aValue: any = a[sortConfig.key];
        let bValue: any = b[sortConfig.key];
        
        // Handle date comparisons
        if (sortConfig.key === 'estimated_delivery' || sortConfig.key === 'created_at' || sortConfig.key === 'updated_at') {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        }
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    setFilteredShipments(result);
  };

  const handleSort = (key: keyof Shipment) => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        return prev.direction === 'asc' ? { key, direction: 'desc' } : null;
      }
      return { key, direction: 'asc' };
    });
  };

  const toggleRowExpand = (shipmentId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(shipmentId)) {
      newExpanded.delete(shipmentId);
    } else {
      newExpanded.add(shipmentId);
    }
    setExpandedRows(newExpanded);
  };

  const openEditDialog = (shipment: Shipment) => {
    setEditingShipment(shipment);
    setEditForm({
      status: shipment.status,
      currentLocation: shipment.current_location,
      estimatedDelivery: shipment.estimated_delivery.split('T')[0],
      weight: shipment.weight.toString(),
      category: shipment.category,
      timeline: shipment.timeline || [],
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (shipment: Shipment) => {
    setViewingShipment(shipment);
    setIsViewDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingShipment) return;

    setIsSaving(true);
    try {
      // Update timeline based on new status
      const updatedTimeline = updateTimelineForStatus(
        editForm.timeline || editingShipment.timeline,
        editForm.status,
        editingShipment.created_at
      );

      const { error } = await supabase
        .from('shipments')
        .update({
          status: editForm.status,
          current_location: editForm.currentLocation,
          estimated_delivery: new Date(editForm.estimatedDelivery).toISOString(),
          weight: parseFloat(editForm.weight),
          category: editForm.category,
          timeline: updatedTimeline,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingShipment.id);

      if (error) throw error;

      // Update local state
      await loadShipments();
      setIsEditDialogOpen(false);
      toast.success(`Shipment ${editingShipment.tracking_id} updated successfully`);
    } catch (error: any) {
      toast.error('Failed to update shipment');
    } finally {
      setIsSaving(false);
    }
  };

  const updateTimelineForStatus = (timeline: any[], newStatus: Shipment['status'], createdAt: string) => {
    const now = new Date().toISOString();
    const statusMap: Record<Shipment['status'], string> = {
      pending: 'Order Received',
      picked_up: 'Picked Up',
      in_transit: 'In Transit',
      out_for_delivery: 'Out for Delivery',
      delivered: 'Delivered',
    };

    // Find the timeline item for this status
    const timelineCopy = [...timeline];
    const statusItem = timelineCopy.find(item => item.status === statusMap[newStatus]);
    
    if (statusItem && !statusItem.completed) {
      statusItem.completed = true;
      statusItem.timestamp = now;
      statusItem.description = getStatusDescription(newStatus);
    }

    return timelineCopy;
  };

  const getStatusDescription = (status: Shipment['status']) => {
    switch (status) {
      case 'pending':
        return 'Your shipment request has been received and is being processed.';
      case 'picked_up':
        return 'Package has been picked up from the sender.';
      case 'in_transit':
        return 'Your package is on its way to the destination.';
      case 'out_for_delivery':
        return 'Package is out for delivery to the recipient.';
      case 'delivered':
        return 'Package has been successfully delivered.';
      default:
        return 'Status updated.';
    }
  };

  const handleDeleteShipment = async (shipment: Shipment) => {
    if (!confirm(`Are you sure you want to delete shipment ${shipment.tracking_id}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('shipments')
        .delete()
        .eq('id', shipment.id);

      if (error) throw error;

      // Update local state
      setShipments(prev => prev.filter(s => s.id !== shipment.id));
      toast.success(`Shipment ${shipment.tracking_id} deleted successfully`);
    } catch (error: any) {
      toast.error('Failed to delete shipment');
    }
  };

  const handleMarkDelivered = async (shipment: Shipment) => {
    try {
      const updatedTimeline = updateTimelineForStatus(
        shipment.timeline,
        'delivered',
        shipment.created_at
      );

      const { error } = await supabase
        .from('shipments')
        .update({
          status: 'delivered',
          current_location: 'Delivered',
          timeline: updatedTimeline,
          updated_at: new Date().toISOString(),
        })
        .eq('id', shipment.id);

      if (error) throw error;

      // Update local state
      await loadShipments();
      toast.success(`Shipment ${shipment.tracking_id} marked as delivered`);
    } catch (error: any) {
      toast.error('Failed to update shipment');
    }
  };

  const handleExportCSV = () => {
    if (filteredShipments.length === 0) {
      toast.error('No data to export');
      return;
    }

    const headers = [
      'Tracking ID',
      'Sender',
      'Receiver',
      'Pickup',
      'Delivery',
      'Status',
      'Current Location',
      'Estimated Delivery',
      'Weight',
      'Category',
      'Created Date'
    ];

    const csvData = filteredShipments.map(shipment => [
      shipment.tracking_id,
      shipment.sender_name,
      shipment.receiver_name,
      shipment.pickup_location,
      shipment.delivery_location,
      shipment.status,
      shipment.current_location,
      format(new Date(shipment.estimated_delivery), 'yyyy-MM-dd'),
      shipment.weight,
      shipment.category,
      format(new Date(shipment.created_at), 'yyyy-MM-dd')
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shipments-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Export completed');
  };

  const handleAddTimelineEvent = () => {
    if (!editingShipment) return;

    const newEvent = {
      id: `custom-${Date.now()}`,
      status: 'Custom Update',
      location: editForm.currentLocation,
      completed: true,
      timestamp: new Date().toISOString(),
      description: 'Manual status update by admin',
    };

    setEditForm(prev => ({
      ...prev,
      timeline: [...prev.timeline, newEvent]
    }));
  };

  const getSortIcon = (key: keyof Shipment) => {
    if (sortConfig?.key === key) {
      return sortConfig.direction === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />;
    }
    return <ArrowUpDown className="h-3 w-3" />;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-muted rounded animate-pulse" />
        <div className="h-64 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex-1 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by tracking ID, name, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statusOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <Package className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV} className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={loadShipments} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-10">
                {/* Expand/collapse all */}
              </TableHead>
              <TableHead 
                className="cursor-pointer" 
                onClick={() => handleSort('tracking_id')}
              >
                <div className="flex items-center gap-1">
                  Tracking ID
                  {getSortIcon('tracking_id')}
                </div>
              </TableHead>
              <TableHead>Sender / Receiver</TableHead>
              <TableHead>Route</TableHead>
              <TableHead 
                className="cursor-pointer" 
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center gap-1">
                  Status
                  {getSortIcon('status')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer" 
                onClick={() => handleSort('estimated_delivery')}
              >
                <div className="flex items-center gap-1">
                  ETA
                  {getSortIcon('estimated_delivery')}
                </div>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredShipments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground">No shipments found</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredShipments.map((shipment) => (
                <React.Fragment key={shipment.id}>
                  <TableRow className="hover:bg-muted/30">
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => toggleRowExpand(shipment.id)}
                      >
                        {expandedRows.has(shipment.id) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="font-mono font-semibold text-sm">
                        {shipment.tracking_id}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {shipment.weight} kg • {shipment.category}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{shipment.sender_name}</div>
                      <div className="text-xs text-muted-foreground">→ {shipment.receiver_name}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs">
                        <div className="truncate max-w-[150px]" title={shipment.pickup_location}>
                          {shipment.pickup_location.split(',')[0]}
                        </div>
                        <div className="text-muted-foreground truncate max-w-[150px]" title={shipment.delivery_location}>
                          → {shipment.delivery_location.split(',')[0]}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn('text-xs', statusStyles[shipment.status])}>
                        {statusOptions.find((s) => s.value === shipment.status)?.label}
                      </Badge>
                      <div className="text-xs text-muted-foreground mt-1">
                        {shipment.current_location}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {format(new Date(shipment.estimated_delivery), 'MMM d, yyyy')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(shipment.estimated_delivery), { addSuffix: true })}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openViewDialog(shipment)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEditDialog(shipment)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Shipment
                          </DropdownMenuItem>
                          {shipment.status !== 'delivered' && (
                            <DropdownMenuItem onClick={() => handleMarkDelivered(shipment)}>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Mark Delivered
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteShipment(shipment)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                  {expandedRows.has(shipment.id) && (
                    <TableRow>
                      <TableCell colSpan={8} className="bg-muted/30">
                        <div className="p-4 space-y-3">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground">Sender Phone</p>
                              <p className="text-sm">{shipment.sender_phone}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Receiver Phone</p>
                              <p className="text-sm">{shipment.receiver_phone}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Package</p>
                              <p className="text-sm">{shipment.package_description}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Created</p>
                              <p className="text-sm">
                                {format(new Date(shipment.created_at), 'MMM d, yyyy')}
                              </p>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-2">Timeline</p>
                            <div className="space-y-2">
                              {(shipment.timeline || []).slice(0, 3).map((event: any) => (
                                <div key={event.id} className="flex items-center gap-2 text-sm">
                                  <div className={cn(
                                    'w-2 h-2 rounded-full',
                                    event.completed ? 'bg-success' : 'bg-muted'
                                  )} />
                                  <span className="font-medium">{event.status}</span>
                                  <span className="text-muted-foreground text-xs">
                                    {format(new Date(event.timestamp), 'MMM d, HH:mm')}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Results count */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Showing {filteredShipments.length} of {shipments.length} shipments
        </p>
        <div className="text-sm text-muted-foreground">
          Last updated: {format(new Date(), 'HH:mm:ss')}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit Shipment
            </DialogTitle>
          </DialogHeader>
          
          {editingShipment && (
            <div className="space-y-4 py-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-mono font-semibold">{editingShipment.tracking_id}</p>
                <p className="text-sm text-muted-foreground">
                  {editingShipment.sender_name} → {editingShipment.receiver_name}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={editForm.status}
                    onValueChange={(v) => setEditForm(prev => ({ ...prev, status: v as Shipment['status'] }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <div className="flex items-center gap-2">
                            <opt.icon className="h-4 w-4" />
                            {opt.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={editForm.category}
                    onValueChange={(v) => setEditForm(prev => ({ ...prev, category: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Current Location</Label>
                  <Input
                    value={editForm.currentLocation}
                    onChange={(e) => setEditForm(prev => ({ ...prev, currentLocation: e.target.value }))}
                    placeholder="e.g., Distribution Center, Phoenix AZ"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Weight (kg)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={editForm.weight}
                    onChange={(e) => setEditForm(prev => ({ ...prev, weight: e.target.value }))}
                    placeholder="2.5"
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label>Estimated Delivery</Label>
                  <Input
                    type="date"
                    value={editForm.estimatedDelivery}
                    onChange={(e) => setEditForm(prev => ({ ...prev, estimatedDelivery: e.target.value }))}
                  />
                </div>
              </div>

              {/* Timeline Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Timeline</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddTimelineEvent}
                  >
                    Add Event
                  </Button>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto p-2 border rounded">
                  {(editForm.timeline || []).map((event: any, index: number) => (
                    <div key={index} className="flex items-center gap-3 p-2 bg-muted/30 rounded">
                      <div className={cn(
                        'w-2 h-2 rounded-full',
                        event.completed ? 'bg-success' : 'bg-muted'
                      )} />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{event.status}</p>
                        <p className="text-xs text-muted-foreground">{event.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(event.timestamp), 'MMM d, yyyy HH:mm')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={isSaving} className="btn-gradient-accent">
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Shipment Details</DialogTitle>
          </DialogHeader>
          
          {viewingShipment && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Tracking ID</p>
                  <p className="font-mono font-semibold">{viewingShipment.tracking_id}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant="outline" className={statusStyles[viewingShipment.status]}>
                    {statusOptions.find((s) => s.value === viewingShipment.status)?.label}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Weight</p>
                  <p className="font-medium">{viewingShipment.weight} kg</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-medium">{viewingShipment.category}</p>
                </div>
              </div>

              {/* Sender & Receiver */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold">Sender Information</h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p>{viewingShipment.sender_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p>{viewingShipment.sender_phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Pickup Location</p>
                      <p>{viewingShipment.pickup_location}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Receiver Information</h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p>{viewingShipment.receiver_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p>{viewingShipment.receiver_phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Delivery Location</p>
                      <p>{viewingShipment.delivery_location}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Package Details */}
              <div className="space-y-3">
                <h4 className="font-semibold">Package Details</h4>
                <div className="p-3 bg-muted rounded-lg">
                  <p>{viewingShipment.package_description}</p>
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-3">
                <h4 className="font-semibold">Shipment Timeline</h4>
                <div className="space-y-4">
                  {(viewingShipment.timeline || []).map((event: any, index: number) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="relative">
                        <div className={cn(
                          'w-4 h-4 rounded-full mt-1',
                          event.completed ? 'bg-success' : 'bg-muted'
                        )} />
                        {index < (viewingShipment.timeline || []).length - 1 && (
                          <div className="absolute left-2 top-5 w-0.5 h-12 bg-border" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex justify-between">
                          <p className="font-medium">{event.status}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(event.timestamp), 'MMM d, yyyy HH:mm')}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                        <p className="text-sm text-muted-foreground mt-1">{event.location}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p>{format(new Date(viewingShipment.created_at), 'PPP')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estimated Delivery</p>
                  <p>{format(new Date(viewingShipment.estimated_delivery), 'PPP')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p>{format(new Date(viewingShipment.updated_at), 'PPP')}</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ShipmentManagement;