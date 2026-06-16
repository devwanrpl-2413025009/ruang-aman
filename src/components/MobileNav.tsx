import { Home, MessageCircle, Heart, User, ShieldAlert } from "lucide-react";
import { AppView } from "../types";

interface MobileNavProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onOpenEmergency: () => void;
  userRole: "none" | "anonimus" | "bk";
}

export default function MobileNav({ currentView, onNavigate, onOpenEmergency, userRole }: MobileNavProps) {
  const leftItems: { view: AppView; label: string; icon: typeof Home; show: boolean }[] = [
    { view: AppView.HOME, label: "Beranda", icon: Home, show: true },
    { view: AppView.CHAT, label: "Curhat", icon: MessageCircle, show: userRole === "anonimus" },
    { view: AppView.SELF_HELP, label: "Bantuan", icon: Heart, show: userRole === "anonimus" },
  ];

  const visibleLeft = leftItems.filter((item) => item.show);

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-outline-variant/30"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-center justify-between px-3 py-1 max-w-lg mx-auto">
        {/* Left: navigation items */}
        <div className="flex items-center gap-1">
          {visibleLeft.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => onNavigate(item.view)}
                className={`flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl transition-all min-w-[56px] ${
                  isActive
                    ? "text-sage-primary"
                    : "text-charcoal-muted hover:text-charcoal-dark"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "fill-sage-primary/20" : ""}`} />
                <span className={`text-[10px] leading-tight ${isActive ? "font-bold" : "font-semibold"}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Center: Panic button prominent */}
        <button
          onClick={onOpenEmergency}
          className="flex flex-col items-center gap-0.5 py-2 px-5 rounded-xl text-coral-panic hover:bg-coral-pink/50 transition-all"
        >
          <div className="w-10 h-10 rounded-full bg-coral-pink flex items-center justify-center shadow-sm">
            <ShieldAlert className="w-5 h-5 fill-coral-panic text-coral-panic" />
          </div>
          <span className="text-[9px] font-bold leading-tight uppercase tracking-wider">Darurat</span>
        </button>

        {/* Right: Settings/Profile */}
        <button
          onClick={() => onNavigate(AppView.SETTINGS)}
          className={`flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl transition-all min-w-[56px] ${
            currentView === AppView.SETTINGS
              ? "text-sage-primary"
              : "text-charcoal-muted hover:text-charcoal-dark"
          }`}
        >
          <User className={`w-5 h-5 ${currentView === AppView.SETTINGS ? "fill-sage-primary/20" : ""}`} />
          <span className={`text-[10px] leading-tight ${currentView === AppView.SETTINGS ? "font-bold" : "font-semibold"}`}>
            Setelan
          </span>
        </button>
      </div>
    </nav>
  );
}
