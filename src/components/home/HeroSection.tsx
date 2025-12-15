import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Package, Globe, Clock, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TrackingInput from '@/components/tracking/TrackingInput';

const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  const handleTrack = (trackingId: string) => {
    navigate(`/track?id=${trackingId}`);
  };

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 hero-gradient" />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-info/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '-2s' }} />
        
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Content */}
      <div className="container relative z-10 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm mb-8 animate-fade-in">
            <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            Trusted by 5,000+ businesses worldwide
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Move Smarter.
            <br />
            <span className="text-accent">Deliver Faster.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Experience next-generation logistics with real-time tracking, 
            global coverage, and 24/7 dedicated support for all your shipping needs.
          </p>

          {/* Tracking Input */}
          <div className="max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <TrackingInput onTrack={handleTrack} variant="hero" />
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <Button
              onClick={() => navigate('/request')}
              size="lg"
              className="bg-white text-primary hover:bg-white/90 h-14 px-8 text-base"
            >
              Request Tracking ID
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              onClick={() => navigate('/about')}
              variant="outline"
              size="lg"
              className="border-white/30 text-white hover:bg-white/10 h-14 px-8 text-base"
            >
              Learn More
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.5s' }}>
            {[
              { icon: Package, label: '5,000+', sublabel: 'Deliveries' },
              { icon: Globe, label: '200+', sublabel: 'Countries' },
              { icon: Clock, label: '24/7', sublabel: 'Support' },
              { icon: Shield, label: '99.9%', sublabel: 'On-Time' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <stat.icon className="h-6 w-6 text-accent mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{stat.label}</p>
                <p className="text-sm text-white/60">{stat.sublabel}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path 
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" 
            className="fill-background"
          />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
