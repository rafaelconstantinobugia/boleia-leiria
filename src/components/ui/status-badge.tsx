import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  labels: Record<string, string>;
  colors: Record<string, string>;
}

export function StatusBadge({ status, labels, colors }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        colors[status] || 'bg-gray-100 text-gray-800'
      )}
    >
      {labels[status] || status}
    </span>
  );
}
