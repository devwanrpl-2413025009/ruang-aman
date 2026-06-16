import { Home, MessageCircle, Heart, User, ShieldAlert } from "lucide-react";
import { AppView } from "../types";

interface MobileNavProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onOpenEmergency: () => void;
  userRole: "none" | "anonimus" | "bk";
}

export default function MobileNav({ currentView, onNavigate, onOpenEmergency, userRole }: MobileNavProps) {
  const navItems: { view: AppView; label: string; icon: typeof Home; show: boolean }[] = [
    { view: AppView.HOME, label: "Beranda", icon: Home, show: true },
    { view: AppView.CHAT, label: "Curhat", icon: MessageCircle, show: userRole === "anonimus" },
    { view: AppView.SELF_HELP, label: "Bantuan", icon: Heart, show: userRole === "anonimus" },
    { view: AppView.SETTINGS, label: "Setelan", icon: User, show: true },
  ];

  const visibleItems = navItems.filter((item) => item.show);

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-outline-variant/30"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-center justify-around px-2 py-1 max-w-lg mx-auto">
        {visibleItems.map((item) => {
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

        <button
          onClick={onOpenEmergency}
          className="flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl text-coral-panic hover:text-red-700 transition-all min-w-[56px]"
        >
          <ShieldAlert className="w-5 h-5" />
          <span className="text-[10px] font-semibold leading-tight">Darurat</span>
        </button>
      </div>
    </nav>
  );
}
