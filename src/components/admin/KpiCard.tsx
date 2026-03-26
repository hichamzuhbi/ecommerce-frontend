import type { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  iconClassName: string;
}

export const KpiCard = ({ title, value, icon: Icon, iconClassName }: KpiCardProps) => {
  return (
    <article className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-500">{title}</p>
          <h3 className="mt-1 text-2xl font-bold text-gray-900">{value}</h3>
        </div>
        <div className={`rounded-xl p-3 ${iconClassName}`}>
          <Icon size={20} />
        </div>
      </div>
    </article>
  );
};
