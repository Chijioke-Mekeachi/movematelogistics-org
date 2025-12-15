import React from 'react';
import { HelpCircle, MessageCircle, Ticket } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import FAQSection from '@/components/support/FAQSection';
import TicketForm from '@/components/support/TicketForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const HelpCenter: React.FC = () => {
  return (
    <Layout>
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container max-w-3xl text-center">
          <HelpCircle className="h-12 w-12 text-accent mx-auto mb-4" />
          <h1 className="text-3xl lg:text-4xl font-bold mb-4">Help Center</h1>
          <p className="text-primary-foreground/70">
            Find answers to common questions or submit a support ticket.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container max-w-4xl">
          <Tabs defaultValue="faq" className="space-y-8">
            <TabsList className="grid w-full grid-cols-2 h-12">
              <TabsTrigger value="faq" className="gap-2">
                <MessageCircle className="h-4 w-4" />
                FAQ
              </TabsTrigger>
              <TabsTrigger value="ticket" className="gap-2">
                <Ticket className="h-4 w-4" />
                Submit Ticket
              </TabsTrigger>
            </TabsList>

            <TabsContent value="faq">
              <FAQSection />
            </TabsContent>

            <TabsContent value="ticket">
              <div className="bg-card rounded-2xl border border-border p-6 lg:p-8">
                <h2 className="text-xl font-semibold mb-6">Submit a Support Ticket</h2>
                <TicketForm />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </Layout>
  );
};

export default HelpCenter;
