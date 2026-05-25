'use client';

interface ChartPoint {
  wpm: number;
  accuracy: number;
  date: string;
}

interface CustomChartProps {
  data: ChartPoint[];
}

export default function CustomChart({ data }: CustomChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-white/5 bg-slate-900/50 text-slate-400">
        No history data available. Complete lessons to see your progress!
      </div>
    );
  }

  // Configuration sizes
  const width = 600;
  const height = 240;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Find min/max values for scaling
  const maxWpm = Math.max(...data.map((d) => d.wpm), 60); // Min max wpm scale 60
  const maxAcc = 100;
  
  // X scale mapping index to coordinate
  const getX = (index: number) => {
    if (data.length <= 1) return paddingLeft + chartWidth / 2;
    return paddingLeft + (index / (data.length - 1)) * chartWidth;
  };

  // Y scale mapping value to coordinate
  const getY = (val: number, max: number) => {
    return paddingTop + chartHeight - (val / max) * chartHeight;
  };

  // Build SVG Paths
  let wpmPath = '';
  let accPath = '';
  let wpmAreaPath = '';
  let accAreaPath = '';

  data.forEach((d, i) => {
    const x = getX(i);
    const yWpm = getY(d.wpm, maxWpm);
    const yAcc = getY(d.accuracy, maxAcc);

    if (i === 0) {
      wpmPath = `M ${x} ${yWpm}`;
      accPath = `M ${x} ${yAcc}`;
      wpmAreaPath = `M ${x} ${paddingTop + chartHeight} L ${x} ${yWpm}`;
      accAreaPath = `M ${x} ${paddingTop + chartHeight} L ${x} ${yAcc}`;
    } else {
      wpmPath += ` L ${x} ${yWpm}`;
      accPath += ` L ${x} ${yAcc}`;
    }

    if (i === data.length - 1) {
      wpmAreaPath += `${wpmPath.substring(1)} L ${x} ${paddingTop + chartHeight} Z`;
      accAreaPath += `${accPath.substring(1)} L ${x} ${paddingTop + chartHeight} Z`;
    }
  });

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-slate-950 p-6 shadow-2xl">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Progression History</h3>
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]"></span>
            <span className="text-slate-300">WPM</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]"></span>
            <span className="text-slate-300">Accuracy (%)</span>
          </div>
        </div>
      </div>

      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="mx-auto min-w-[500px] overflow-visible"
        >
          {/* Definitions for Gradients and Glows */}
          <defs>
            <linearGradient id="wpmGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="accGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#34d399" stopOpacity="0.0" />
            </linearGradient>
            <filter id="glowWpm" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#22d3ee" floodOpacity="0.5" />
            </filter>
            <filter id="glowAcc" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#34d399" floodOpacity="0.5" />
            </filter>
          </defs>

          {/* Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = paddingTop + ratio * chartHeight;
            return (
              <line
                key={ratio}
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                className="stroke-white/5 stroke-1 stroke-dasharray"
                strokeDasharray="4 4"
              />
            );
          })}

          {/* Y Axis Labels (WPM - Left) */}
          <text x={paddingLeft - 10} y={getY(maxWpm, maxWpm) + 4} className="text-[10px] fill-slate-400 font-semibold text-right" textAnchor="end">
            {maxWpm}
          </text>
          <text x={paddingLeft - 10} y={getY(maxWpm / 2, maxWpm) + 4} className="text-[10px] fill-slate-400 font-semibold text-right" textAnchor="end">
            {Math.round(maxWpm / 2)}
          </text>
          <text x={paddingLeft - 10} y={getY(0, maxWpm) - 2} className="text-[10px] fill-slate-400 font-semibold text-right" textAnchor="end">
            0
          </text>

          {/* Paths and Areas */}
          {data.length > 1 && (
            <>
              {/* Areas first */}
              <path d={wpmAreaPath} fill="url(#wpmGrad)" />
              <path d={accAreaPath} fill="url(#accGrad)" />

              {/* Lines */}
              <path d={wpmPath} fill="none" stroke="#22d3ee" strokeWidth="2.5" filter="url(#glowWpm)" strokeLinecap="round" strokeLinejoin="round" />
              <path d={accPath} fill="none" stroke="#34d399" strokeWidth="2.5" filter="url(#glowAcc)" strokeLinecap="round" strokeLinejoin="round" />
            </>
          )}

          {/* Points & Hovers */}
          {data.map((d, i) => {
            const x = getX(i);
            const yWpm = getY(d.wpm, maxWpm);
            const yAcc = getY(d.accuracy, maxAcc);

            return (
              <g key={i}>
                {/* WPM dot */}
                <circle cx={x} cy={yWpm} r="4" className="fill-slate-950 stroke-cyan-400 stroke-2 cursor-pointer hover:r-6 transition-all duration-200" />
                {/* Accuracy dot */}
                <circle cx={x} cy={yAcc} r="4" className="fill-slate-950 stroke-emerald-400 stroke-2 cursor-pointer hover:r-6 transition-all duration-200" />

                {/* X Axis ticks */}
                {data.length <= 8 || i % Math.ceil(data.length / 8) === 0 ? (
                  <text
                    x={x}
                    y={height - paddingBottom + 20}
                    className="text-[9px] fill-slate-500 font-semibold"
                    textAnchor="middle"
                  >
                    {d.date}
                  </text>
                ) : null}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
