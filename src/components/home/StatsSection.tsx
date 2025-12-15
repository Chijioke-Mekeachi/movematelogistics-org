import React from 'react';
import { Package, Globe, Headphones, Star, Truck, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

const stats = [
  {
    icon: Package,
    value: '5,000+',
    label: 'Deliveries Completed',
    description: 'Successfully delivered packages worldwide',
  },
  {
    icon: Globe,
    value: '200+',
    label: 'Global Coverage',
    description: 'Countries in our delivery network',
  },
  {
    icon: Headphones,
    value: '24/7',
    label: 'Support Available',
    description: 'Round-the-clock customer assistance',
  },
  {
    icon: Star,
    value: '99.8%',
    label: 'Customer Satisfaction',
    description: 'Based on customer reviews',
  },
];

const features = [
  {
    icon: Truck,
    title: 'Express Delivery',
    description: 'Same-day and next-day delivery options available for urgent shipments.',
  },
  {
    icon: Shield,
    title: 'Secure Handling',
    description: 'End-to-end package protection with insurance coverage up to $10,000.',
  },
  {
    icon: Globe,
    title: 'Global Network',
    description: 'Seamless international shipping to over 200 countries worldwide.',
  },
];

const StatsSection: React.FC = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-20">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={cn(
                "relative group bg-card rounded-2xl p-6 border border-border",
                "hover:shadow-card hover:border-accent/20 transition-all duration-300",
                "animate-fade-in"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-accent/5 rounded-bl-[100px] group-hover:bg-accent/10 transition-colors" />
              <stat.icon className="h-8 w-8 text-accent mb-4" />
              <p className="text-3xl lg:text-4xl font-bold mb-1">{stat.value}</p>
              <p className="font-medium text-foreground mb-1">{stat.label}</p>
              <p className="text-sm text-muted-foreground">{stat.description}</p>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Why Choose <span className="text-accent">Movemate</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We combine cutting-edge technology with reliable service to deliver 
            an exceptional logistics experience.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={cn(
                "group relative bg-card rounded-2xl p-8 border border-border",
                "hover:shadow-lg transition-all duration-300",
                "animate-fade-in"
              )}
              style={{ animationDelay: `${(index + 4) * 100}ms` }}
            >
              <div className="inline-flex p-3 bg-accent/10 rounded-xl mb-6 group-hover:bg-accent/20 transition-colors">
                <feature.icon className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
