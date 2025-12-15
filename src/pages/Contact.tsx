import React from 'react';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const Contact: React.FC = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Message sent! We\'ll get back to you soon.');
  };

  return (
    <Layout>
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container max-w-3xl text-center">
          <h1 className="text-3xl lg:text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-primary-foreground/70">
            Have questions? We're here to help 24/7.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container max-w-5xl">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input placeholder="Your name" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" placeholder="you@example.com" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Message</Label>
                  <Textarea placeholder="How can we help?" rows={5} required />
                </div>
                <Button type="submit" className="w-full btn-gradient-accent">
                  Send Message
                </Button>
              </form>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
              {[
                { icon: Phone, label: 'Phone', value: '1-800-MOVEMATE' },
                { icon: Mail, label: 'Email', value: 'support@movemate.com' },
                // { icon: MapPin, label: 'Address', value: '123 Logistics Way, New York, NY 10001' },
                { icon: Clock, label: 'Hours', value: '24/7 Customer Support' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-4 bg-card rounded-xl border border-border">
                  <item.icon className="h-6 w-6 text-accent shrink-0" />
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-muted-foreground">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
