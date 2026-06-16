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
      <div className="grid grid-cols-3 items-center px-4 md:px-20 py-4 max-w-7xl mx-auto w-full">
        {/* Brand Group - Left */}
        <button
          onClick={() => onNavigate(AppView.HOME)}
          className="justify-self-start flex items-center gap-2 cursor-pointer hover:opacity-85 transition-opacity text-left"
          id="nav-logo"
        >
          <img
            src="/logo-unila.png"
            alt="Logo Unila"
            className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border border-sage-light"
          />
          <div>
            <h1 className="font-display font-extrabold text-lg md:text-xl text-charcoal-dark tracking-tight leading-none">
              Ruang Aman BK Unila
            </h1>
            <span className="text-[10px] uppercase font-mono tracking-wider text-sage-primary block">
              {userRole === "bk" ? "BK atau Staff Terhubung" : "Safe Haven"}
            </span>
          </div>
        </button>

        {/* Main Navigation - Center */}
        {userRole !== "bk" && (
        <nav className="hidden md:flex items-center justify-self-center gap-1 bg-background-soft p-1 rounded-full border border-outline-variant/20">
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

        {/* Global Toolbar - Right */}
        <div className="flex items-center justify-self-end gap-2 md:gap-4">
          {/* Panic Button */}
          <button
            onClick={onOpenEmergency}
            className="bg-coral-pink hover:bg-[#ffc6c1] text-coral-dark-text font-semibold text-xs rounded-full px-4 md:px-5 py-2 md:py-3 shadow-sm hover:shadow transition-all flex items-center gap-2 cursor-pointer border border-[#ffa8a1]"
            id="btn-panic-header"
          >
            <ShieldAlert className="w-4 h-4 fill-current animate-pulse text-coral-panic" />
            <span className="hidden sm:inline">PANIC BUTTON / HOTLINE DARURAT</span>
            <span className="sm:hidden">PANIC BUTTON</span>
          </button>

          {/* Settings / Profile Trigger */}
          <button
            onClick={() => onNavigate(AppView.SETTINGS)}
            className={`p-2.5 rounded-full transition-all flex items-center justify-center border cursor-pointer ${
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
