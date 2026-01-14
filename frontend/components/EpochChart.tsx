'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

type EpochData = {
  epoch: number
  usdc: number
}

export function EpochChart({ data }: { data: EpochData[] }) {
  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="epoch" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="usdc"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
