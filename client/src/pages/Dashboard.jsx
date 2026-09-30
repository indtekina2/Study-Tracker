import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Flame, Clock, CheckCircle2, Target } from 'lucide-react';
import { getLogStats } from '../api/logs';
import { getMockTestAnalytics } from '../api/mockTests';
import StudyTimeBarChart from '../components/charts/StudyTimeBarChart';
import SubjectPieChart from '../components/charts/SubjectPieChart';
import ScoreLineChart from '../components/charts/ScoreLineChart';
import { format, subDays } from 'date-fns';

const StatCard = ({ title, value, icon: Icon, colorClass, subtitle }) => (
  <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 shadow-sm flex items-start gap-4">
    <div className={`p-3 rounded-lg ${colorClass} bg-opacity-10 dark:bg-opacity-20`}>
      <Icon className={`w-6 h-6 ${colorClass.replace('bg-', 'text-')}`} />
    </div>
    <div>
      <p className="text-sm font-medium text-[var(--muted-foreground)]">{title}</p>
      <h3 className="text-2xl font-bold text-[var(--foreground)] mt-1">{value}</h3>
      {subtitle && <p className="text-xs text-[var(--muted-foreground)] mt-1">{subtitle}</p>}
    </div>
  </div>
);

const Dashboard = () => {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['logStats'],
    queryFn: getLogStats
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['mockTestAnalytics'],
    queryFn: getMockTestAnalytics
  });

  if (statsLoading || analyticsLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-[var(--muted)] rounded w-48"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-[var(--card)] rounded-xl border border-[var(--border)]"></div>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-[var(--card)] rounded-xl border border-[var(--border)]"></div>
          <div className="h-80 bg-[var(--card)] rounded-xl border border-[var(--border)]"></div>
        </div>
        <div className="h-80 bg-[var(--card)] rounded-xl border border-[var(--border)]"></div>
      </div>
    );
  }

  // Fallback data if API returns empty
  const totalHours = stats?.totalMinutes ? Math.round(stats.totalMinutes / 60) : 0;
  
  // Format dates for charts
  const timeData = stats?.weeklyData?.map(item => ({
    date: format(new Date(item._id), 'MMM dd'),
    minutes: item.totalMinutes
  })) || [];

  const subjectData = stats?.subjectDistribution?.map(item => ({
    name: item.name || 'Unknown',
    value: item.totalMinutes,
    color: item.colorCode || 'var(--primary)'
  })) || [];

  const scoreData = analytics?.scoreTrend?.map(item => ({
    date: format(new Date(item.date), 'MMM dd'),
    percentage: Math.round(item.percentage),
    testName: item.testName
  })) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Dashboard</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Study Streak" 
          value={`${stats?.streak || 0} Days`} 
          icon={Flame} 
          colorClass="bg-orange-500 text-orange-500" 
        />
        <StatCard 
          title="Total Hours" 
          value={`${totalHours}h`} 
          icon={Clock} 
          colorClass="bg-blue-500 text-blue-500" 
        />
        <StatCard 
          title="Questions Solved" 
          value={stats?.totalQuestions || 0} 
          icon={CheckCircle2} 
          colorClass="bg-green-500 text-green-500" 
        />
        <StatCard 
          title="Avg. Accuracy" 
          value={`${Math.round(stats?.averageAccuracy || 0)}%`} 
          icon={Target} 
          colorClass="bg-purple-500 text-purple-500" 
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--card)] p-5 rounded-xl border border-[var(--border)] shadow-sm">
          <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Study Time (Last 7 Days)</h2>
          <div className="h-64">
            <StudyTimeBarChart data={timeData} />
          </div>
        </div>
        
        <div className="bg-[var(--card)] p-5 rounded-xl border border-[var(--border)] shadow-sm">
          <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Subject Distribution</h2>
          <div className="h-64">
            <SubjectPieChart data={subjectData} />
          </div>
        </div>
      </div>

      {/* Score Trend Full Width */}
      <div className="bg-[var(--card)] p-5 rounded-xl border border-[var(--border)] shadow-sm">
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Mock Test Scores</h2>
        <div className="h-72">
          <ScoreLineChart data={scoreData} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
