import { cn } from '../utils/cn';

interface GuiltMeterProps {
  score: number;
}

export default function GuiltMeter({ score }: GuiltMeterProps) {
  // Score is 0-100
  let label = "Disciplined";
  let gradient = "from-green-500 to-green-400";
  
  if (score > 25) {
    label = "Slight Leakage";
    gradient = "from-yellow-400 to-amber-500";
  }
  if (score > 50) {
    label = "Overspending Trend";
    gradient = "from-amber-500 to-orange-500";
  }
  if (score > 75) {
    label = "Critical Burn";
    gradient = "from-orange-500 to-red-500";
  }

  return (
    <div className="flex flex-col space-y-3">
      <div className="flex justify-between items-end">
        <h3 className="text-sm font-medium text-secondaryText">Guilt Meter</h3>
        <span className="text-xs font-semibold text-white">{score}/100</span>
      </div>
      <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden relative">
        <div 
          className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-1000", gradient)}
          style={{ width: `${score}%` }}
        />
      </div>
      <p className="text-xs font-medium text-white/80">{label}</p>
    </div>
  );
}
