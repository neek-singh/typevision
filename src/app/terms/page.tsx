import { Scale, Info, ShieldAlert, Award, FileText, HelpCircle, Landmark, CreditCard } from 'lucide-react';
import Link from 'next/link';

export default function Terms() {
  return (
    <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 w-full space-y-12 min-h-screen">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-1/4 left-1/3 -z-10 h-[300px] w-[500px] rounded-full bg-cyan-500/5 blur-[120px]"></div>
      <div className="absolute bottom-1/3 right-1/4 -z-10 h-[300px] w-[400px] rounded-full bg-blue-500/5 blur-[120px]"></div>

      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/20 bg-cyan-950/20 px-3.5 py-1 text-xs font-semibold text-cyan-400">
          <Scale className="h-3.5 w-3.5" />
          <span>Legal Guidelines</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">Terms &amp; Conditions</h1>
        <p className="text-xs text-slate-400">Effective Date: May 25, 2026</p>
      </div>

      {/* Terms Body container */}
      <div className="rounded-2xl border border-white/5 bg-slate-900/10 p-6 sm:p-10 shadow-xl backdrop-blur-sm space-y-10 text-left text-xs leading-relaxed text-slate-400">
        
        {/* Visual Callouts */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 border-b border-white/5 pb-8">
          <div className="flex gap-2.5 items-start">
            <Info className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-white mb-0.5">Agreement to Terms</h4>
              <p className="text-[10px] text-slate-500">By registering or accessing TypeVision, you signify complete compliance with our guidelines.</p>
            </div>
          </div>
          <div className="flex gap-2.5 items-start">
            <ShieldAlert className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-white mb-0.5">Anti-Cheating Policy</h4>
              <p className="text-[10px] text-slate-500">Programmatic injection, scripts, or speed falsification will trigger immediate bans.</p>
            </div>
          </div>
          <div className="flex gap-2.5 items-start">
            <Award className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-white mb-0.5">Intellectual Integrity</h4>
              <p className="text-[10px] text-slate-500">Lessons, layout mockups, and telemetry charts are the exclusive property of TypeVision.</p>
            </div>
          </div>
        </div>

        {/* Section 1: Acceptance */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4.5 w-4.5 text-cyan-400 shrink-0" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">1. Acceptance of the Agreement</h2>
          </div>
          <p>
            Welcome to TypeVision (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;). By accessing our website, practicing typing lessons, subscribing to our plans, or utilizing the specialized Institute Tutor Portal, you (&ldquo;User&rdquo;, &ldquo;Tutor&rdquo;, &ldquo;Student&rdquo;, or &ldquo;Principal&rdquo;) agree to be legally bound by these Terms &amp; Conditions. 
          </p>
          <p>
            If you do not agree with any clause within this document, you must immediately cease all access to the typing engine, dashboard utilities, and subscription portals. We reserve the right to revise or update these Terms at any time without individual notification. Your continued usage after modifications constitutes active acceptance.
          </p>
        </section>

        {/* Section 2: Services & Eligibility */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-4.5 w-4.5 text-cyan-400 shrink-0" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">2. Services Offered &amp; User Eligibility</h2>
          </div>
          <p>
            TypeVision provides touch-typing instructional modules, live speed diagnostics (Words Per Minute / WPM analytics), legacy Krutidev Remington keyboard exam preparations, custom paragraph exercises, and centralized educational deployment mechanisms for typing institutes.
          </p>
          <p>
            <strong>Eligibility:</strong> You must be at least 13 years of age to register a personal account. If you are registering on behalf of an educational academy or business entity (&ldquo;Institute&rdquo;), you certify that you possess the necessary administrative authority to bind that entity to these conditions.
          </p>
        </section>

        {/* Section 3: User Accounts, Verification, and Safety */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4.5 w-4.5 text-cyan-400 shrink-0" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">3. Account Safety, OTP, and Security</h2>
          </div>
          <p>
            To access telemetry trackers, historical graphs, and premium lessons, users must sign up for a secure account. Users must provide valid, accurate registration information (including Name, Email, Mobile Number, and Date of Birth where required).
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-500">
            <li>
              <strong>Verification:</strong> Registration requires a secure multi-stage Email OTP (One-Time Password) pipeline to ensure email authenticity and reduce system abuse.
            </li>
            <li>
              <strong>Credentials Integrity:</strong> You are solely responsible for keeping your password and session tokens strictly confidential. Any actions undertaken through your profile credentials are assumed to be performed by you.
            </li>
            <li>
              <strong>Tutor Portal Student Accounts:</strong> Students whose profiles are created programmatically by an Institute Tutor do not receive separate emails. The Principal/Tutor retains responsibility for allocating secure access codes and auditing student login activities.
            </li>
          </ul>
        </section>

        {/* Section 4: Strict Anti-Cheating & Acceptable Use */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4.5 w-4.5 text-rose-400 shrink-0" />
            <h2 className="text-sm font-bold text-rose-400 uppercase tracking-wider">4. Strict Anti-Cheating &amp; Fair Play</h2>
          </div>
          <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-950/10 space-y-2">
            <p className="font-semibold text-white">Zero Tolerance Policy for Speed/Metric Falsification:</p>
            <p>
              TypeVision exercises prepare candidates for highly competitive state, governmental, and private examinations where accuracy and physical finger speeds are vital. To protect system integrity and rankings:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li>You shall not use automatic keyboard simulators, macro script extensions, or keyboard injection bots.</li>
              <li>You shall not alter browser client scripts or use DOM manipulation tools to inject text into the typing engine container.</li>
              <li>You shall not programmatically submit forged WPM, accuracy, or timing payloads to our database APIs.</li>
            </ul>
            <p className="text-[10px] text-rose-300 font-bold">
              Violation of this policy will result in the immediate and permanent termination of your account, deletion of all historical achievements, and a potential ban on associated IP addresses/domains without refund.
            </p>
          </div>
        </section>

        {/* Section 5: Institute Tutor Portal License */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Landmark className="h-4.5 w-4.5 text-cyan-400 shrink-0" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">5. Institute &amp; Academy Management Terms</h2>
          </div>
          <p>
            For registered entities holding an active <strong>Institute Subscription Tier</strong>:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-500">
            <li>
              <strong>Scope of License:</strong> The Principal/Tutor is granted a limited, revocable, non-transferable license to create and allocate batch accounts for their enrolled students up to their active plan limits.
            </li>
            <li>
              <strong>Student Telemetry:</strong> Tutors have administrative permission to monitor accuracy metrics, WPM speed charts, and attempts logs for student accounts in their batches. It is the Tutor&rsquo;s duty to obtain appropriate parental/guardian consent if enrolling minors.
            </li>
            <li>
              <strong>Account Abuse:</strong> Subleasing, selling student slots to third-party institutions outside your physical/virtual academy, or using one slot for multiple rotating students is strictly prohibited.
            </li>
          </ul>
        </section>

        {/* Section 6: Payments, Subscriptions, and Cancellation */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4.5 w-4.5 text-cyan-400 shrink-0" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">6. Subscriptions, Payments, &amp; Cashfree Integrations</h2>
          </div>
          <p>
            TypeVision offers free practice sessions alongside paid premium options (Pro features and scalable Institute packages). Payments are securely routed via certified gateways, including <strong>Cashfree Payments</strong>.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-500">
            <li>
              <strong>Billing and Contract:</strong> Subscriptions are processed on a recurring basis (monthly or annually) according to your selected tier. You can pause or terminate renewals at any point from your billing control panel.
            </li>
            <li>
              <strong>Refund Policy:</strong> Due to the interactive nature of our training modules, all payments are final and non-refundable. We provide ample free lessons and diagnostics so users can fully test platform capabilities before subscribing.
            </li>
            <li>
              <strong>Taxation:</strong> Subscription rates are inclusive or exclusive of standard Goods and Services Tax (GST) as detailed on our invoice page.
            </li>
          </ul>
        </section>

        {/* Section 7: Intellectual Property */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Award className="h-4.5 w-4.5 text-cyan-400 shrink-0" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">7. Intellectual Property Rights</h2>
          </div>
          <p>
            All content hosted on this application—including the Typing Engine mechanism, layout overlays, interactive mockups, graphs telemetry, lessons curriculum, digital graphics, CSS styling, custom Krutidev-to-Unicode converters, and code files—remain the exclusive intellectual property of TypeVision. 
          </p>
          <p>
            You are prohibited from copying, reverse engineering, scraping, or mirroring any portion of the training interface or telemetry layouts without our express, written authorization.
          </p>
        </section>

        {/* Section 8: Warranties & Liabilities */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4.5 w-4.5 text-cyan-400 shrink-0" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">8. Disclaimer of Warranties &amp; Liabilities</h2>
          </div>
          <p>
            <strong>As-Is Services:</strong> TypeVision is provided on an &ldquo;As-Is&rdquo; and &ldquo;As-Available&rdquo; baseline. We do not warrant that our lessons lists, Krutidev letter layouts, or analytics gauges will be entirely error-free, uninterrupted, or perfectly synchronized during regional cloud outages.
          </p>
          <p>
            <strong>No Guarantee of Academic/Career Outcomes:</strong> While our training exercises align closely with official examination benchmarks, TypeVision does not guarantee that using the platform will ensure a passing score in any state service, judicial, or governmental typing exam.
          </p>
          <p>
            <strong>Liability Cap:</strong> To the maximum extent permitted by applicable law, TypeVision, its founders, and associates shall not be liable for any direct, indirect, special, or consequential damages (including loss of data, loss of business revenues, or typing muscle strains) exceeding the total subscription amount paid by you in the 3 months preceding the event.
          </p>
        </section>

        {/* Section 9: Governing Law */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Landmark className="h-4.5 w-4.5 text-cyan-400 shrink-0" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">9. Governing Law &amp; Jurisdiction</h2>
          </div>
          <p>
            These Terms &amp; Conditions and all system operations are governed by and construed in accordance with the laws of <strong>India</strong>. Any legal action, dispute, or discrepancy arising from this agreement shall be submitted to the exclusive jurisdiction of the competent courts of <strong>New Delhi, India</strong>.
          </p>
        </section>

        {/* Support Link */}
        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-slate-500">
          <span>Have questions regarding these guidelines?</span>
          <Link
            href="/contact"
            className="text-cyan-400 hover:text-cyan-300 font-bold uppercase tracking-wider transition-colors"
          >
            Contact Legal Support &rarr;
          </Link>
        </div>

      </div>
    </div>
  );
}
