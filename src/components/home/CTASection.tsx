import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Package, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CTASection: React.FC = () => {
  return (
    <section className="py-20">
      <div className="container">
        <div className="relative rounded-3xl overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 hero-gradient" />
          
          {/* Decorative Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-info/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          </div>

          {/* Content */}
          <div className="relative z-10 px-8 py-16 lg:px-16 lg:py-20">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
                Ready to Ship Smarter?
              </h2>
              <p className="text-lg text-white/70 mb-10 max-w-xl mx-auto">
                Join thousands of businesses that trust Movemate for their logistics needs. 
                Get started today with instant tracking and dedicated support.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/request">
                  <Button size="lg" className="bg-white text-primary hover:bg-white/90 h-14 px-8 w-full sm:w-auto">
                    <Package className="mr-2 h-5 w-5" />
                    Start Shipping
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="border-white/30 text-white hover:bg-white/10 h-14 px-8 w-full sm:w-auto"
                  >
                    <Headphones className="mr-2 h-5 w-5" />
                    Contact Sales
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
