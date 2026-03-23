import { Users, UserPlus, Clock } from "lucide-react";

function StatsCards({ stats }) {
  const cards = [
    { 
      title: "Total Patients", 
      value: stats.totalPatients, 
      icon: Users,
      color: "text-emerald-500",
      bg: "bg-emerald-100"
    },
    { 
      title: "Total Doctors", 
      value: stats.totalDoctors, 
      icon: UserPlus,
      color: "text-blue-500", 
      bg: "bg-blue-100"
    },
    { 
      title: "Pending Doctors", 
      value: stats.pendingDoctors, 
      icon: Clock,
      color: "text-amber-500",
      bg: "bg-amber-100"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card) => {
        const Icon = card.icon;
        
        return (
          <div
            key={card.title}
            className="bg-white border border-[#e2e8f0] p-6 rounded-4xl shadow-sm hover:shadow-md transition-all duration-300 group"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[#64748b] text-xs font-bold uppercase tracking-widest mb-1">
                  {card.title}
                </p>
                <h2 className="text-3xl font-extrabold text-[#0f172a]">
                  {card.value?.toLocaleString() || 0}
                </h2>
              </div>
              
              <div className={`p-3 rounded-2xl ${card.bg} ${card.color} transition-transform group-hover:scale-110 duration-300`}>
                <Icon size={24} />
              </div>
            </div>
            
            <div className="mt-4 flex items-center gap-2">
              <div className="h-1.5 w-12 bg-[#10b981] rounded-full"></div>
              <span className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-tighter">
                Live System Data
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default StatsCards;