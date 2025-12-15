import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, BarChart3, Ticket, MessageCircle, Shield } from 'lucide-react';
import ShipmentManagement from '@/components/admin/ShipmentManagement';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';
import TicketManagement from '@/components/admin/TicketManagement';
import ChatManagement from '@/components/admin/ChatManagement';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('shipments');

  return (
    <Layout>
      {/* Header */}
      <section className="bg-primary text-primary-foreground py-8">
        <div className="container">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/20 rounded-lg">
              <Shield className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-primary-foreground/70 text-sm">
                Manage shipments, support tickets, and customer conversations
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Content */}
      <section className="py-6">
        <div className="container">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-4 w-full max-w-2xl bg-muted p-1 rounded-xl">
              <TabsTrigger value="shipments" className="gap-2 data-[state=active]:bg-card">
                <Package className="h-4 w-4" />
                <span className="hidden sm:inline">Shipments</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-2 data-[state=active]:bg-card">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="tickets" className="gap-2 data-[state=active]:bg-card">
                <Ticket className="h-4 w-4" />
                <span className="hidden sm:inline">Tickets</span>
              </TabsTrigger>
              <TabsTrigger value="chats" className="gap-2 data-[state=active]:bg-card">
                <MessageCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Live Chat</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="shipments" className="mt-6">
              <ShipmentManagement />
            </TabsContent>

            <TabsContent value="analytics" className="mt-6">
              <AnalyticsDashboard />
            </TabsContent>

            <TabsContent value="tickets" className="mt-6">
              <TicketManagement />
            </TabsContent>

            <TabsContent value="chats" className="mt-6">
              <ChatManagement />
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </Layout>
  );
};

export default AdminDashboard;