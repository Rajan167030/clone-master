import { MoreVertical } from "lucide-react";

interface StatCard {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string;
}

const StatCard = ({ title, value, icon, color = "blue" }: StatCard) => {
  const colorClasses = {
    blue: "text-blue-600",
    green: "text-green-600",
    purple: "text-purple-600",
    amber: "text-amber-600",
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{title}</h3>
        {icon && <div className={`text-2xl ${colorClasses[color as keyof typeof colorClasses]}`}>{icon}</div>}
      </div>
      <p className={`text-3xl font-bold ${colorClasses[color as keyof typeof colorClasses]}`}>{value}</p>
    </div>
  );
};

export default StatCard;
