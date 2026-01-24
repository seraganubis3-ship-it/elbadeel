'use client';

import {
  ResponsiveContainer,
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  Line,
  CartesianGrid,
} from 'recharts';

export type SeriesPoint = {
  key: string;
  label: string;
  revenueCents: number;
  orders: number;
  completed: number;
  pending: number;
};

export default function RechartsChart({ data }: { data: SeriesPoint[] }) {
  const chartData = data.map(d => ({
    name: d.label,
    orders: d.orders,
    revenue: d.revenueCents / 100,
  }));

  return (
    <div style={{ width: '100%', height: 320 }}>
      <ResponsiveContainer>
        <ComposedChart data={chartData} margin={{ top: 16, right: 24, bottom: 8, left: 0 }}>
          <CartesianGrid stroke='#eee' strokeDasharray='5 5' />
          <XAxis dataKey='name' tick={{ fontSize: 12 }} />
          <YAxis
            yAxisId='left'
            orientation='left'
            tick={{ fontSize: 12 }}
            label={{ value: 'طلبات', angle: -90, position: 'insideLeft', offset: 10 }}
          />
          <YAxis
            yAxisId='right'
            orientation='right'
            tick={{ fontSize: 12 }}
            label={{ value: 'الإيرادات (EGP)', angle: 90, position: 'insideRight', offset: 10 }}
          />
          <Tooltip
            formatter={(value: any, name: string) =>
              name === 'revenue'
                ? [`${Number(value).toLocaleString('ar-EG')} جنيه`, 'الإيرادات']
                : [value, 'الطلبات']
            }
          />
          <Legend />
          <Bar
            yAxisId='left'
            dataKey='orders'
            name='الطلبات'
            fill='#93c5fd'
            radius={[4, 4, 0, 0]}
          />
          <Line
            yAxisId='right'
            type='monotone'
            dataKey='revenue'
            name='الإيرادات'
            stroke='#10b981'
            strokeWidth={2}
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
