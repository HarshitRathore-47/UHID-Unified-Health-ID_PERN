function MealSection({ title, items = [], color = "purple" }) {
  if (!Array.isArray(items) || items.length === 0) return null;

  const colorMap = {
    purple: "bg-purple-50 text-purple-700 border-purple-100",
    green: "bg-emerald-50 text-emerald-700 border-emerald-100",
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    red: "bg-red-50 text-red-600 border-red-100",
  };

  const badgeStyle = colorMap[color] || colorMap.purple;

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-bold uppercase tracking-wide text-slate-600">
        {title}
      </h4>

      <div className="flex flex-wrap gap-4">
        {items.map((item, index) => (
          <span
            key={`${title}-${index}`}
            className={`px-4 py-2 rounded-xl text-sm font-semibold border ${badgeStyle}`}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
export default MealSection;