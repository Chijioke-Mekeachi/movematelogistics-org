import React from 'react';
import { Shield, Award, Lock, CheckCircle } from 'lucide-react';

const badges = [
  {
    icon: Shield,
    title: 'ISO 9001 Certified',
    description: 'Quality management system certified',
  },
  {
    icon: Lock,
    title: 'Secure Logistics',
    description: 'End-to-end encrypted tracking',
  },
  {
    icon: Award,
    title: 'Industry Leader',
    description: 'Top-rated logistics provider 2024',
  },
  {
    icon: CheckCircle,
    title: 'Insured Shipments',
    description: 'Full coverage on all packages',
  },
];

const TrustBadges: React.FC = () => {
  return (
    <section className="py-16 border-y border-border bg-card">
      <div className="container">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {badges.map((badge, index) => (
            <div
              key={index}
              className="flex items-center gap-4 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="shrink-0 w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <badge.icon className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="font-semibold text-sm">{badge.title}</p>
                <p className="text-xs text-muted-foreground">{badge.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBadges;
