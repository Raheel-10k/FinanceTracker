import { cn } from '../utils/cn';
import Card from './Card';

interface StatTileProps {
  title: string;
  value: string | number;
  subtitle?: string;
  valueColor?: string;
  className?: string;
}

export default function StatTile({ title, value, subtitle, valueColor, className }: StatTileProps) {
  return (
    <Card className={cn("flex flex-col justify-between", className)}>
      <h3 className="text-sm font-medium text-secondaryText mb-2">{title}</h3>
      <div className={cn("text-2xl font-semibold mb-1", valueColor || "text-white")}>
        {value}
      </div>
      {subtitle && (
        <p className="text-xs text-secondaryText">{subtitle}</p>
      )}
    </Card>
  );
}
