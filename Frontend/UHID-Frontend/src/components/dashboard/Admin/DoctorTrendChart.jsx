import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell
} from "recharts";
import useTheme from "../../../hooks/useTheme";

function DoctorTrendChart({ data }) {
  useTheme("admin-light");

  return (
    <div className="bg-(--bg-card) p-6 rounded-4xl border border-(--border) shadow-(--shadow)">
      <div className="mb-6">
        <h3 className="text-(--text-main) font-extrabold text-lg tracking-tight">
          Doctor Registration Trend
        </h3>
        <p className="text-(--text-muted) text-xs font-bold uppercase tracking-widest">
          Monthly Professional Onboarding
        </p>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={false} 
              stroke="var(--border)" 
            />
            
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--text-muted)', fontSize: 11, fontWeight: 700 }}
              dy={10}
            />
            
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--text-muted)', fontSize: 11, fontWeight: 700 }}
            />
            
            <Tooltip 
              cursor={{ fill: 'var(--bg-main)', radius: 12 }}
              contentStyle={{ 
                backgroundColor: 'white', 
                borderRadius: '16px', 
                border: '1px solid var(--border)',
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                padding: '12px'
              }}
              itemStyle={{ color: 'var(--primary)', fontWeight: 'bold' }}
              labelStyle={{ fontWeight: 'bold', marginBottom: '4px', color: 'var(--text-main)' }}
            />
            
            <Bar
              dataKey="count"
              fill="var(--primary)"
              radius={[10, 10, 0, 0]} // Top rounded corners for "Capsule" look
              barSize={32}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill="var(--primary)" 
                  fillOpacity={0.8 + (index % 2 === 0 ? 0.2 : 0)} // Subtle alternating opacity for depth
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default DoctorTrendChart;