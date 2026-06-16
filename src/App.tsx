import { useState, useEffect, useCallback } from "react";
import { AppView, Message, AppSettings } from "./types";
import Header from "./components/Header";
import Footer from "./components/Footer";
import LandingView from "./components/LandingView";
import ChatView from "./components/ChatView";
import SelfHelpView from "./components/SelfHelpView";
import CounselorView from "./components/CounselorView";
import SettingsView from "./components/SettingsView";
import CounselorLogin from "./components/CounselorLogin";
import MobileNav from "./components/MobileNav";
import FeedbackModal from "./components/FeedbackModal";
import { ShieldAlert, Heart, Phone, X, ShieldCheck } from "lucide-react";

export default function App() {
  // Navigation State
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [isCounselorLoggedIn, setIsCounselorLoggedIn] = useState(false);

  // Student Anonymous ID Generation
  const [studentId, setStudentId] = useState<string>(() => {
    const localId = localStorage.getItem("ruang_aman_student_id");
    if (localId) return localId;
    const initialId = "Anonimus_" + Math.floor(1000 + Math.random() * 9000);
    localStorage.setItem("ruang_aman_student_id", initialId);
    return initialId;
  });

  // Role-Based Access Control
  const [userRole, setUserRole] = useState<"none" | "anonimus" | "bk">(() => {
    const stored = localStorage.getItem("ruang_aman_user_role");
    return (stored === "anonimus" || stored === "bk") ? stored : "none";
  });

  // Lock anonymous ID once activated
  const [idLocked, setIdLocked] = useState<boolean>(() => {
    return localStorage.getItem("ruang_aman_id_locked") === "true";
  });

  // Settings State
  const [settings, setSettings] = useState<AppSettings>(() => {
    const localSettings = localStorage.getItem("ruang_aman_settings");
    return localSettings
      ? JSON.parse(localSettings)
      : { darkMode: false, textSize: "normal" };
  });

  // Sync dark mode & font size to <html> element
  useEffect(() => {
    document.documentElement.classList.toggle("dark", settings.darkMode);
    document.documentElement.classList.remove("text-size-besar", "text-size-ekstra-besar");
    if (settings.textSize === "besar") document.documentElement.classList.add("text-size-besar");
    if (settings.textSize === "ekstra-besar") document.documentElement.classList.add("text-size-ekstra-besar");
  }, [settings.darkMode, settings.textSize]);

  // Redirect to HOME when role doesn't match current view
  useEffect(() => {
    if (
      (currentView === AppView.CHAT || currentView === AppView.SELF_HELP) &&
      userRole !== "anonimus"
    ) {
      setCurrentView(AppView.HOME);
    }
    if (currentView === AppView.COUNSELOR_PORTAL && userRole !== "bk") {
      setCurrentView(AppView.HOME);
    }
  }, [currentView, userRole]);

  // Emergency overlay open trigger
  const [emergencyOpen, setEmergencyOpen] = useState(false);

  // Feedback modal state
  const [feedback, setFeedback] = useState<{ title: string; message: string } | null>(null);

  const showFeedback = (message: string, title?: string) => {
    setFeedback({ title: title || "Informasi", message });
  };

  // Chat message histories, synced with LocalStorage and API
  const [messages, setMessages] = useState<Message[]>(() => {
    const localHistory = localStorage.getItem("ruang_aman_chat_history");
    return localHistory ? JSON.parse(localHistory) : [];
  });

  // Fetch chat history from API
  const fetchChatHistory = useCallback(async () => {
    try {
      const res = await fetch(`/api/chat/history?studentId=${studentId}`);
      if (!res.ok) throw new Error("Failed to fetch history");
      const data = await res.json();
      setMessages(data.messages || []);
      localStorage.setItem("ruang_aman_chat_history", JSON.stringify(data.messages || []));
    } catch {
      // Keep existing localStorage state
    }
  }, [studentId]);

  // Fetch history when entering CHAT view
  useEffect(() => {
    if (currentView === AppView.CHAT) {
      fetchChatHistory();
    }
  }, [currentView, fetchChatHistory]);

  // Polling for new messages every 3s when in CHAT view
  useEffect(() => {
    if (currentView !== AppView.CHAT) return;
    const interval = setInterval(fetchChatHistory, 3000);
    return () => clearInterval(interval);
  }, [currentView, fetchChatHistory]);

  // Sync settings helper
  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem("ruang_aman_settings", JSON.stringify(newSettings));
  };

  // Sync Student ID refresh (locked after first activation)
  const handleRefreshStudentId = () => {
    if (idLocked) return;
    const newId = "Anonimus_" + Math.floor(1000 + Math.random() * 9000);
    setStudentId(newId);
    localStorage.setItem("ruang_aman_student_id", newId);
    
    // Reset conversation history
    setMessages([]);
    localStorage.removeItem("ruang_aman_chat_history");
  };

  // Role-based action handlers
  const handleActivateAnonimus = () => {
    setIdLocked(true);
    localStorage.setItem("ruang_aman_id_locked", "true");
    setUserRole("anonimus");
    localStorage.setItem("ruang_aman_user_role", "anonimus");
    setCurrentView(AppView.CHAT);
  };

  const handleActivateBK = () => {
    setUserRole("bk");
    localStorage.setItem("ruang_aman_user_role", "bk");
    setCurrentView(AppView.COUNSELOR_PORTAL);
  };

  const handleGoToSelfHelp = () => {
    if (userRole === "none") {
      setIdLocked(true);
      localStorage.setItem("ruang_aman_id_locked", "true");
      setUserRole("anonimus");
      localStorage.setItem("ruang_aman_user_role", "anonimus");
    }
    setCurrentView(AppView.SELF_HELP);
  };

  const handleRoleLogout = () => {
    setUserRole("none");
    setIsCounselorLoggedIn(false);
    localStorage.setItem("ruang_aman_user_role", "none");
    setCurrentView(AppView.HOME);
  };

  // Guard navigation based on role
  const handleRoleNavigate = (view: AppView) => {
    if (view === AppView.CHAT || view === AppView.SELF_HELP) {
      if (userRole !== "anonimus") return;
    }
    if (view === AppView.COUNSELOR_PORTAL) {
      if (userRole !== "bk") return;
    }
    setCurrentView(view);
  };

  // Student messaging — save locally and persist to DB (no auto-response)
  const handleSendMessage = async (text: string) => {
    const timestampString = new Date().toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    }) + " WIB";

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      text: text,
      timestamp: timestampString,
    };

    const updatedHistory = [...messages, userMessage];
    setMessages(updatedHistory);
    localStorage.setItem("ruang_aman_chat_history", JSON.stringify(updatedHistory));

    // Persist to DB for counselor to see
    try {
      await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          studentId: studentId,
        }),
      });
    } catch {
      console.warn("Chat persist to DB failed, saved locally only.");
    }
  };

  const handleClearHistory = async () => {
    const oldId = studentId;
    const newId = "Anonimus_" + Math.floor(1000 + Math.random() * 9000);

    // Stop polling FIRST — navigate away from CHAT
    setCurrentView(AppView.HOME);

    try {
      const res = await fetch("/api/session/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: oldId }),
      });
      if (!res.ok) throw new Error("Server error: " + res.status);
    } catch (e) {
      showFeedback("Gagal menghapus data dari server. Periksa koneksi dan coba lagi.", "Error");
      return;
    }

    localStorage.clear();
    setIdLocked(false);
    setStudentId(newId);
    localStorage.setItem("ruang_aman_student_id", newId);
    setUserRole("none");
    setSettings({ darkMode: false, textSize: "normal" });
    setMessages([]);
    showFeedback("Sesi dan riwayat curhat telah dihapus total. Silakan mulai sesi baru kapan pun.", "Sesi Dihapus");
  };

  const handleMasterReset = async () => {
    const oldStudentId = studentId;

    // Stop polling FIRST — navigate away from CHAT
    setCurrentView(AppView.HOME);

    try {
      const res = await fetch("/api/session/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: oldStudentId }),
      });
      if (!res.ok) throw new Error("Server error: " + res.status);
    } catch (e) {
      showFeedback("Gagal menghapus data dari server. Periksa koneksi dan coba lagi.", "Error");
      return;
    }

    localStorage.clear();
    setIdLocked(false);
    setStudentId("Anonimus_" + Math.floor(1000 + Math.random() * 9000));
    setSettings({ darkMode: false, textSize: "normal" });
    setMessages([]);
    showFeedback("Seluruh data, riwayat curhat, dan pengaturan telah bersih total. Anonimus ID baru dibuat.", "Reset Berhasil");
  };

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 ${
        settings.darkMode ? "bg-slate-950 text-slate-100" : "bg-background-soft text-charcoal-dark"
      }`}
    >
      {/* Shared Header Navigation */}
      <Header
        currentView={currentView}
        onNavigate={handleRoleNavigate}
        onOpenEmergency={() => setEmergencyOpen(true)}
        studentId={studentId}
        userRole={userRole}
        onActivateBK={handleActivateBK}
      />

      {/* Main Workspace Frame */}
      <main className="flex-grow flex flex-col p-4 md:p-8 pb-[72px] md:pb-8 max-w-7xl mx-auto w-full">
        {currentView === AppView.HOME && (
          <LandingView
            studentId={studentId}
            onRefreshId={handleRefreshStudentId}
            onActivateAnonimus={handleActivateAnonimus}
            onGoToSelfHelp={handleGoToSelfHelp}
            onActivateBK={handleActivateBK}
            idLocked={idLocked}
            userRole={userRole}
          />
        )}

        {currentView === AppView.CHAT && userRole === "anonimus" && (
          <ChatView
            studentId={studentId}
            messages={messages}
            onSendMessage={handleSendMessage}
            onClearHistory={handleClearHistory}
            onNavigate={setCurrentView}
          />
        )}

        {currentView === AppView.SELF_HELP && userRole === "anonimus" && <SelfHelpView studentId={studentId} />}

        {currentView === AppView.COUNSELOR_PORTAL && userRole === "bk" && (
          isCounselorLoggedIn ? (
            <CounselorView
              studentId={studentId}
              messages={messages}
              onLogout={handleRoleLogout}
            />
          ) : (
            <CounselorLogin
              onLoginSuccess={() => setIsCounselorLoggedIn(true)}
              onActivateBK={handleActivateBK}
              onCancel={() => setCurrentView(AppView.HOME)}
            />
          )
        )}

        {currentView === AppView.SETTINGS && (
          <SettingsView
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onMasterReset={handleMasterReset}
          />
        )}
      </main>

      {/* Shared Footline Attribution */}
      <Footer onNavigate={setCurrentView} />

      {/* Mobile Bottom Navigation (md:hidden) */}
      <MobileNav
        currentView={currentView}
        onNavigate={handleRoleNavigate}
        onOpenEmergency={() => setEmergencyOpen(true)}
        userRole={userRole}
      />

      {/* Modern Glassmorphic Emergency hotline Overlay Modal */}
      {emergencyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden border border-red-200 shadow-xl relative animate-in fade-in zoom-in duration-200">
            
            {/* Top warning border */}
            <div className="h-2 bg-coral-panic w-full"></div>
            
            {/* Close Button */}
            <button
              onClick={() => setEmergencyOpen(false)}
              className="absolute top-4 right-4 p-2 text-charcoal-muted hover:text-charcoal-dark bg-background-soft rounded-full transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-6 flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-coral-pink flex items-center justify-center text-coral-panic animate-pulse shrink-0">
                  <ShieldAlert className="w-6 h-6 fill-current" />
                </div>
                <div>
                  <h3 className="font-display font-black text-lg text-charcoal-dark">
                    PANIC BUTTON / HOTLINE DARURAT
                  </h3>
                  <p className="text-xs text-charcoal-muted uppercase tracking-wider font-extrabold font-mono text-coral-panic leading-none">
                    Layanan Siaga Psikologi UPT BK Unila
                  </p>
                </div>
              </div>

              <div className="bg-background-soft p-4 rounded-xl border border-outline-variant/15 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-sage-primary shrink-0 mt-0.5" />
                <p className="font-sans text-xs md:text-sm text-charcoal-muted leading-relaxed">
                  Jika Anda atau seseorang yang Anda kenal sedang dalam bahaya psikologis langsung, trauma ekstrem, cemas sesak parah, atau berpikir untuk menyakiti diri, tolong hubungi nomor darurat di bawah segera. Kesejahteraan Anda adalah yang paling utama bagi kami.
                </p>
              </div>

              {/* Call Rows */}
              <div className="flex flex-col gap-2.5">
                <div className="flex justify-between items-center bg-red-50/20 p-3.5 border border-red-200 rounded-xl">
                  <div>
                    <h4 className="font-sans font-bold text-xs md:text-sm text-charcoal-dark">
                      SANKA Siaga Sehat Jiwa RI
                    </h4>
                    <span className="text-[10px] text-coral-dark-text uppercase font-black">
                      Nasional (Bebas Pulsa - 24 Jam)
                    </span>
                  </div>
                  <a
                    href="tel:119"
                    onClick={() => showFeedback("Menghubungi SANKA RI: Call 119 Ext 8 — Layanan Siaga Sehat Jiwa Nasional (24 jam, bebas pulsa).", "Hotline Darurat")}
                    className="bg-coral-panic hover:bg-red-700 text-white font-semibold text-xs rounded-full px-4 py-2 flex items-center gap-1.5 transition-all shadow"
                  >
                    <Phone className="w-3.5 h-3.5" /> Hubungi 119
                  </a>
                </div>

                <div className="flex justify-between items-center bg-background-soft p-3.5 border border-outline-variant/20 rounded-xl">
                  <div>
                    <h4 className="font-sans font-bold text-xs md:text-sm text-charcoal-dark">
                      UPT BK Universitas Lampung
                    </h4>
                    <span className="text-[10px] text-charcoal-muted uppercase font-bold">
                      Respon Cepat Psikologi Kampus (24 Jam)
                    </span>
                  </div>
                  <a
                    href="tel:081234567890"
                    onClick={() => showFeedback("Menghubungi UPT BK Unila: 0812-3456-7890 — Respon cepat psikologi kampus (24 jam).", "Hotline Darurat")}
                    className="bg-sage-primary hover:bg-sage-dark text-white font-semibold text-xs rounded-full px-4 py-2 flex items-center gap-1.5 transition-all shadow"
                  >
                    <Phone className="w-3.5 h-3.5" /> Hubungi BK Unila
                  </a>
                </div>
              </div>

              <div className="flex justify-between items-center bg-background-soft p-3.5 border border-outline-variant/20 rounded-xl">
                  <div>
                    <h4 className="font-sans font-bold text-xs md:text-sm text-charcoal-dark">
                      Hotline Pencegahan Bunuh Diri Nasional (Kemenkes)
                    </h4>
                    <span className="text-[10px] text-charcoal-muted uppercase font-bold">
                      Layanan Siaga Sehat Jiwa (24 Jam)
                    </span>
                  </div>
                  <a
                    href="tel:500454"
                    onClick={() => showFeedback("Menghubungi Kemenkes: 500-454 — Hotline Pencegahan Bunuh Diri Nasional (24 jam).", "Hotline Darurat")}
                    className="bg-sage-primary hover:bg-sage-dark text-white font-semibold text-xs rounded-full px-4 py-2 flex items-center gap-1.5 transition-all shadow"
                  >
                    <Phone className="w-3.5 h-3.5" /> Hubungi 500-454
                  </a>
                </div>

              {/* Grounding Trigger helper */}
              <button
                onClick={() => {
                  setEmergencyOpen(false);
                  if (userRole === "none") {
                    setUserRole("anonimus");
                    localStorage.setItem("ruang_aman_user_role", "anonimus");
                  }
                  setCurrentView(AppView.SELF_HELP);
                }}
                className="w-full bg-[#f7f9ff] text-sage-primary hover:bg-[#e3efff] transition-all border border-sage-primary/20 py-3 rounded-full font-sans text-xs font-semibold"
              >
                Atasi Panic Attack: Jalankan Latihan Pernapasan Mandiri →
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Feedback Modal — replaces native alert() */}
      <FeedbackModal
        isOpen={feedback !== null}
        title={feedback?.title}
        message={feedback?.message || ""}
        onClose={() => setFeedback(null)}
      />

    </div>
  );
}
