import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer
} from 'recharts'
import type { SegmentSummary } from '@/api/client'

// Black × Yellow × Monochrome Palette (Zero Purple)
const COLORS = [
  '#FFD400', // Vibrant Gold/Yellow
  '#EAB308', // Warm Amber
  '#CA8A04', // Deep Gold
  '#A1A1AA', // Platinum Gray
  '#71717A', // Slate Neutral
  '#52525B', // Dark Chrome
]

interface SegmentChartProps {
  segments: SegmentSummary[]
}

export default function SegmentChart({ segments }: SegmentChartProps) {
  const data = segments.map(s => ({
    name: s.segment_name,
    value: s.user_count,
    pct: s.audience_pct,
    watchTime: s.avg_watch_time,
  }))

  const totalUsers = data.reduce((acc, curr) => acc + curr.value, 0)

  return (
    <div className="relative w-full">
      <div className="h-[270px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={72}
              outerRadius={108}
              paddingAngle={4}
              dataKey="value"
              stroke="#000000"
              strokeWidth={3}
            >
              {data.map((_, i) => (
                <Cell
                  key={i}
                  fill={COLORS[i % COLORS.length]}
                  style={{
                    filter: i === 0 ? 'drop-shadow(0 0 10px rgba(255,212,0,0.35))' : undefined,
                    cursor: 'pointer',
                  }}
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null
                const item = payload[0].payload
                return (
                  <div className="rounded-xl bg-[#080808]/95 border border-yellow-400/40 p-3 shadow-2xl backdrop-blur-xl">
                    <p className="text-xs font-bold text-white font-mono">{item.name}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs font-mono">
                      <span className="text-yellow-400 font-bold">{item.value.toLocaleString()} viewers</span>
                      <span className="text-slate-400">({item.pct.toFixed(1)}%)</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 font-mono">Avg Watch: {item.watchTime.toFixed(1)}h</p>
                  </div>
                )
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center 3D Glass Donut HUD */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400">TOTAL AUDIENCE</p>
          <p className="text-2xl font-black font-mono text-white mt-0.5 tracking-tight">
            {totalUsers.toLocaleString()}
          </p>
          <span className="text-[10px] font-mono text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded-full mt-1 border border-yellow-400/25">
            {segments.length} COHORTS
          </span>
        </div>
      </div>

      {/* Segment Legend with Audience Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/[0.08]">
        {segments.map((seg, idx) => (
          <div
            key={seg.segment_id}
            className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-yellow-400/30 transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{
                  backgroundColor: COLORS[idx % COLORS.length],
                  boxShadow: idx === 0 ? '0 0 8px rgba(255,212,0,0.5)' : undefined,
                }}
              />
              <p className="text-xs font-medium text-slate-200 truncate">{seg.segment_name}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0 font-mono text-xs">
              <span className="text-yellow-400 font-bold">{seg.audience_pct.toFixed(1)}%</span>
              <span className="text-slate-500 text-[10px]">({seg.user_count})</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
