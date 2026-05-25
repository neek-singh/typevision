import React from 'react';
import { Check, Minus } from 'lucide-react';

interface PricingComparisonProps {
  activeCategory?: 'student' | 'institute';
}

export default function PricingComparison({ activeCategory = 'student' }: PricingComparisonProps) {
  const isStudent = activeCategory === 'student';

  const studentCategories = [
    {
      title: 'Practice & Learning Modules',
      rows: [
        { feature: 'English typing practice & lessons', free: true, explorer: true, pro: true, elite: true },
        { feature: 'Hindi Krutidev Remington keyboard support', free: true, explorer: true, pro: true, elite: true },
        { feature: 'Real-time WPM speed & accuracy check', free: true, explorer: true, pro: true, elite: true },
        { feature: 'Custom paragraph/text uploads', free: false, explorer: false, pro: true, elite: true },
        { feature: 'Simulated government typing exam mode', free: false, explorer: false, pro: false, elite: true },
      ],
    },
    {
      title: 'Telemetry & Progress tracking',
      rows: [
        { feature: 'Typing history logs count', free: 'Latest 10 logs', explorer: 'Latest 50 logs', pro: 'Unlimited logs', elite: 'Unlimited logs' },
        { feature: 'Interactive speed progression charts', free: false, explorer: false, pro: true, elite: true },
      ],
    },
  ];

  const instituteCategories = [
    {
      title: 'Classroom Deployment',
      rows: [
        { feature: 'Student accounts access capacity', starter: 'Up to 5 accounts', standard: 'Up to 25 accounts', premium: 'Up to 50 accounts', academic: 'Up to 100 accounts', gov: 'Up to 150 accounts' },
        { feature: 'English & Hindi typing lessons access', starter: true, standard: true, premium: true, academic: true, gov: true },
        { feature: 'Real-time WPM speed & accuracy check', starter: true, standard: true, premium: true, academic: true, gov: true },
      ],
    },
    {
      title: 'Batch Management & Reports',
      rows: [
        { feature: 'Student attempt logs history access', starter: true, standard: true, premium: true, academic: true, gov: true },
        { feature: 'Classroom batch creation controls', starter: false, standard: true, premium: true, academic: true, gov: true },
        { feature: 'Multi-student progression curve reports', starter: false, standard: false, premium: true, academic: true, gov: true },
      ],
    },
    {
      title: 'Enterprise Integrations',
      rows: [
        { feature: 'Custom white-labeled portal subdomain', starter: false, standard: false, premium: false, academic: true, gov: false },
        { feature: 'Offline intranet client application support', starter: false, standard: false, premium: false, academic: false, gov: true },
      ],
    },
  ];

  const categories = isStudent ? studentPlansRows(studentCategories) : institutePlansRows(instituteCategories);

  // Helper type conversions for safe mapping
  function studentPlansRows(cats: typeof studentCategories) {
    return cats.map(cat => ({
      title: cat.title,
      rows: cat.rows.map(row => ({
        feature: row.feature,
        columns: [
          { name: 'Free', val: row.free },
          { name: 'Daily Explorer', val: row.explorer },
          { name: 'Pro (Recommended)', val: row.pro, highlight: true },
          { name: 'Elite Typist', val: row.elite }
        ]
      }))
    }));
  }

  function institutePlansRows(cats: typeof instituteCategories) {
    return cats.map(cat => ({
      title: cat.title,
      rows: cat.rows.map(row => ({
        feature: row.feature,
        columns: [
          { name: 'Starter Group', val: row.starter },
          { name: 'Standard Classroom', val: row.standard },
          { name: 'Premium Hub (Recommended)', val: row.premium, highlight: true },
          { name: 'Academic Enterprise', val: row.academic },
          { name: 'Government Org', val: row.gov }
        ]
      }))
    }));
  }

  const columns = isStudent 
    ? ['Free', 'Daily Explorer', 'Pro (Recommended)', 'Elite Typist'] 
    : ['Starter Group', 'Standard Classroom', 'Premium Hub (Recommended)', 'Academic Enterprise', 'Government Org'];

  const renderValue = (val: string | boolean) => {
    if (typeof val === 'boolean') {
      return val ? (
        <Check className="h-4 w-4 text-cyan-400 mx-auto stroke-[2.5px]" />
      ) : (
        <Minus className="h-4 w-4 text-slate-600 mx-auto" />
      );
    }
    return <span className="text-slate-300 text-xs font-semibold">{val}</span>;
  };

  return (
    <div className="space-y-8 text-left">
      <div className="text-center">
        <h2 className="text-2xl font-extrabold text-white">Compare Plan Specifications</h2>
        <p className="text-xs text-slate-400 mt-2">
          Get a detailed comparison of features across our tailored {isStudent ? 'Student' : 'Institute'} tiers.
        </p>
      </div>

      {/* Desktop Comparison Table (hidden on mobile/tablet viewports) */}
      <div className="hidden lg:block rounded-3xl border border-white/5 bg-slate-900/10 overflow-hidden shadow-2xl backdrop-blur-sm">
        <table className="w-full text-center border-collapse">
          <thead>
            <tr className="bg-slate-900/40 border-b border-white/5 text-xs font-bold text-slate-300">
              <th className="px-6 py-5 text-left w-1/4">Features</th>
              {columns.map((col, index) => (
                <th 
                  key={index} 
                  className={`px-6 py-5 ${col.includes('Recommended') ? 'text-cyan-400 bg-cyan-500/[0.02]' : ''}`}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {categories.map((cat, catIndex) => (
              <React.Fragment key={catIndex}>
                {/* Category Header Row */}
                <tr className="bg-slate-950/50">
                  <td colSpan={columns.length + 1} className="px-6 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {cat.title}
                  </td>
                </tr>
                {cat.rows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-white/[0.02] transition-colors text-xs">
                    <td className="px-6 py-4 text-left font-medium text-slate-300">{row.feature}</td>
                    {row.columns.map((col, colIndex) => (
                      <td 
                        key={colIndex} 
                        className={col.highlight ? 'bg-cyan-500/[0.02]' : ''}
                      >
                        {renderValue(col.val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Responsive Accordion lists (shown on mobile/tablet viewports) */}
      <div className="block lg:hidden space-y-6">
        {categories.map((cat, catIndex) => (
          <div key={catIndex} className="rounded-2xl border border-white/5 bg-slate-900/20 p-4 space-y-4">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider border-b border-white/5 pb-2">
              {cat.title}
            </h3>
            
            <div className="divide-y divide-white/5 space-y-3.5">
              {cat.rows.map((row, rowIndex) => (
                <div key={rowIndex} className="pt-3.5 first:pt-0 space-y-2 text-xs text-left">
                  <h4 className="font-bold text-white">{row.feature}</h4>
                  
                  <div className={`grid gap-2 text-center text-[9px] ${
                    isStudent ? 'grid-cols-4' : 'grid-cols-5'
                  }`}>
                    {row.columns.map((col, colIndex) => (
                      <div 
                        key={colIndex} 
                        className={`rounded-lg p-2 border ${
                          col.highlight 
                            ? 'bg-cyan-950/20 border-cyan-500/20 text-cyan-400' 
                            : 'bg-slate-950/60 border-white/5 text-slate-500'
                        }`}
                      >
                        <span className="block font-bold mb-1 uppercase tracking-wide truncate">
                          {col.name.replace(' (Recommended)', '')}
                        </span>
                        <div className="flex h-5 items-center justify-center">
                          {renderValue(col.val)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
