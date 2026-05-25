import { RotateCcw, Info, ShieldAlert, FileText, HelpCircle, CreditCard, Clock } from 'lucide-react';
import Link from 'next/link';

export default function ReturnPolicy() {
  return (
    <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 w-full space-y-12 min-h-screen">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-1/4 left-1/3 -z-10 h-[300px] w-[500px] rounded-full bg-cyan-500/5 blur-[120px]"></div>
      <div className="absolute bottom-1/3 right-1/4 -z-10 h-[300px] w-[400px] rounded-full bg-blue-500/5 blur-[120px]"></div>

      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/20 bg-cyan-950/20 px-3.5 py-1 text-xs font-semibold text-cyan-400">
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Billing Operations</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">Return &amp; Refund Policy</h1>
        <p className="text-xs text-slate-400">Effective Date: May 25, 2026</p>
      </div>

      {/* Policy Body container */}
      <div className="rounded-2xl border border-white/5 bg-slate-900/10 p-6 sm:p-10 shadow-xl backdrop-blur-sm space-y-10 text-left text-xs leading-relaxed text-slate-400">
        
        {/* Visual Callouts */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 border-b border-white/5 pb-8">
          <div className="flex gap-2.5 items-start">
            <Info className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-white mb-0.5">Free Evaluation</h4>
              <p className="text-[10px] text-slate-500">We offer ample free practice drills so you can fully test platform compatibility before paying.</p>
            </div>
          </div>
          <div className="flex gap-2.5 items-start">
            <CreditCard className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-white mb-0.5">Cashfree Integration</h4>
              <p className="text-[10px] text-slate-500">All refunds are routed securely back to your original source of payment within 5-7 banking days.</p>
            </div>
          </div>
          <div className="flex gap-2.5 items-start">
            <Clock className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-white mb-0.5">Instant Cancellation</h4>
              <p className="text-[10px] text-slate-500">Pause or stop subscription renewals immediately at any time from your account panel.</p>
            </div>
          </div>
        </div>

        {/* Section 1: Intro */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4.5 w-4.5 text-cyan-400 shrink-0" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">1. Return Scope &amp; Overview</h2>
          </div>
          <p>
            Thank you for practicing with TypeVision (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;). This Return &amp; Refund Policy outlines the terms governing cancellations, premium subscription returns, billing adjustments, and cash refund operations for our Pro memberships and customizable multi-student Institute plans.
          </p>
          <p>
            Because TypeVision delivers non-tangible, instantly accessible digital software licenses (immediate activation of specialized lessons, error dashboards, batch managers, and live speed diagnostics), we enforce clear operational rules to handle billing questions.
          </p>
        </section>

        {/* Section 2: Free Tier Trial */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-4.5 w-4.5 text-cyan-400 shrink-0" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">2. Evaluation Before Purchase</h2>
          </div>
          <p>
            To ensure complete consumer confidence, TypeVision offers a highly capable free tier containing standard English QWERTY typing drills, legacy Krutidev Remington character exercises, and diagnostic speed tests. 
          </p>
          <p>
            We highly encourage all users, tutors, and institute operators to fully utilize these free instructional options to verify keyboard layout compatibility, browser responsiveness, and system performance before opting for premium Pro or Institute packages.
          </p>
        </section>

        {/* Section 3: Subscription Refunds */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4.5 w-4.5 text-cyan-400 shrink-0" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">3. Refund Eligibility &amp; Exemptions</h2>
          </div>
          <p>
            <strong>General Rule:</strong> Subscription fees, once successfully processed and activated on your account profile, are **non-refundable** and non-returnable. 
          </p>
          <p>
            <strong>Exceptions to the General Rule:</strong> We recognize that banking errors and system glitches occur. We will investigate and issue full refunds in the following scenarios:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-500">
            <li>
              <strong>Double Billing:</strong> If our payment gateway processor (Cashfree) debits your card/UPI source twice for a single billing cycle registration, the duplicate charge will be fully refunded.
            </li>
            <li>
              <strong>Non-Activation of Premium Features:</strong> If a payment is successfully processed, but our Supabase backend fails to activate your premium license within 72 hours, and our customer support team is unable to resolve the setup discrepancy.
            </li>
          </ul>
        </section>

        {/* Section 4: Cancellation Policy */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4.5 w-4.5 text-cyan-400 shrink-0" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">4. Subscription Cancellations &amp; Renewals</h2>
          </div>
          <p>
            You can pause or completely cancel your recurring subscription renewals at any time:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-500">
            <li>
              Cancellations must be requested via your account&rsquo;s Billing Management panel before your next scheduled invoice period.
            </li>
            <li>
              Upon successful cancellation of renewal, your account will remain actively upgraded with Pro/Institute privileges until the end of your current paid billing period, at which point it will automatically convert back to our free plan tier.
            </li>
          </ul>
        </section>

        {/* Section 5: Processing & Timeline */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4.5 w-4.5 text-cyan-400 shrink-0" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">5. Refund Processing Timeline</h2>
          </div>
          <p>
            Once a refund is approved by our billing administrators:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-500">
            <li>
              Refunds are dispatched back exclusively to the original payment instrument (Credit Card, Debit Card, Net Banking, or UPI ID) that you utilized during check-out on the Cashfree gateway.
            </li>
            <li>
              According to regular banking rules in India, refunds will appear on your account statement within <strong>5 to 7 business days</strong> depending on your issuing banking institution.
            </li>
          </ul>
        </section>

        {/* Section 6: Contact Billing Support */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-4.5 w-4.5 text-cyan-400 shrink-0" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">6. Contact Billing Support</h2>
          </div>
          <p>
            If you detect an unrecognized transaction or double-charge on your statement, please email us immediately. Please mention your registered email address, transaction timestamp, and gateway reference ID.
          </p>
          <div className="p-4 rounded-xl border border-white/5 bg-slate-950/40 text-xs space-y-1 text-slate-400">
            <p className="font-bold text-white">TypeVision Billing Operations</p>
            <p>Email: support@typevision.com</p>
            <p>Subject Prefix: [Billing Inquiry]</p>
          </div>
        </section>

        {/* Policy Footer Info */}
        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-slate-500">
          <span>Need to check our primary guidelines?</span>
          <div className="flex gap-4">
            <Link href="/terms" className="text-cyan-400 hover:text-cyan-300 font-bold uppercase tracking-wider transition-colors">
              Terms &amp; Conditions
            </Link>
            <span className="text-white/10">|</span>
            <Link href="/privacy-policy" className="text-cyan-400 hover:text-cyan-300 font-bold uppercase tracking-wider transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
