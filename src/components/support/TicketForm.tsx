import React, { useState } from 'react';
import { Send, Loader2, CheckCircle } from 'lucide-react';
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
import {
  Ticket,
  generateTicketId,
  storage,
  STORAGE_KEYS,
  simulateApiDelay,
} from '@/lib/mockData';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface TicketFormProps {
  onSuccess?: (ticket: Ticket) => void;
}

const TicketForm: React.FC<TicketFormProps> = ({ onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdTicket, setCreatedTicket] = useState<Ticket | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.subject || !formData.category || !formData.message) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);

    await simulateApiDelay(1500);

    const newTicket: Ticket = {
      id: Date.now().toString(),
      ticketId: generateTicketId(),
      name: formData.name,
      email: formData.email,
      subject: formData.subject,
      category: formData.category,
      message: formData.message,
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      responses: [],
    };

    // Save to localStorage
    const existingTickets = storage.get<Ticket[]>(STORAGE_KEYS.TICKETS, []);
    storage.set(STORAGE_KEYS.TICKETS, [newTicket, ...existingTickets]);

    setIsSubmitting(false);
    setIsSuccess(true);
    setCreatedTicket(newTicket);
    toast.success('Support ticket created successfully!');
    onSuccess?.(newTicket);
  };

  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      subject: '',
      category: '',
      message: '',
    });
    setIsSuccess(false);
    setCreatedTicket(null);
  };

  if (isSuccess && createdTicket) {
    return (
      <div className="bg-card rounded-2xl border border-border p-8 text-center animate-scale-in">
        <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-8 w-8 text-success" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Ticket Submitted!</h3>
        <p className="text-muted-foreground mb-6">
          Your support ticket has been created. We'll get back to you within 24 hours.
        </p>
        <div className="bg-muted rounded-xl p-4 mb-6">
          <p className="text-sm text-muted-foreground mb-1">Ticket ID</p>
          <p className="text-2xl font-mono font-bold text-accent">{createdTicket.ticketId}</p>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          A confirmation email has been sent to <strong>{createdTicket.email}</strong>
        </p>
        <Button onClick={handleReset} variant="outline">
          Submit Another Ticket
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="John Doe"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            placeholder="john@example.com"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            value={formData.subject}
            onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
            placeholder="Brief description of your issue"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tracking">Tracking Issue</SelectItem>
              <SelectItem value="delivery">Delivery Problem</SelectItem>
              <SelectItem value="billing">Billing Inquiry</SelectItem>
              <SelectItem value="account">Account Help</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          value={formData.message}
          onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
          placeholder="Please describe your issue in detail..."
          rows={5}
          required
        />
      </div>

      <Button 
        type="submit" 
        className="w-full btn-gradient-accent h-12"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="h-5 w-5 mr-2" />
            Submit Ticket
          </>
        )}
      </Button>
    </form>
  );
};

export default TicketForm;
