import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const hours = payload[0].value;
    const minutes = Math.round(hours * 60);
    const displayHours = Math.floor(minutes / 60);
    const displayMins = minutes % 60;
    
    return (
      <div className="bg-[var(--card)] p-3 border border-[var(--border)] rounded-lg shadow-sm">
        <p className="font-medium text-[var(--foreground)] mb-1">{label}</p>
        <p className="text-[var(--primary)] text-sm">
          {displayHours}h {displayMins > 0 ? `${displayMins}m` : ''}
        </p>
      </div>
    );
  }
  return null;
};

const StudyTimeBarChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center text-[var(--muted-foreground)] text-sm">
        No study time data available
      </div>
    );
  }

  // Convert minutes to hours for display
  const processedData = data.map(item => ({
    ...item,
    hours: Number((item.minutes / 60).toFixed(2))
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={processedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
        <XAxis 
          dataKey="date" 
          axisLine={false}
          tickLine={false}
          tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
          dy={10}
        />
        <YAxis 
          axisLine={false}
          tickLine={false}
          tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--accent)', opacity: 0.4 }} />
        <Bar 
          dataKey="hours" 
          fill="var(--primary)" 
          radius={[4, 4, 0, 0]}
          maxBarSize={40}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default StudyTimeBarChart;
