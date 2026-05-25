'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

export default function PricingFaq() {
  const faqs: FaqItem[] = [
    {
      question: 'Is there a contract or commitment associated with subscriptions?',
      answer: 'No. Our Pro and Institute subscriptions run on a monthly contract baseline. You are free to cancel or pause your subscription at any point, with no cancellation fees, remaining active until your current billing period ends.',
    },
    {
      question: 'What exercises are included in the Free tier?',
      answer: 'The Free tier gives you full access to standard English home, top, and bottom row drills, limited Hindi Krutidev Remington starter lessons, and basic live analytics showing WPM speed and mistakes telemetry.',
    },
    {
      question: 'How do I install the Hindi Krutidev layout for legacy tests?',
      answer: 'Hindi Krutidev uses the Remington legacy keyboard layout. You can install standard Kruti Dev 010 fonts on Windows/Mac or use our built-in keyboard conversion engine during practice drills. We provide visual mappings for key conversions (e.g. typing QWERTY "d" translates into "क").',
    },
    {
      question: 'Does the Institute plan allow student progress analytics?',
      answer: 'Yes. The Institute package includes a specialized multi-student dashboard. Tutors or administrators can create batches, generate student accounts, track group typing speeds, and audit student WPM progression curves.',
    },
    {
      question: 'What billing methods do you accept?',
      answer: 'Since this is a visual high-fidelity MVP demo, we do not require or process live payments. Clicking upgrading triggers mock completion alerts showing successful simulation.',
    },
  ];

  return (
    <div className="space-y-8 text-left max-w-4xl mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-extrabold text-white">Frequently Asked Questions</h2>
        <p className="text-xs text-slate-400 mt-2">Answers to common billing and feature queries about our packages.</p>
      </div>

      <div className="space-y-3.5">
        {faqs.map((faq, index) => (
          <AccordionItem
            key={index}
            question={faq.question}
            answer={faq.answer}
          />
        ))}
      </div>
    </div>
  );
}

function AccordionItem({ question, answer }: FaqItem) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-white/5 bg-slate-900/10 overflow-hidden shadow-md backdrop-blur-sm transition-all duration-200 hover:border-white/10">
      {/* Accordion trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-xs font-bold text-slate-200 hover:text-white transition-colors"
      >
        <span className="text-left">{question}</span>
        <ChevronDown className={`h-4 w-4 text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-cyan-400' : ''}`} />
      </button>

      {/* Accordion content expansion */}
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[200px] border-t border-white/5' : 'max-h-0'}`}>
        <div className="px-5 py-4 text-[11px] leading-relaxed text-slate-400">
          {answer}
        </div>
      </div>
    </div>
  );
}
