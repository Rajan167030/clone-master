import { MoreVertical } from "lucide-react";

interface PortfolioItem {
  startupName: string;
  investment: string | number;
  date: string;
}

interface PortfolioTableProps {
  title: string;
  items: PortfolioItem[];
  showRiskSpread?: boolean;
}

const PortfolioTable = ({ title, items, showRiskSpread }: PortfolioTableProps) => {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-blue-600">{title}</h3>
        {showRiskSpread && (
          <>
            <div className="flex items-center gap-4 ml-auto">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                <span className="text-slate-600">High</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full bg-green-600"></div>
                <span className="text-slate-600">Medium</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full bg-violet-400"></div>
                <span className="text-slate-600">Low</span>
              </div>
            </div>
          </>
        )}
        <button className="p-1 text-slate-400 hover:text-slate-600">
          <MoreVertical size={20} />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Startup Name</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Investment</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Date</th>
            </tr>
          </thead>
          <tbody>
            {items.length > 0 ? (
              items.map((item, index) => (
                <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 text-sm text-slate-900">{item.startupName}</td>
                  <td className="py-3 px-4 text-sm text-slate-600">{item.investment}</td>
                  <td className="py-3 px-4 text-sm text-slate-600">{item.date}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="py-8 px-4 text-center text-slate-500 text-sm">
                  No {title.toLowerCase()} yet!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PortfolioTable;
