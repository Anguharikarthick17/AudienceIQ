import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts'

interface GenreChartProps {
  data: Record<string, number>
}

const COLORS = [
  '#6366f1','#8b5cf6','#06b6d4','#10b981',
  '#f59e0b','#ef4444','#ec4899','#14b8a6',
  '#84cc16','#f97316','#a78bfa','#34d399',
]

export default function GenreChart({ data }: GenreChartProps) {
  const chartData = Object.entries(data)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 12)
    .map(([genre, count]) => ({ genre, count }))

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
        <XAxis type="number" tickFormatter={v => v.toLocaleString()} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="genre" width={90} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <Tooltip
          formatter={(v: number) => [v.toLocaleString(), 'Viewers']}
          cursor={{ fill: 'rgba(99,102,241,0.05)' }}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={16}>
          {chartData.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
