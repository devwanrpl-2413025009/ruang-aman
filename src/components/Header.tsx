import { ShieldAlert, Heart, Activity, User, AppWindow } from "lucide-react";
import { AppView } from "../types";

interface HeaderProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onOpenEmergency: () => void;
  studentId: string;
  userRole: "none" | "anonimus" | "bk";
  onActivateBK: () => void;
}

export default function Header({
  currentView,
  onNavigate,
  onOpenEmergency,
  studentId,
  userRole,
  onActivateBK,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-outline-variant/30 transition-all">
      <div className="flex items-center justify-between px-4 md:px-20 py-2 md:py-4 max-w-7xl mx-auto w-full">
        {/* Brand Group */}
        <button
          onClick={() => onNavigate(AppView.HOME)}
          className="flex items-center gap-2 cursor-pointer hover:opacity-85 transition-opacity text-left shrink-0"
          id="nav-logo"
        >
          <img
            src="/logo-unila.png"
            alt="Logo Unila"
            className="w-7 h-7 md:w-10 md:h-10 rounded-full object-cover border border-sage-light"
          />
          <div className="hidden sm:block">
            <h1 className="font-display font-extrabold text-sm md:text-xl text-charcoal-dark tracking-tight leading-none">
              Ruang Aman BK Unila
            </h1>
            <span className="text-[9px] md:text-[10px] uppercase font-mono tracking-wider text-sage-primary block">
              {userRole === "bk" ? "BK atau Staff Terhubung" : "Safe Haven"}
            </span>
          </div>
        </button>

        {/* Main Navigation - Center */}
        {userRole !== "bk" && (
        <nav className="hidden md:flex items-center gap-1 bg-background-soft p-1 rounded-full border border-outline-variant/20">
          <button
            onClick={() => onNavigate(AppView.HOME)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
              currentView === AppView.HOME
                ? "bg-white text-charcoal-dark shadow-sm"
                : "text-charcoal-muted hover:text-charcoal-dark"
            }`}
          >
            Beranda
          </button>
          {userRole === "anonimus" && (
            <>
          <button
            onClick={() => onNavigate(AppView.CHAT)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
              currentView === AppView.CHAT
                ? "bg-white text-charcoal-dark shadow-sm"
                : "text-charcoal-muted hover:text-charcoal-dark"
            }`}
          >
            Bilik Curhat
          </button>
          <button
            onClick={() => onNavigate(AppView.SELF_HELP)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
              currentView === AppView.SELF_HELP
                ? "bg-white text-charcoal-dark shadow-sm"
                : "text-charcoal-muted hover:text-charcoal-dark"
            }`}
          >
            Bantuan Mandiri
          </button>
          </>
          )}
          {userRole !== "anonimus" && (
          <button
            onClick={onActivateBK}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
              currentView === AppView.COUNSELOR_PORTAL
                ? "bg-sage-primary text-white shadow-sm"
                : "text-sage-primary hover:bg-sage-light/30"
            }`}
          >
            Portal BK
          </button>
          )}
        </nav>
        )}

        {/* Global Toolbar */}
        <div className="flex items-center gap-2">
          {/* Panic Button - hidden on mobile (bottom nav handles it) */}
          <button
            onClick={onOpenEmergency}
            className="hidden md:flex bg-coral-pink hover:bg-[#ffc6c1] text-coral-dark-text font-semibold text-xs rounded-full px-5 py-3 shadow-sm hover:shadow transition-all items-center gap-2 cursor-pointer border border-[#ffa8a1]"
            id="btn-panic-header"
          >
            <ShieldAlert className="w-4 h-4 fill-current animate-pulse text-coral-panic" />
            <span>PANIC BUTTON / HOTLINE DARURAT</span>
          </button>

          {/* Settings / Profile Trigger */}
          <button
            onClick={() => onNavigate(AppView.SETTINGS)}
            className={`p-2.5 min-w-[44px] min-h-[44px] rounded-full transition-all flex items-center justify-center border cursor-pointer ${
              currentView === AppView.SETTINGS
                ? "bg-sage-light text-sage-primary border-sage-primary"
                : "bg-white hover:bg-background-soft border-outline-variant/30 text-charcoal-muted"
            }`}
            title="Pengaturan Aksesibilitas"
            id="btn-settings-header"
          >
            <User className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
