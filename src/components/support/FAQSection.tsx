import React, { useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { faqData } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const FAQSection: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredFAQ = faqData.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => 
        q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search frequently asked questions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 h-14 text-base"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory(null)}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-colors",
            activeCategory === null
              ? "bg-accent text-accent-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
        >
          All
        </button>
        {faqData.map((category) => (
          <button
            key={category.category}
            onClick={() => setActiveCategory(category.category)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-colors",
              activeCategory === category.category
                ? "bg-accent text-accent-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {category.category}
          </button>
        ))}
      </div>

      {/* FAQ Accordion */}
      <div className="space-y-6">
        {(activeCategory 
          ? filteredFAQ.filter(c => c.category === activeCategory)
          : filteredFAQ
        ).map((category) => (
          <div key={category.category} className="space-y-3">
            <h3 className="text-lg font-semibold text-accent">{category.category}</h3>
            <Accordion type="single" collapsible className="space-y-2">
              {category.questions.map((item, index) => (
                <AccordionItem
                  key={index}
                  value={`${category.category}-${index}`}
                  className="bg-card border border-border rounded-xl px-6 data-[state=open]:shadow-card"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-4">
                    <span className="font-medium">{item.q}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}

        {filteredFAQ.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>No results found for "{searchQuery}"</p>
            <p className="text-sm mt-2">Try different keywords or browse categories above</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FAQSection;
