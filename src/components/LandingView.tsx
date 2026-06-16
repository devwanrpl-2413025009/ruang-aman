import { motion } from "motion/react";
import { ShieldCheck, ArrowRight, RefreshCw, KeyRound, HeartHandshake } from "lucide-react";
import { AppView } from "../types";

interface LandingViewProps {
  studentId: string;
  onRefreshId: () => void;
  onActivateAnonimus: () => void;
  onGoToSelfHelp: () => void;
  onActivateBK: () => void;
  idLocked: boolean;
  userRole: "none" | "anonimus" | "bk";
}

export default function LandingView({
  studentId,
  onRefreshId,
  onActivateAnonimus,
  onGoToSelfHelp,
  onActivateBK,
  idLocked,
  userRole,
}: LandingViewProps) {
  return (
    <div className="flex-grow flex flex-col items-center justify-center py-8 md:py-16 gap-12 max-w-7xl mx-auto w-full">
      {/* Hero Header Section */}
      <motion.section
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center max-w-3xl px-4 flex flex-col gap-6 items-center"
      >
        <div className="flex items-center gap-3">
          <img
            src="/logo-unila.png"
            alt="Logo Universitas Lampung"
            className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover border-2 border-sage-light"
          />
          <span className="bg-sage-light text-sage-dark font-mono text-xs font-bold tracking-wider px-4 py-1.5 rounded-full uppercase">
            BK Unila
          </span>
        </div>
        
        {/* Responsive Headline */}
        <h1 className="font-display font-extrabold text-3xl md:text-5xl text-charcoal-dark leading-tight select-none">
          Kamu tidak sendirian.{" "}
          <span className="text-sage-primary block md:inline">
            Ruang ini sepenuhnya aman, rahasia, dan tanpa nama.
          </span>
        </h1>
        
        <p className="font-sans text-sm md:text-lg text-charcoal-muted max-w-2xl mx-auto leading-relaxed">
          Silakan berbagi apa yang sedang kamu rasakan. Kami di sini untuk mendengarkan dengan penuh empati, tanpa menghakimi.
        </p>
      </motion.section>

      {/* Bento Glassmorphic Card (Student Anonymous Card) */}
      <motion.section
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
        className="w-full max-w-lg px-4"
      >
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-outline-variant/30 relative overflow-hidden group hover:border-sage-primary transition-all duration-300">
          {/* Decorative Blur Background Accent */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-background-soft rounded-full blur-2xl opacity-60 group-hover:scale-110 transition-transform duration-500"></div>

          <div className="relative z-10 flex flex-col items-center text-center gap-6">
            {/* Mascot circular icon */}
            <div className="w-16 h-16 bg-[#e3efff] rounded-full flex items-center justify-center text-sage-primary shadow-inner mb-1">
              <KeyRound className="w-8 h-8 text-charcoal-muted" />
            </div>

            <div className="flex flex-col gap-1 w-full">
              <span className="font-mono text-[11px] text-outline uppercase tracking-widest font-bold">
                Identitas Anda
              </span>
              <div className="flex items-center justify-center gap-2 mt-1 bg-background-soft p-3 rounded-lg border border-outline-variant/10">
                <h2 className="font-display text-lg md:text-xl font-extrabold text-charcoal-dark leading-none">
                  ID Anonim Kamu: <span className="text-sage-primary">{studentId}</span>
                </h2>
                <button
                  onClick={onRefreshId}
                  className={`p-1.5 rounded-full transition-all active:scale-95 cursor-pointer ${
                    idLocked
                      ? 'opacity-0 pointer-events-none invisible w-0'
                      : 'text-sage-primary hover:bg-white'
                  }`}
                  title={idLocked ? "ID terkunci setelah aktivasi" : "Ganti ID Anonim Acak"}
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Locked Info Alert */}
            <div className="bg-background-soft rounded-xl p-4 flex items-start gap-3 w-full border border-outline-variant/20">
              <ShieldCheck className="w-5 h-5 text-sage-primary shrink-0 mt-0.5" />
              <p className="font-sans text-xs md:text-sm text-charcoal-muted text-left leading-relaxed">
                Platform Bimbingan &amp; Konseling kami tidak merekam nama asli, NPM, email, atau alamat IP kamu. Percakapan ini dijamin 100% rahasia secara end-to-end.
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Primary Call to Action */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex flex-col sm:flex-row items-center gap-4 px-4 w-full justify-center"
      >
        <button
          onClick={onActivateAnonimus}
          className="w-full sm:w-auto bg-sage-primary text-white font-semibold text-base rounded-full px-8 py-4 shadow-sm hover:bg-sage-dark hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 transform group cursor-pointer"
          id="btn-goto-chat"
        >
          <span>Mulai Bercerita (Sebagai Anonimus)</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>

        <button
          onClick={onGoToSelfHelp}
          className="w-full sm:w-auto bg-white hover:bg-background-soft text-sage-primary border border-sage-primary/30 font-semibold text-base rounded-full px-8 py-4 transition-all flex items-center justify-center gap-2 cursor-pointer"
          id="btn-goto-selfhelp"
        >
          <HeartHandshake className="w-5 h-5" />
          <span>Bantuan Mandiri &amp; Relaksasi</span>
        </button>
      </motion.section>

      {/* Counselor Entry quick tip — only for non-anonimus */}
      {userRole !== "anonimus" && (
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8 }}
        transition={{ delay: 0.5 }}
        className="text-center mt-4 border-t border-outline-variant/20 pt-6 px-4 w-full max-w-sm"
      >
        <p className="text-xs text-charcoal-muted leading-relaxed mb-2">
          Apakah Anda staf konseling atau dosen BK bimbingan?
        </p>
        <button
          onClick={onActivateBK}
          className="text-sage-primary hover:text-sage-dark text-xs font-bold underline transition-all cursor-pointer"
        >
          Masuk sebagai BK atau Staff BK Unila →
        </button>
      </motion.section>
      )}
    </div>
  );
}
