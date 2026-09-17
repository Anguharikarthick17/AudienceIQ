import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts'

interface GenreChartProps {
  data: Record<string, number>
}

export default function GenreChart({ data }: GenreChartProps) {
  const chartData = Object.entries(data)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([genre, count], index) => ({
      genre,
      count,
      isTop: index < 3,
    }))

  const maxCount = Math.max(...chartData.map(d => d.count), 1)

  return (
    <div className="w-full">
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ left: 10, right: 35, top: 4, bottom: 4 }}
          >
            <defs>
              <linearGradient id="yellowBarGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#CA8A04" />
                <stop offset="60%" stopColor="#EAB308" />
                <stop offset="100%" stopColor="#FFD400" />
              </linearGradient>
              <linearGradient id="darkBarGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#1E1E1E" />
                <stop offset="100%" stopColor="#3F3F46" />
              </linearGradient>
            </defs>
            <XAxis
              type="number"
              domain={[0, maxCount * 1.1]}
              tickFormatter={v => v.toLocaleString()}
              tick={{ fontSize: 10, fill: '#71717A', fontFamily: 'JetBrains Mono' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="genre"
              width={95}
              tick={{ fontSize: 11, fill: '#D4D4D8', fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: 'rgba(255, 212, 0, 0.05)' }}
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null
                const d = payload[0].payload
                const pct = ((d.count / maxCount) * 100).toFixed(1)
                return (
                  <div className="rounded-xl bg-[#080808]/95 border border-yellow-400/40 p-3 shadow-2xl backdrop-blur-xl font-mono">
                    <p className="text-xs font-bold text-white">{d.genre}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-bold text-yellow-400">{d.count.toLocaleString()}</span>
                      <span className="text-xs text-slate-400">viewers ({pct}% rel)</span>
                    </div>
                  </div>
                )
              }}
            />
            <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={18}>
              {chartData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.isTop ? 'url(#yellowBarGradient)' : 'url(#darkBarGradient)'}
                  style={{
                    filter: entry.isTop ? 'drop-shadow(0 0 6px rgba(255,212,0,0.3))' : undefined,
                  }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-3 border-t border-white/[0.06] mt-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-sm bg-gradient-to-r from-amber-500 to-yellow-400 shadow-[0_0_6px_#FFD400]" />
          <span className="text-slate-300">Top 3 Primary Drivers</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-sm bg-zinc-700" />
          <span className="text-slate-400">Secondary Affinities</span>
        </div>
      </div>
    </div>
  )
}
