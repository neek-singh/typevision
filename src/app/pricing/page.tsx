'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, Zap, School, Sparkles, MessageSquare, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import PricingHeader from '@/components/pricing/pricing-header';
import PricingCard from '@/components/pricing/pricing-card';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const PricingComparison = dynamic(() => import('@/components/pricing/pricing-comparison'), {
  ssr: false,
  loading: () => (
    <div className="space-y-4 py-8">
      <Skeleton className="h-10 w-48 mx-auto" />
      <Skeleton className="h-64 w-full" />
    </div>
  ),
});

const PricingFaq = dynamic(() => import('@/components/pricing/pricing-faq'), {
  ssr: false,
  loading: () => (
    <div className="space-y-4 py-8">
      <Skeleton className="h-10 w-36 animate-pulse" />
      <div className="space-y-2.5">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  ),
});

export default function PricingPage() {
  const router = useRouter();
  const { user, profile, updateSubscription } = useAuthStore();
  const [isAnnual, setIsAnnual] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'student' | 'institute'>('student');
  const [selectingPlan, setSelectingPlan] = useState<string | null>(null);

  // Handle payment alerts, URL query sanitization, and category initialization
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      
      const categoryParam = params.get('category');
      if (categoryParam === 'institute') {
        setActiveCategory('institute');
      } else if (categoryParam === 'student') {
        setActiveCategory('student');
      }

      const paymentStatus = params.get('payment');
      if (paymentStatus === 'failed') {
        const reason = params.get('reason') || params.get('status') || 'Transaction was declined';
        alert(`Payment Failed: ${reason}. Please try again.`);
        
        // Clean URL query parameters smoothly
        const url = new URL(window.location.href);
        url.searchParams.delete('payment');
        url.searchParams.delete('reason');
        url.searchParams.delete('status');
        window.history.replaceState({}, '', url.toString());
      }
    }
  }, []);

  const handleSelectPlan = async (planTitle: string) => {
    if (!user) {
      router.push(`/register?plan=${encodeURIComponent(planTitle)}`);
      return;
    }

    // Free plan bypasses payment gateway
    if (planTitle === 'Free Practice') {
      setSelectingPlan(planTitle);
      try {
        const { error } = await updateSubscription(planTitle, 'active');
        if (error) {
          alert('Failed to activate Free Plan. Please try again.');
        } else {
          router.push('/dashboard?tab=subscription&payment=success&plan=Free%20Practice');
        }
      } catch (err) {
        console.error('Free plan activation error:', err);
      } finally {
        setSelectingPlan(null);
      }
      return;
    }

    setSelectingPlan(planTitle);
    try {
      const getPlanPrice = (title: string, annual: boolean): number => {
        const prices: Record<string, { monthly: number; yearly: number }> = {
          'Daily Explorer': { monthly: 199, yearly: 1908 },
          'Pro Tactile': { monthly: 799, yearly: 7668 },
          'Elite Typist': { monthly: 1499, yearly: 14388 },
          'Starter Group': { monthly: 799, yearly: 7668 },
          'Standard Classroom': { monthly: 1599, yearly: 15348 },
          'Premium Hub': { monthly: 3299, yearly: 31668 },
          'Academic Enterprise': { monthly: 6999, yearly: 67188 },
          'Government Org': { monthly: 14999, yearly: 143988 },
        };
        return prices[title] ? (annual ? prices[title].yearly : prices[title].monthly) : 0;
      };

      const price = getPlanPrice(planTitle, isAnnual);
      const fullPlanName = `${planTitle} ${isAnnual ? '(Yearly)' : '(Monthly)'}`;

      // Call backend API to initiate checkout
      const checkoutResponse = await fetch('/api/payment/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          planTitle: fullPlanName,
          price: price.toString(),
          userId: user.id,
          userEmail: user.email || '',
          userName: profile?.display_name || user.email?.split('@')[0] || 'User'
        })
      });

      const checkoutData = await checkoutResponse.json();

      if (!checkoutResponse.ok || !checkoutData.payment_session_id) {
        throw new Error(checkoutData.error || 'Failed to create payment session');
      }

      // Initialize Cashfree SDK and redirect
      if (!(window as any).Cashfree) {
        throw new Error('Cashfree SDK failed to load. Please refresh the page and try again.');
      }

      const cashfree = (window as any).Cashfree({
        mode: process.env.NEXT_PUBLIC_CASHFREE_ENV === 'production' ? 'production' : 'sandbox'
      });

      cashfree.checkout({
        paymentSessionId: checkoutData.payment_session_id,
        redirectTarget: '_self'
      });

    } catch (err: any) {
      console.error('Payment checkout select error:', err);
      alert(`Checkout failed: ${err.message || 'Please check your connection and try again.'}`);
    } finally {
      setSelectingPlan(null);
    }
  };

  const studentPlans = [
    {
      title: 'Free Practice',
      price: '₹0',
      period: isAnnual ? 'year' : 'forever',
      description: 'Core row exercises and basic metrics trackers for individual starters.',
      ctaText: 'Get Started Free',
      recommended: false,
      icon: BookOpen,
      features: [
        { text: 'English typing practice & lessons', included: true },
        { text: 'Hindi Krutidev Remington keyboard support', included: true },
        { text: 'Real-time WPM speed & accuracy check', included: true },
        { text: 'Latest 10 typing history logs', included: true },
        { text: 'Custom paragraph/text uploads', included: false },
        { text: 'Interactive speed progression charts', included: false },
      ],
    },
    {
      title: 'Daily Explorer',
      price: isAnnual ? '₹1,908' : '₹199',
      originalPrice: isAnnual ? '₹2,388' : undefined,
      savingsText: isAnnual ? 'Save ₹480 (20% Off)' : undefined,
      period: isAnnual ? 'year' : 'month',
      description: 'Perfect for casual learners focusing on daily speed drills.',
      ctaText: 'Start Explorer',
      recommended: false,
      icon: Zap,
      features: [
        { text: 'English typing practice & lessons', included: true },
        { text: 'Hindi Krutidev Remington keyboard support', included: true },
        { text: 'Real-time WPM speed & accuracy check', included: true },
        { text: 'Latest 50 typing history logs', included: true },
        { text: 'Custom paragraph/text uploads', included: false },
        { text: 'Interactive speed progression charts', included: false },
      ],
    },
    {
      title: 'Pro Tactile',
      price: isAnnual ? '₹7,668' : '₹799',
      originalPrice: isAnnual ? '₹9,588' : undefined,
      savingsText: isAnnual ? 'Save ₹1,920 (20% Off)' : undefined,
      period: isAnnual ? 'year' : 'month',
      description: 'Unlimited access to complex layout chapters and in-depth history charts.',
      ctaText: 'Upgrade to Pro',
      recommended: true,
      icon: Sparkles,
      features: [
        { text: 'English typing practice & lessons', included: true },
        { text: 'Hindi Krutidev Remington keyboard support', included: true },
        { text: 'Real-time WPM speed & accuracy check', included: true },
        { text: 'Unlimited typing history logs', included: true },
        { text: 'Custom paragraph/text uploads', included: true },
        { text: 'Interactive speed progression charts', included: true },
      ],
    },
    {
      title: 'Elite Typist',
      price: isAnnual ? '₹14,388' : '₹1,499',
      originalPrice: isAnnual ? '₹17,988' : undefined,
      savingsText: isAnnual ? 'Save ₹3,600 (20% Off)' : undefined,
      period: isAnnual ? 'year' : 'month',
      description: 'For competitive champions preparing for governmental typing exams.',
      ctaText: 'Join Elite Tier',
      recommended: false,
      icon: School,
      features: [
        { text: 'English typing practice & lessons', included: true },
        { text: 'Hindi Krutidev Remington keyboard support', included: true },
        { text: 'Real-time WPM speed & accuracy check', included: true },
        { text: 'Unlimited typing history logs', included: true },
        { text: 'Custom paragraph/text uploads', included: true },
        { text: 'Interactive speed progression charts', included: true },
        { text: 'Simulated government typing exam mode', included: true },
      ],
    },
  ];

  const institutePlans = [
    {
      title: 'Starter Group',
      price: isAnnual ? '₹7,668' : '₹799',
      originalPrice: isAnnual ? '₹9,588' : undefined,
      savingsText: isAnnual ? 'Save ₹1,920 (20% Off)' : undefined,
      period: isAnnual ? 'year' : 'month',
      description: 'Ideal for tutoring batches or small family practices (5 student accounts).',
      ctaText: 'Deploy Group',
      recommended: false,
      icon: BookOpen,
      features: [
        { text: 'Up to 5 student accounts access', included: true },
        { text: 'English & Hindi typing lessons access', included: true },
        { text: 'Real-time WPM speed & accuracy check', included: true },
        { text: 'Student attempt logs history access', included: true },
        { text: 'Classroom batch creation controls', included: false },
        { text: 'Multi-student progression curve reports', included: false },
      ],
    },
    {
      title: 'Standard Classroom',
      price: isAnnual ? '₹15,348' : '₹1,599',
      originalPrice: isAnnual ? '₹19,188' : undefined,
      savingsText: isAnnual ? 'Save ₹3,840 (20% Off)' : undefined,
      period: isAnnual ? 'year' : 'month',
      description: 'Integrated batch tracking and custom dashboards (25 student accounts).',
      ctaText: 'Deploy Standard',
      recommended: false,
      icon: School,
      features: [
        { text: 'Up to 25 student accounts access', included: true },
        { text: 'English & Hindi typing lessons access', included: true },
        { text: 'Real-time WPM speed & accuracy check', included: true },
        { text: 'Student attempt logs history access', included: true },
        { text: 'Classroom batch creation controls', included: true },
        { text: 'Multi-student progression curve reports', included: false },
      ],
    },
    {
      title: 'Premium Hub',
      price: isAnnual ? '₹31,668' : '₹3,299',
      originalPrice: isAnnual ? '₹39,588' : undefined,
      savingsText: isAnnual ? 'Save ₹7,920 (20% Off)' : undefined,
      period: isAnnual ? 'year' : 'month',
      description: 'Integrated classrooms, advanced dashboards, and audits (50 student accounts).',
      ctaText: 'Deploy Premium',
      recommended: true,
      icon: Sparkles,
      features: [
        { text: 'Up to 50 student accounts access', included: true },
        { text: 'English & Hindi typing lessons access', included: true },
        { text: 'Real-time WPM speed & accuracy check', included: true },
        { text: 'Student attempt logs history access', included: true },
        { text: 'Classroom batch creation controls', included: true },
        { text: 'Multi-student progression curve reports', included: true },
      ],
    },
    {
      title: 'Academic Enterprise',
      price: isAnnual ? '₹67,188' : '₹6,999',
      originalPrice: isAnnual ? '₹83,988' : undefined,
      savingsText: isAnnual ? 'Save ₹16,800 (20% Off)' : undefined,
      period: isAnnual ? 'year' : 'month',
      description: 'Full school deployment with subdomain and LMS integration (100 student accounts).',
      ctaText: 'Deploy Enterprise',
      recommended: false,
      icon: School,
      features: [
        { text: 'Up to 100 student accounts access', included: true },
        { text: 'English & Hindi typing lessons access', included: true },
        { text: 'Real-time WPM speed & accuracy check', included: true },
        { text: 'Classroom batch creation controls', included: true },
        { text: 'Multi-student progression curve reports', included: true },
        { text: 'Custom white-labeled portal subdomain', included: true },
      ],
    },
    {
      title: 'Government Org',
      price: isAnnual ? '₹143,988' : '₹14,999',
      originalPrice: isAnnual ? '₹179,988' : undefined,
      savingsText: isAnnual ? 'Save ₹36,000 (20% Off)' : undefined,
      period: isAnnual ? 'year' : 'month',
      description: 'Specialized high-security training tiers with offline mode support (150 student accounts).',
      ctaText: 'Deploy Government Tier',
      recommended: false,
      icon: Zap,
      features: [
        { text: 'Up to 150 student accounts access', included: true },
        { text: 'English & Hindi typing lessons access', included: true },
        { text: 'Real-time WPM speed & accuracy check', included: true },
        { text: 'Classroom batch creation controls', included: true },
        { text: 'Multi-student progression curve reports', included: true },
        { text: 'Offline intranet client application support', included: true },
      ],
    },
  ];

  const activePlans = activeCategory === 'student' ? studentPlans : institutePlans;

  return (
    <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 w-full space-y-12 min-h-screen overflow-hidden">
      {/* Decorative Radial glows */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 -z-10 h-[400px] w-[600px] rounded-full bg-cyan-500/5 blur-[120px]"></div>
      <div className="absolute bottom-20 right-10 -z-10 h-[300px] w-[500px] rounded-full bg-purple-600/5 blur-[120px]"></div>

      {/* Section 1: Hero Header */}
      <PricingHeader />

      {/* Category Tabs Toggle */}
      <div className="flex justify-center pt-2">
        <div className="inline-flex rounded-2xl border border-white/5 bg-slate-900/40 p-1 backdrop-blur-md">
          <button
            onClick={() => setActiveCategory('student')}
            className={`rounded-xl px-6 py-2.5 text-xs font-bold transition-all duration-300 ${
              activeCategory === 'student'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/10'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Student Plans
          </button>
          <button
            onClick={() => setActiveCategory('institute')}
            className={`rounded-xl px-6 py-2.5 text-xs font-bold transition-all duration-300 ${
              activeCategory === 'institute'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/10'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Institute Plans
          </button>
        </div>
      </div>

      {/* Billing Cycle Toggle */}
      <div className="flex items-center justify-center gap-3 pt-2">
        <span className={`text-sm font-semibold transition-colors ${!isAnnual ? 'text-white' : 'text-slate-400'}`}>Monthly</span>
        <button
          onClick={() => setIsAnnual(!isAnnual)}
          className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-slate-800 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-950"
          role="switch"
          aria-checked={isAnnual}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 shadow-md ring-0 transition duration-200 ease-in-out ${
              isAnnual ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
        <div className="flex items-center gap-1.5">
          <span className={`text-sm font-semibold transition-colors ${isAnnual ? 'text-white' : 'text-slate-400'}`}>Yearly</span>
          <span className="inline-flex items-center rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-[10px] font-bold text-cyan-400 border border-cyan-500/20">
            Save 20%
          </span>
        </div>
      </div>

      {/* Section 2: Cards Grid */}
      <div className="grid grid-cols-1 gap-6 pt-6 items-stretch justify-center md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto relative">
        {selectingPlan && (
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs z-50 flex flex-col items-center justify-center rounded-3xl gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.2)]" />
            <p className="text-xs font-bold text-slate-350 tracking-wider">Activating secure plan context...</p>
          </div>
        )}
        {activePlans.map((plan, i) => (
          <PricingCard
            key={i}
            title={plan.title}
            price={plan.price}
            originalPrice={plan.originalPrice}
            savingsText={plan.savingsText}
            period={plan.period}
            description={plan.description}
            features={plan.features}
            recommended={plan.recommended}
            ctaText={selectingPlan === plan.title ? 'Activating Plan...' : plan.ctaText}
            icon={plan.icon}
            onSelect={() => handleSelectPlan(plan.title)}
          />
        ))}
      </div>

      {/* Section 3: Feature Comparison Specs */}
      <div className="pt-8">
        <PricingComparison activeCategory={activeCategory} />
      </div>

      {/* Section 4: Accordion FAQs */}
      <div className="pt-8">
        <PricingFaq />
      </div>

      {/* Section 5: Final CTA Panel */}
      <div className="pt-8 max-w-4xl mx-auto">
        <div className="relative rounded-3xl border border-white/5 bg-slate-900/20 p-8 sm:p-12 text-center shadow-xl backdrop-blur-sm overflow-hidden group">
          {/* Internal Glow hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
          
          <div className="relative space-y-6 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/20 bg-cyan-950/20 px-3.5 py-1 text-xs font-semibold text-cyan-400">
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              <span>Unlock Superior Speeds</span>
            </div>
            
            <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
              Ready to Upgrade Your Training?
            </h2>
            
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Equip your fingers with elite Remington Remington and English touch touch-typing structures. Unlock your detailed dashboards and charts today.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                href="/lessons"
                className="flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3.5 text-xs font-bold text-white shadow-lg hover:from-cyan-400 hover:to-blue-500 hover:shadow-cyan-500/25 transition-all"
              >
                <span>Browse Lessons</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/contact"
                className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-slate-900 px-6 py-3.5 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:border-white/20 transition-all"
              >
                <MessageSquare className="h-4 w-4 text-cyan-400" />
                <span>Contact Sales</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
