import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <Package className="h-8 w-8 text-accent" />
              <div className="flex flex-col">
                <span className="font-bold text-lg">Movemate</span>
                <span className="text-[10px] text-primary-foreground/60 tracking-widest uppercase">LogisticExpress</span>
              </div>
            </Link>
            <p className="text-sm text-primary-foreground/70 max-w-xs">
              Your trusted partner for fast, reliable, and secure logistics solutions worldwide.
            </p>
            {/* <div className="flex gap-4">
              <a href="#" className="text-primary-foreground/60 hover:text-accent transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-primary-foreground/60 hover:text-accent transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-primary-foreground/60 hover:text-accent transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-primary-foreground/60 hover:text-accent transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div> */}
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { href: '/track', label: 'Track Shipment' },
                { href: '/request', label: 'Request Tracking ID' },
                { href: '/about', label: 'About Us' },
                { href: '/contact', label: 'Contact' },
                { href: '/help', label: 'Help Center' },
              ].map((link) => (
                <li key={link.href}>
                  <Link 
                    to={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold mb-4">Services</h4>
            <ul className="space-y-2">
              {[
                'Express Delivery',
                'International Shipping',
                'Freight Services',
                'Warehousing',
                'Last Mile Delivery',
              ].map((service) => (
                <li key={service}>
                  <span className="text-sm text-primary-foreground/70">
                    {service}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                {/* <MapPin className="h-5 w-5 text-accent shrink-0 mt-0.5" /> */}
                {/* <span className="text-sm text-primary-foreground/70">
                  123 Logistics Way, Suite 500<br />
                  New York, NY 10001
                </span> */}
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-accent shrink-0" />
                <span className="text-sm text-primary-foreground/70">
                  1-800-MOVEMATE
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-accent shrink-0" />
                <span className="text-sm text-primary-foreground/70">
                  support@movemate.com
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-primary-foreground/10">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-primary-foreground/60">
              © 2025 Movemate LogisticExpress. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link to="/privacy" className="text-sm text-primary-foreground/60 hover:text-accent transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-sm text-primary-foreground/60 hover:text-accent transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="border-t border-primary-foreground/10 py-4">
        <div className="container flex flex-wrap justify-center gap-6 text-xs text-primary-foreground/50">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-accent rounded-full" />
            ISO 9001 Certified
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-accent rounded-full" />
            Secure Logistics
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-accent rounded-full" />
            24/7 Monitoring
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-accent rounded-full" />
            Insured Shipments
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
