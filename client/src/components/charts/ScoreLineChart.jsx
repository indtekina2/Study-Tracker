import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[var(--card)] p-3 border border-[var(--border)] rounded-lg shadow-sm">
        <p className="font-semibold text-[var(--foreground)] mb-1">{data.testName || label}</p>
        <p className="text-[var(--primary)] font-medium">Score: {payload[0].value}%</p>
        {data.date && <p className="text-xs text-[var(--muted-foreground)] mt-1">{data.date}</p>}
      </div>
    );
  }
  return null;
};

const ScoreLineChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center text-[var(--muted-foreground)] text-sm">
        No score data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
        <XAxis 
          dataKey="date" 
          axisLine={false}
          tickLine={false}
          tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
          dy={10}
        />
        <YAxis 
          domain={[0, 100]} 
          axisLine={false}
          tickLine={false}
          tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="percentage"
          stroke="var(--primary)"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorScore)"
          activeDot={{ r: 6, fill: 'var(--primary)', stroke: 'var(--background)', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default ScoreLineChart;
