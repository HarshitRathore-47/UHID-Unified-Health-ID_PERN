import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  AreaChart
} from "recharts";
import useTheme from "../../../hooks/useTheme";

function PatientTrendChart({ data }) {
  useTheme("admin-light");

  return (
    <div className="bg-(--bg-card) p-6 rounded-4xl border border-(--border) shadow-(--shadow)">
      <div className="mb-6">
        <h3 className="text-(--text-main) font-extrabold text-lg tracking-tight">
          Patient Registration Trend
        </h3>
        <p className="text-(--text-muted) text-xs font-bold uppercase tracking-widest">
          Monthly Growth Overview
        </p>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            
            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={false} 
              stroke="var(--border)" 
            />
            
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--text-muted)', fontSize: 12, fontWeight: 600 }}
              dy={10}
            />
            
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--text-muted)', fontSize: 12, fontWeight: 600 }}
            />
            
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                borderRadius: '16px', 
                border: '1px solid var(--border)',
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' 
              }}
              itemStyle={{ color: 'var(--primary)', fontWeight: 'bold' }}
            />
            
            <Area
              type="monotone"
              dataKey="count"
              stroke="var(--primary)"
              strokeWidth={4}
              fillOpacity={1}
              fill="url(#colorCount)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default PatientTrendChart;