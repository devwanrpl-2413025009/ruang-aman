import { useState } from "react";
import { 
  Accessibility, 
  Trash2, 
  Sun,
  Moon
} from "lucide-react";
import { AppSettings } from "../types";
import FeedbackModal from "./FeedbackModal";

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onMasterReset: () => void;
}

export default function SettingsView({
  settings,
  onUpdateSettings,
  onMasterReset,
}: SettingsViewProps) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  
  const handleToggleDarkMode = () => {
    onUpdateSettings({
      ...settings,
      darkMode: !settings.darkMode,
    });
  };

  const handleTextSizeChange = (size: "normal" | "besar" | "ekstra-besar") => {
    onUpdateSettings({
      ...settings,
      textSize: size,
    });
  };

  return (
    <div className="flex-grow max-w-4xl mx-auto w-full px-4 py-8 md:py-12 flex flex-col gap-8">
      
      {/* View Header */}
      <header className="mb-4">
        <h1 className="font-display font-extrabold text-2xl md:text-3xl text-charcoal-dark mb-2">
          Pengaturan &amp; Aksesibilitas
        </h1>
        <p className="font-sans text-sm md:text-base text-charcoal-muted leading-relaxed">
          Sesuaikan pengalaman Ruang Aman agar terasa paling nyaman, tenang, dan mudah dibaca oleh Anda.
        </p>
      </header>

      {/* 1. Sizing and Visuals (Aksesibilitas card) */}
      <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-outline-variant/20 flex flex-col gap-6">
        <div className="flex items-center gap-3 border-b border-outline-variant/10 pb-4">
          <div className="w-10 h-10 rounded-full bg-sage-light flex items-center justify-center text-sage-primary">
            <Accessibility className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display font-bold text-lg text-charcoal-dark">
              Aksesibilitas Visual
            </h2>
            <span className="text-xs text-charcoal-muted">Modifikasi Tampilan Sesuai Kenyamanan Mata</span>
          </div>
        </div>

        {/* Dark Mode Row */}
        <div className="flex items-center justify-between py-2 gap-4">
          <div>
            <h3 className="font-sans font-bold text-sm md:text-base text-charcoal-dark mb-1">
              Mode Gelap (Tema Biru Dongker)
            </h3>
            <p className="font-sans text-xs text-charcoal-muted leading-relaxed">
              Gunakan tema biru dongker pekat untuk mengurangi ketegangan kelopak mata, terutama di malam hari.
            </p>
          </div>
          
          <button
            onClick={handleToggleDarkMode}
            className={`w-14 h-8 rounded-full p-1 transition-all duration-300 relative cursor-pointer ${
              settings.darkMode ? "bg-sage-primary focus:ring-1 focus:ring-sage-primary" : "bg-outline-variant/50"
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center transition-all duration-300 transform ${
                settings.darkMode ? "translate-x-6" : "translate-x-0"
              }`}
            >
              {settings.darkMode ? (
                <Moon className="w-3.5 h-3.5 text-sage-primary" />
              ) : (
                <Sun className="w-3.5 h-3.5 text-orange-400" />
              )}
            </div>
          </button>
        </div>

        <hr className="border-t border-outline-variant/10" />

        {/* Text Size Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 gap-4">
          <div className="max-w-md">
            <h3 className="font-sans font-bold text-sm md:text-base text-charcoal-dark mb-1">
              Ukuran Teks Aplikasi
            </h3>
            <p className="font-sans text-xs text-charcoal-muted leading-relaxed">
              Menyesuaikan kerapatan huruf agar konten bimbingan konseling dan rincian kontak darurat lebih mudah dibaca.
            </p>
          </div>

          {/* Segmented Picker */}
          <div className="flex bg-background-soft p-1 rounded-full border border-outline-variant/20 self-start sm:self-auto shrink-0 select-none">
            <button
              onClick={() => handleTextSizeChange("normal")}
              className={`px-4 py-2 rounded-full font-sans text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                settings.textSize === "normal"
                  ? "bg-white text-charcoal-dark shadow-sm"
                  : "text-charcoal-muted hover:text-charcoal-dark"
              }`}
            >
              Normal
            </button>
            <button
              onClick={() => handleTextSizeChange("besar")}
              className={`px-4 py-2 rounded-full font-sans text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                settings.textSize === "besar"
                  ? "bg-white text-charcoal-dark shadow-sm"
                  : "text-charcoal-muted hover:text-charcoal-dark"
              }`}
            >
              Besar
            </button>
            <button
              onClick={() => handleTextSizeChange("ekstra-besar")}
              className={`px-4 py-2 rounded-full font-sans text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                settings.textSize === "ekstra-besar"
                  ? "bg-white text-charcoal-dark shadow-sm"
                  : "text-charcoal-muted hover:text-charcoal-dark"
              }`}
            >
              Ekstra Besar
            </button>
          </div>
        </div>
      </section>

      {/* 2. Privacy & Clear master data */}
      <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-outline-variant/20 flex flex-col gap-6">
        <div className="flex items-center gap-3 border-b border-outline-variant/10 pb-4">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-coral-panic border border-red-200">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display font-bold text-base text-charcoal-dark">
              Privasi &amp; Manajemen Data Lokal
            </h2>
            <span className="text-xs text-charcoal-muted">Hapus Jejak Keberadaan Digital Anda</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="font-sans font-bold text-xs md:text-sm text-charcoal-dark leading-none">
            Penghapusan Jejak Sesi (Master Clear)
          </h3>
          <p className="font-sans text-xs text-charcoal-muted leading-relaxed">
            Ruang Aman menyimpan seluruh data bimbingan curhat, logs mini-jurnal, dan konfigurasi ukuran huruf secara enkapsulasi lokal di peramban peranti ini. Tidak ada database awan universitas yang menampung beban kognitif Anda. Anda berhak menghapus jejak ini mutlak kapan saja.
          </p>

          <button
            onClick={() => setShowResetConfirm(true)}
            className="w-full sm:w-auto self-start mt-2 bg-white hover:bg-coral-pink/30 border border-coral-panic/35 hover:border-coral-panic text-coral-panic font-semibold text-xs rounded-full px-6 py-3.5 transition-all flex items-center justify-center gap-2 cursor-pointer group"
          >
            <Trash2 className="w-4 h-4 group-hover:scale-105 transition-transform" />
            <span>Hapus Semua Riwayat Lokal</span>
          </button>
        </div>
      </section>

      {/* Confirm master reset */}
      <FeedbackModal
        isOpen={showResetConfirm}
        variant="confirm"
        title="Hapus Semua Data"
        message="PERINGATAN: Tindakan ini tidak dapat dibatalkan. Seluruh riwayat obrolan bimbingan konseling dan catatan kecil kecemasan Anda akan dihapus permanen di perangkat luring ini. Lanjutkan?"
        confirmLabel="Ya, Hapus Semua"
        cancelLabel="Batal"
        onClose={() => setShowResetConfirm(false)}
        onConfirm={onMasterReset}
      />

    </div>
  );
}
