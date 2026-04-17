import Card from '../components/Card';

export default function History() {
  const historyData = [
    { month: 'April 2024', score: 72, guilt: 71, runway: '8 days', trend: 'declining' },
    { month: 'March 2024', score: 81, guilt: 48, runway: '14 days', trend: 'improving' },
    { month: 'February 2024', score: 78, guilt: 55, runway: '12 days', trend: 'stable' },
  ];

  return (
    <div className="p-6 pt-12 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold mb-1">History</h1>
        <p className="text-sm text-secondaryText">Past statement analyses.</p>
      </header>

      <div className="space-y-4">
        {historyData.map((item, i) => (
          <Card key={i} className="flex flex-col gap-3">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <h3 className="font-medium text-white">{item.month}</h3>
              <span className={`text-[10px] uppercase px-2 py-0.5 rounded-full font-medium tracking-wider
                ${item.trend === 'improving' ? 'bg-success/20 text-success' : 
                  item.trend === 'declining' ? 'bg-danger/20 text-danger' : 
                  'bg-white/10 text-white/70'}`}
              >
                {item.trend}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div>
                <p className="text-[10px] text-secondaryText uppercase mb-1">Score</p>
                <p className="font-semibold text-white">{item.score}</p>
              </div>
              <div>
                <p className="text-[10px] text-secondaryText uppercase mb-1">Guilt</p>
                <p className="font-semibold text-white">{item.guilt}</p>
              </div>
              <div>
                <p className="text-[10px] text-secondaryText uppercase mb-1">Runway</p>
                <p className="font-semibold text-white">{item.runway}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
