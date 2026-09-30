import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[var(--card)] p-3 border border-[var(--border)] rounded-lg shadow-sm flex items-center gap-2">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.color || 'var(--primary)' }} />
        <span className="font-medium text-[var(--foreground)]">{data.name}:</span>
        <span className="text-[var(--muted-foreground)]">{data.value} mins</span>
      </div>
    );
  }
  return null;
};

const SubjectPieChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center text-[var(--muted-foreground)] text-sm">
        No subject distribution data
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color || 'var(--primary)'} stroke="transparent" />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          verticalAlign="bottom" 
          height={36} 
          iconType="circle"
          wrapperStyle={{ fontSize: '12px', color: 'var(--foreground)' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default SubjectPieChart;
