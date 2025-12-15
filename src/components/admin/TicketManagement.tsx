import React, { useState, useEffect } from 'react';
import {
  Ticket,
  Search,
  Filter,
  MessageSquare,
  CheckCircle,
  Clock,
  AlertCircle,
  Send,
  User,
  Mail,
  Calendar,
  RefreshCw,
  Trash2,
  Plus,
  Tag,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabaseClient';

interface TicketResponse {
  id: string;
  message: string;
  isAdmin: boolean;
  timestamp: string;
}

interface TicketType {
  id: string;
  ticket_id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  category: string;
  status: 'open' | 'in_progress' | 'resolved';
  responses: TicketResponse[];
  created_at: string;
  updated_at: string;
}

const statusOptions = [
  { value: 'open', label: 'Open', icon: AlertCircle, color: 'bg-destructive/10 text-destructive' },
  { value: 'in_progress', label: 'In Progress', icon: Clock, color: 'bg-warning/10 text-warning' },
  { value: 'resolved', label: 'Resolved', icon: CheckCircle, color: 'bg-success/10 text-success' },
];

const categories = [
  'shipment_issue',
  'delivery_delay',
  'damage_claim',
  'billing',
  'account',
  'general',
  'feedback',
  'other'
];

const categoryLabels: Record<string, string> = {
  shipment_issue: 'Shipment Issue',
  delivery_delay: 'Delivery Delay',
  damage_claim: 'Damage Claim',
  billing: 'Billing',
  account: 'Account',
  general: 'General Inquiry',
  feedback: 'Feedback',
  other: 'Other'
};

const TicketManagement: React.FC = () => {
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<TicketType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isNewTicketDialogOpen, setIsNewTicketDialogOpen] = useState(false);
  const [newTicketForm, setNewTicketForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: 'general',
  });

  useEffect(() => {
    loadTickets();
  }, []);

  useEffect(() => {
    filterTickets();
  }, [tickets, searchQuery, statusFilter, categoryFilter]);

  const loadTickets = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Parse responses JSON if it's stored as string
      const parsedTickets = (data || []).map(ticket => ({
        ...ticket,
        responses: typeof ticket.responses === 'string' 
          ? JSON.parse(ticket.responses) 
          : ticket.responses
      }));

      setTickets(parsedTickets);
    } catch (error: any) {
      console.error('Error loading tickets:', error);
      toast.error('Failed to load tickets');
    } finally {
      setIsLoading(false);
    }
  };

  const filterTickets = () => {
    let result = [...tickets];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.ticket_id.toLowerCase().includes(query) ||
          t.name.toLowerCase().includes(query) ||
          t.subject.toLowerCase().includes(query) ||
          t.email.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter((t) => t.status === statusFilter);
    }

    if (categoryFilter !== 'all') {
      result = result.filter((t) => t.category === categoryFilter);
    }

    // Sort by most recent
    result.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

    setFilteredTickets(result);
  };

  const handleStatusChange = async (ticketId: string, newStatus: TicketType['status']) => {
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId);

      if (error) throw error;

      // Update local state
      const updatedTickets = tickets.map((t) => {
        if (t.id === ticketId) {
          return { ...t, status: newStatus, updated_at: new Date().toISOString() };
        }
        return t;
      });

      setTickets(updatedTickets);
      
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status: newStatus });
      }

      toast.success(`Ticket status updated to ${newStatus.replace('_', ' ')}`);
    } catch (error: any) {
      toast.error('Failed to update ticket status');
    }
  };

  const handleSendReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) return;

    setIsSending(true);

    try {
      const newResponse: TicketResponse = {
        id: Date.now().toString(),
        message: replyMessage,
        isAdmin: true,
        timestamp: new Date().toISOString(),
      };

      const updatedResponses = [...selectedTicket.responses, newResponse];
      
      const { error } = await supabase
        .from('tickets')
        .update({ 
          responses: updatedResponses,
          status: selectedTicket.status === 'open' ? 'in_progress' : selectedTicket.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedTicket.id);

      if (error) throw error;

      // Update local state
      const updatedTickets = tickets.map((t) => {
        if (t.id === selectedTicket.id) {
          return {
            ...t,
            responses: updatedResponses,
            status: t.status === 'open' ? 'in_progress' as const : t.status,
            updated_at: new Date().toISOString(),
          };
        }
        return t;
      });

      setTickets(updatedTickets);
      setSelectedTicket({
        ...selectedTicket,
        responses: updatedResponses,
      });
      setReplyMessage('');
      toast.success('Reply sent successfully');
    } catch (error: any) {
      toast.error('Failed to send reply');
    } finally {
      setIsSending(false);
    }
  };

  const handleCreateNewTicket = async () => {
    if (!newTicketForm.name.trim() || !newTicketForm.email.trim() || 
        !newTicketForm.subject.trim() || !newTicketForm.message.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const ticketId = `TICKET-${Date.now()}`;
      const newTicket: Omit<TicketType, 'id'> = {
        ticket_id: ticketId,
        name: newTicketForm.name,
        email: newTicketForm.email,
        subject: newTicketForm.subject,
        message: newTicketForm.message,
        category: newTicketForm.category,
        status: 'open',
        responses: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('tickets')
        .insert([newTicket])
        .select()
        .single();

      if (error) throw error;

      // Add the new ticket to local state
      setTickets([data, ...tickets]);
      setNewTicketForm({
        name: '',
        email: '',
        subject: '',
        message: '',
        category: 'general',
      });
      setIsNewTicketDialogOpen(false);
      toast.success('New ticket created');
    } catch (error: any) {
      toast.error('Failed to create ticket');
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    if (!confirm('Are you sure you want to delete this ticket?')) return;

    try {
      const { error } = await supabase
        .from('tickets')
        .delete()
        .eq('id', ticketId);

      if (error) throw error;

      // Update local state
      const updatedTickets = tickets.filter(t => t.id !== ticketId);
      setTickets(updatedTickets);
      
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(null);
      }
      
      toast.success('Ticket deleted');
    } catch (error: any) {
      toast.error('Failed to delete ticket');
    }
  };

  const handleExportTickets = () => {
    if (filteredTickets.length === 0) {
      toast.error('No data to export');
      return;
    }

    const headers = [
      'Ticket ID',
      'Name',
      'Email',
      'Subject',
      'Category',
      'Status',
      'Created Date',
      'Last Updated',
      'Response Count'
    ];

    const csvData = filteredTickets.map(ticket => [
      ticket.ticket_id,
      ticket.name,
      ticket.email,
      ticket.subject,
      categoryLabels[ticket.category] || ticket.category,
      ticket.status.replace('_', ' '),
      format(new Date(ticket.created_at), 'yyyy-MM-dd'),
      format(new Date(ticket.updated_at), 'yyyy-MM-dd'),
      ticket.responses.length
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tickets-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Export completed');
  };

  const getStatusBadge = (status: TicketType['status']) => {
    const option = statusOptions.find((s) => s.value === status);
    if (!option) return null;
    return (
      <Badge variant="outline" className={cn('text-xs', option.color)}>
        <option.icon className="h-3 w-3 mr-1" />
        {option.label}
      </Badge>
    );
  };

  const getStats = () => {
    const total = tickets.length;
    const open = tickets.filter(t => t.status === 'open').length;
    const inProgress = tickets.filter(t => t.status === 'in_progress').length;
    const resolved = tickets.filter(t => t.status === 'resolved').length;
    
    return { total, open, inProgress, resolved };
  };

  const stats = getStats();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {statusOptions.map((status) => {
          const count = tickets.filter((t) => t.status === status.value).length;
          return (
            <div
              key={status.value}
              className="bg-card border border-border rounded-lg p-4"
            >
              <div className="flex items-center gap-3">
                <div className={cn('p-2 rounded-lg', status.color)}>
                  <status.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-sm text-muted-foreground">{status.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex-1 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by ticket ID, name, or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
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
              <SelectTrigger className="w-[150px]">
                <Tag className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {categoryLabels[cat] || cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex gap-2">
          <Dialog open={isNewTicketDialogOpen} onOpenChange={setIsNewTicketDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Ticket
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Ticket</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name *</label>
                    <Input
                      value={newTicketForm.name}
                      onChange={(e) => setNewTicketForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Customer name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email *</label>
                    <Input
                      type="email"
                      value={newTicketForm.email}
                      onChange={(e) => setNewTicketForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="customer@example.com"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject *</label>
                  <Input
                    value={newTicketForm.subject}
                    onChange={(e) => setNewTicketForm(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Brief description of the issue"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select
                    value={newTicketForm.category}
                    onValueChange={(v) => setNewTicketForm(prev => ({ ...prev, category: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {categoryLabels[cat] || cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Message *</label>
                  <Textarea
                    value={newTicketForm.message}
                    onChange={(e) => setNewTicketForm(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Detailed description of the issue..."
                    rows={4}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsNewTicketDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateNewTicket} className="btn-gradient-accent">
                    Create Ticket
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={handleExportTickets} className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" onClick={loadTickets} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Ticket List */}
      <div className="space-y-3">
        {filteredTickets.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <Ticket className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">No tickets found</p>
          </div>
        ) : (
          filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div 
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm font-semibold">{ticket.ticket_id}</span>
                    {getStatusBadge(ticket.status)}
                    <Badge variant="outline" className="text-xs">
                      {categoryLabels[ticket.category] || ticket.category}
                    </Badge>
                  </div>
                  <h4 className="font-medium truncate">{ticket.subject}</h4>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {ticket.name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {ticket.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
                    </span>
                    {ticket.responses.length > 0 && (
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {ticket.responses.length} replies
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={ticket.status}
                    onValueChange={(v) => handleStatusChange(ticket.id, v as TicketType['status'])}
                  >
                    <SelectTrigger className="w-[140px] h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleDeleteTicket(ticket.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Results count */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Showing {filteredTickets.length} of {tickets.length} tickets
        </p>
        <div className="text-sm text-muted-foreground">
          Last updated: {format(new Date(), 'HH:mm:ss')}
        </div>
      </div>

      {/* Ticket Detail Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5" />
              Ticket Details
            </DialogTitle>
          </DialogHeader>

          {selectedTicket && (
            <div className="flex-1 overflow-y-auto space-y-4">
              {/* Header */}
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-semibold">{selectedTicket.ticket_id}</span>
                  <Select
                    value={selectedTicket.status}
                    onValueChange={(v) => handleStatusChange(selectedTicket.id, v as TicketType['status'])}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <h3 className="text-lg font-semibold">{selectedTicket.subject}</h3>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {selectedTicket.name}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {selectedTicket.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Tag className="h-4 w-4" />
                    {categoryLabels[selectedTicket.category] || selectedTicket.category}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(selectedTicket.created_at), 'PPP')}
                  </span>
                </div>
              </div>

              {/* Original Message */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Original Message</p>
                <div className="p-4 bg-card border border-border rounded-lg">
                  <p className="whitespace-pre-wrap">{selectedTicket.message}</p>
                </div>
              </div>

              {/* Responses */}
              {selectedTicket.responses.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">Conversation</p>
                  {selectedTicket.responses.map((response) => (
                    <div
                      key={response.id}
                      className={cn(
                        'p-4 rounded-lg',
                        response.isAdmin
                          ? 'bg-accent/10 border border-accent/20 ml-4'
                          : 'bg-muted mr-4'
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          {response.isAdmin ? 'Support Team' : selectedTicket.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(response.timestamp), 'PPp')}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap">{response.message}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply Form */}
              <div className="space-y-3 pt-4 border-t border-border">
                <Textarea
                  placeholder="Type your reply..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  rows={3}
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setSelectedTicket(null)}>
                    Close
                  </Button>
                  <Button
                    onClick={handleSendReply}
                    disabled={!replyMessage.trim() || isSending}
                    className="btn-gradient-accent gap-2"
                  >
                    <Send className="h-4 w-4" />
                    {isSending ? 'Sending...' : 'Send Reply'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TicketManagement;