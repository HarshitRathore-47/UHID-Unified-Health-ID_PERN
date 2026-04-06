import {
  PieChart,
  Pie,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend
} from "recharts";
import useTheme from "../../../hooks/useTheme";

// Modern SaaS Palette for Pie Segments
const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"];

function AgeDistributionPie({ data=[] }) {
  useTheme("admin-light");

  return (
    <div className="bg-(--bg-card) p-6 rounded-4xl border border-(--border) shadow-(--shadow) h-full flex flex-col">
      <div className="mb-2">
        <h3 className="text-(--text-main) font-extrabold text-lg tracking-tight">
          Age Distribution
        </h3>
        <p className="text-(--text-muted) text-xs font-bold uppercase tracking-widest">
          Patient Demographics
        </p>
      </div>

      <div className="min[300px] w-full">
        <ResponsiveContainer width="100%" height="100%"  minWidth={280} minHeight={300}>
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="group"
              cx="50%"
              cy="50%"
              innerRadius={70} // This creates the "Donut" effect
              outerRadius={100}
              paddingAngle={5} // Spacing between segments
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                />
              ))}
            </Pie>

            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                borderRadius: '16px', 
                border: '1px solid var(--border)',
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                padding: '12px'
              }}
              itemStyle={{ fontWeight: 'bold' }}
            />
            
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="circle"
              formatter={(value) => (
                <span className="text-(--text-muted) text-xs font-bold uppercase tracking-tighter">
                  {value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default AgeDistributionPie;