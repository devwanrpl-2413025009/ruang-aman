import { useState } from "react";
import { Heart } from "lucide-react";
import { AppView } from "../types";
import FeedbackModal from "./FeedbackModal";

interface FooterProps {
  onNavigate: (view: AppView) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const [feedback, setFeedback] = useState<{ title: string; message: string } | null>(null);

  return (
    <footer className="w-full bg-white border-t border-outline-variant/30 py-8 mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-center px-4 md:px-20 max-w-7xl mx-auto w-full gap-6">
        {/* Core Attribution */}
        <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
          <div className="font-display font-extrabold text-charcoal-dark flex items-center gap-1.5 text-base">
            <Heart className="w-4 h-4 fill-coral-panic text-coral-panic" />
            Ruang Aman BK Unila
          </div>
          <span className="hidden sm:inline text-outline">|</span>
          <p className="font-sans text-xs text-charcoal-muted">
            © 2026 UPT Bimbingan & Konseling Universitas Lampung (BK Unila)
          </p>
        </div>

        {/* Dynamic Nav link mapping */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-xs font-semibold text-charcoal-muted">
          <button
            onClick={() => onNavigate(AppView.SETTINGS)}
            className="hover:text-sage-primary transition-colors cursor-pointer"
          >
            Aksesibilitas
          </button>
          <span className="text-outline-variant/50">•</span>
          <a
            href="#privacy-policy"
            onClick={(e) => {
              e.preventDefault();
              setFeedback({ title: "Kebijakan Privasi", message: "Kebijakan Privasi: Ruang Aman 100% luring dan aman. Tidak ada jejak data nama, NPM, IP Address yang dikirimkan atau disimpan di luar sesi obrolan terenkripsi." });
            }}
            className="hover:text-sage-primary transition-colors cursor-pointer"
          >
            Privacy Policy
          </a>
          <span className="text-outline-variant/50">•</span>
          <a
            href="#terms"
            onClick={(e) => {
              e.preventDefault();
              setFeedback({ title: "Syarat Layanan", message: "Syarat Layanan: Layanan ini adalah wadah bimbingan konseling dan dukungan emosional preventif. Apabila Anda mengalami krisis psikologis berat, harap hubungi layanan darurat medis segera." });
            }}
            className="hover:text-sage-primary transition-colors cursor-pointer"
          >
            Terms of Service
          </a>
          <span className="text-outline-variant/50">•</span>
          <button
            onClick={() => onNavigate(AppView.SELF_HELP)}
            className="hover:text-sage-primary transition-colors cursor-pointer font-bold text-sage-primary"
          >
            Kontak Darurat
          </button>
        </div>
      </div>

      {/* Feedback modal */}
      <FeedbackModal
        isOpen={feedback !== null}
        title={feedback?.title}
        message={feedback?.message || ""}
        onClose={() => setFeedback(null)}
      />
    </footer>
  );
}
