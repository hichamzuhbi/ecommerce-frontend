interface BadgeProps {
  children: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

const styleMap: Record<NonNullable<BadgeProps['variant']>, string> = {
  default: 'bg-indigo-100 text-indigo-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  danger: 'bg-red-100 text-red-700',
};

export const Badge = ({ children, variant = 'default' }: BadgeProps) => {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${styleMap[variant]}`}
    >
      {children}
    </span>
  );
};
