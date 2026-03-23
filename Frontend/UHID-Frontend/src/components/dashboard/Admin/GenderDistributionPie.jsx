import {
  PieChart,
  Pie,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";
import useTheme from "../../../hooks/useTheme";

// Modern SaaS Palette for Gender (Blue for male, Rose for female)
const COLORS = ["#3b82f6", "#f43f5e", "#f59e0b", "#10b981"];

function GenderDistributionPie({ data }) {
  useTheme("admin-light");

  // Check if at least one gender has a non-zero count
  const hasData = data && data.some((item) => item.count > 0);

  return (
    <div className="bg-(--bg-card) p-6 rounded-4xl border border-(--border) shadow-(--shadow) h-full flex flex-col">
      <div className="mb-2">
        <h3 className="text-(--text-main) font-extrabold text-lg tracking-tight">
          Gender Distribution
        </h3>
        <p className="text-(--text-muted) text-xs font-bold uppercase tracking-widest">
          Platform User Diversity
        </p>
      </div>

      <div className="flex-1 min-h-[300px] w-full flex items-center justify-center">
        {!hasData ? (
          <div className="text-center">
            <p className="text-(--text-muted) text-sm font-bold italic">
              No Data Available
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="count"
                nameKey="gender"
                cx="50%"
                cy="50%"
                innerRadius={75}
                outerRadius={100}
                paddingAngle={
                  data.filter((d) => d.count > 0).length > 1 ? 8 : 0
                }
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    className="hover:opacity-80 transition-opacity cursor-pointer outline-none"
                  />
                ))}
              </Pie>

              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  borderRadius: "16px",
                  border: "1px solid var(--border)",
                  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                  padding: "12px",
                }}
                itemStyle={{ fontWeight: "bold", fontSize: "12px" }}
                cursor={{ fill: "transparent" }}
              />

              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                iconSize={8}
                // Consistency Fix: Remove bracket and show only label name
                formatter={(value) => (
                  <span className="text-(--text-muted) text-[10px] font-extrabold uppercase tracking-widest ml-1">
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export default GenderDistributionPie;
