import { Outlet, NavLink } from 'react-router-dom';
import { Home, PieChart, Sliders, Clock, Settings } from 'lucide-react';
import { cn } from '../utils/cn';

export default function MainLayout() {
  const navItems = [
    { to: '/app', icon: Home, label: 'Home', end: true },
    { to: '/app/analysis', icon: PieChart, label: 'Analysis' },
    { to: '/app/simulator', icon: Sliders, label: 'Simulator' },
    { to: '/app/history', icon: Clock, label: 'History' },
    { to: '/app/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
      <div className="w-full max-w-md flex-1 pb-20 flex flex-col relative">
        <main className="flex-1 w-full overflow-y-auto scrollbar-hide">
          <Outlet />
        </main>
        
        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 w-full max-w-md bg-background/90 backdrop-blur-md border-t border-white/10 z-50">
          <div className="flex justify-between items-center px-6 py-4">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => cn(
                  "flex flex-col items-center gap-1 transition-colors duration-200",
                  isActive ? "text-white" : "text-secondaryText hover:text-white/70"
                )}
              >
                {({ isActive }) => (
                  <>
                    <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} className={isActive ? "drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]" : ""} />
                    <span className="text-[10px] font-medium">{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
