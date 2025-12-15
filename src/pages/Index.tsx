import React from 'react';
import Layout from '@/components/layout/Layout';
import HeroSection from '@/components/home/HeroSection';
import StatsSection from '@/components/home/StatsSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import TrustBadges from '@/components/home/TrustBadges';
import CTASection from '@/components/home/CTASection';

const Index: React.FC = () => {
  return (
    <Layout>
      <HeroSection />
      <StatsSection />
      <TestimonialsSection />
      <TrustBadges />
      <CTASection />
    </Layout>
  );
};

export default Index;
