import { Shield, Lock, Eye, FileText, Database, UserCheck, HardDrive, HelpCircle } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 w-full space-y-12 min-h-screen">
      {/* Decorative Glow */}
      <div className="absolute top-1/4 left-1/2 -z-10 h-[300px] w-[500px] -translate-x-1/2 rounded-full bg-cyan-500/5 blur-[120px]"></div>
      <div className="absolute bottom-1/4 left-1/4 -z-10 h-[300px] w-[400px] rounded-full bg-indigo-500/5 blur-[120px]"></div>

      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/20 bg-cyan-950/20 px-3.5 py-1 text-xs font-semibold text-cyan-400">
          <Shield className="h-3.5 w-3.5" />
          <span>Privacy Center</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">Privacy Policy</h1>
        <p className="text-xs text-slate-400">Effective Date: May 25, 2026</p>
      </div>

      {/* Document Body */}
      <div className="rounded-2xl border border-white/5 bg-slate-900/10 p-6 sm:p-10 shadow-xl backdrop-blur-sm space-y-10 text-left text-xs leading-relaxed text-slate-400">
        
        {/* Core highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 border-b border-white/5 pb-8">
          <div className="flex gap-2.5 items-start">
            <Lock className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-white mb-0.5">Secure Storage</h4>
              <p className="text-[10px] text-slate-500">Your profile and analytics telemetry are secured by Supabase RLS policies.</p>
            </div>
          </div>
          <div className="flex gap-2.5 items-start">
            <Eye className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-white mb-0.5">No Third-Party Sales</h4>
              <p className="text-[10px] text-slate-500">We never rent, trade, lease, or sell student records or typing telemetry to anyone.</p>
            </div>
          </div>
          <div className="flex gap-2.5 items-start">
            <FileText className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-white mb-0.5">Transparent Analytics</h4>
              <p className="text-[10px] text-slate-500">Keystroke speeds are logged exclusively to plot progress charts and audit errors.</p>
            </div>
          </div>
        </div>

        {/* Section 1: Intro */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Shield className="h-4.5 w-4.5 text-cyan-400 shrink-0" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">1. Commitment to Privacy</h2>
          </div>
          <p>
            At TypeVision (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;), we take the security and privacy of our typists, educational institutions, and student members very seriously. This Privacy Policy details the exact mechanisms we utilize to gather, store, secure, process, and delete information collected when you interact with our typing applications, analytics gauges, and subscription models.
          </p>
          <p>
            We strictly limit data collection to parameters necessary to power our typing engines, track speeds, prepare students for Krutidev legacy examinations, and enable tutors to audit class progression.
          </p>
        </section>

        {/* Section 2: Data Collection */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Database className="h-4.5 w-4.5 text-cyan-400 shrink-0" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">2. Information We Collect</h2>
          </div>
          <p>
            We classify the collected data into distinct, transparent categories:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-500">
            <li>
              <strong>Personal Identity Profile Data:</strong> Email Address, Display Name, Mobile Number (`mobile_no`), and Date of Birth (`dob`) provided during account sign-up and tutor profile validation.
            </li>
            <li>
              <strong>Typing Telemetry Data:</strong> Speed ratings (Words Per Minute / WPM), character accuracy ratios, specific keystroke timings, detailed error lists (characters missed), completed exercise ids, time elapsed per run, and level achievements.
            </li>
            <li>
              <strong>Tutor Portal and Student Metadata:</strong> For educational deployments, we record the associated Institute Name, batch labels created by Tutors, and student account rosters generated under the Principal&rsquo;s console.
            </li>
            <li>
              <strong>Transaction &amp; Billing Data:</strong> Premium updates require standard payment handling. All payments are processed by secure, PCI-compliant third-party operators (such as **Cashfree Payments**). TypeVision never registers, stores, or handles raw credit/debit card numbers.
            </li>
          </ul>
        </section>

        {/* Section 3: Usage of Data */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <UserCheck className="h-4.5 w-4.5 text-cyan-400 shrink-0" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">3. How We Process Your Data</h2>
          </div>
          <p>
            TypeVision uses the collected metrics and personal descriptors strictly for educational, security, and administrative tasks:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-500">
            <li>To map WPM improvement timelines and plot accuracy curves on your dashboards.</li>
            <li>To compile leaderboard rankings and deliver speed achievements.</li>
            <li>To enable Tutors to audit batch telemetry, monitor student practice schedules, and analyze mistake areas.</li>
            <li>To verify emails via secure OTP codes to maintain clean database schemas.</li>
            <li>To diagnose engine performance bottlenecks and optimize Remington Krutidev text input synchronization.</li>
          </ul>
        </section>

        {/* Section 4: Data Security */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Lock className="h-4.5 w-4.5 text-cyan-400 shrink-0" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">4. Database Architecture &amp; Security Guards</h2>
          </div>
          <p>
            Your information is stored inside high-security cloud database centers managed by <strong>Supabase</strong>. 
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-500">
            <li>
              <strong>Row-Level Security (RLS):</strong> Access to personal records, typing scores, and analytics profiles is guarded dynamically by database RLS rules. No user or third party can read or modify your telemetry logs without authenticated credential matches.
            </li>
            <li>
              <strong>Transit Protection:</strong> All API communications between your browser, the typing engine, and our cloud endpoints are locked using industry-standard SSL/TLS encryption.
            </li>
          </ul>
        </section>

        {/* Section 5: Third-Party Disclosures */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Eye className="h-4.5 w-4.5 text-cyan-400 shrink-0" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">5. Third-Party Sharing Rules</h2>
          </div>
          <p>
            We hold a strict policy regarding corporate and advertiser sharing:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-500">
            <li><strong>Zero Commercial Disclosures:</strong> We do not sell, trade, lease, rent, or distribute user lists, email registries, or typing records to marketing firms or advertising agencies.</li>
            <li><strong>Service Integrations:</strong> Data is shared only with verified infrastructure providers needed directly to run the platform (e.g., Supabase for hosting authentication, Cashfree for processing transactional fees).</li>
            <li><strong>Legal Mandates:</strong> We may disclose information if required strictly under legal statutes, governmental audits, or court orders located inside the territory of India.</li>
          </ul>
        </section>

        {/* Section 6: Children's Privacy */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Lock className="h-4.5 w-4.5 text-cyan-400 shrink-0" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">6. Student &amp; Minors Privacy Protection</h2>
          </div>
          <p>
            TypeVision is widely deployed inside physical typing academies and computer centers. When school/college students are enrolled programmatically by Tutors:
          </p>
          <p>
            We require no personal student emails or social logins. Tutors generate basic, non-personally identifiable usernames (such as `vision_student01`) to log in. This completely isolates the student&rsquo;s identity from online trackers and maintains a safe, educational learning environment.
          </p>
        </section>

        {/* Section 7: User Choices */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <HardDrive className="h-4.5 w-4.5 text-cyan-400 shrink-0" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">7. Control Rights &amp; Data Deletion</h2>
          </div>
          <p>
            We recognize your absolute ownership over your metrics and personal accounts:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-500">
            <li><strong>Profile Editing:</strong> You can edit your display name, password, or contact parameters at any time from your settings panel.</li>
            <li><strong>Telemetry Purge:</strong> If you wish to permanently purge all logged typing metrics, erase speed histories, and close your account registry forever, you can contact our privacy administrators. We will process your purging requests within 7 working days.</li>
          </ul>
        </section>

        {/* Section 8: Policy Contact */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-4.5 w-4.5 text-cyan-400 shrink-0" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">8. Contact Information</h2>
          </div>
          <p>
            If you have any questions about this Privacy Policy, your recorded biometric/keystroke metrics, or our data storage rules, feel free to contact us:
          </p>
          <div className="p-4 rounded-xl border border-white/5 bg-slate-950/40 text-xs space-y-1">
            <p className="font-bold text-white">TypeVision Security Panel</p>
            <p className="text-slate-400">Email: support@typevision.com</p>
            <p className="text-slate-450">Location: New Delhi, India</p>
          </div>
        </section>

        {/* Privacy Policy Bottom Info */}
        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-slate-500">
          <span>Need to check our overall guidelines?</span>
          <Link
            href="/terms"
            className="text-cyan-400 hover:text-cyan-300 font-bold uppercase tracking-wider transition-colors"
          >
            View Terms of Service &rarr;
          </Link>
        </div>

      </div>
    </div>
  );
}
