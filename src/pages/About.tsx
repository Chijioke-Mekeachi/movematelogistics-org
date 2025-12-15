import React from 'react';
import { Target, Users, Globe, Shield, Truck, Award } from 'lucide-react';
import Layout from '@/components/layout/Layout';

const About: React.FC = () => {
  return (
    <Layout>
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container max-w-4xl text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">About Movemate</h1>
          <p className="text-xl text-primary-foreground/70">
            Your trusted partner for fast, reliable, and secure logistics solutions worldwide.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container max-w-4xl">
          <div className="prose prose-lg mx-auto">
            <h2 className="text-2xl font-bold mb-4">Our Story</h2>
            <p className="text-muted-foreground mb-8">
              Founded in 2015, Movemate LogisticExpress has grown from a small local courier service 
              to a global logistics powerhouse. We've delivered over 5,000 packages across 200+ countries, 
              maintaining our commitment to speed, safety, and reliability.
            </p>

            <div className="grid md:grid-cols-2 gap-8 my-12">
              <div className="bg-card rounded-2xl border border-border p-6">
                <Target className="h-10 w-10 text-accent mb-4" />
                <h3 className="text-xl font-semibold mb-2">Our Mission</h3>
                <p className="text-muted-foreground">
                  To revolutionize global logistics by providing seamless, technology-driven 
                  shipping solutions that connect businesses and people worldwide.
                </p>
              </div>
              <div className="bg-card rounded-2xl border border-border p-6">
                <Globe className="h-10 w-10 text-accent mb-4" />
                <h3 className="text-xl font-semibold mb-2">Our Vision</h3>
                <p className="text-muted-foreground">
                  To be the world's most trusted logistics partner, known for innovation, 
                  reliability, and exceptional customer service.
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-6">Our Values</h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { icon: Truck, title: 'Speed', desc: 'Fast, efficient delivery every time' },
                { icon: Shield, title: 'Security', desc: 'Your packages are always protected' },
                { icon: Award, title: 'Excellence', desc: 'We exceed expectations consistently' },
              ].map((value, i) => (
                <div key={i} className="text-center p-4">
                  <value.icon className="h-8 w-8 text-accent mx-auto mb-3" />
                  <h4 className="font-semibold mb-1">{value.title}</h4>
                  <p className="text-sm text-muted-foreground">{value.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
