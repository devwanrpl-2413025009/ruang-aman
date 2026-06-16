import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  UserCheck, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  GraduationCap, 
  AlertCircle
} from "lucide-react";

interface CounselorLoginProps {
  onLoginSuccess: (counselorName: string) => void;
  onActivateBK: () => void;
  onCancel: () => void;
}

export default function CounselorLogin({ onLoginSuccess, onActivateBK, onCancel }: CounselorLoginProps) {
  const [nip, setNip] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!nip.trim() || !password.trim()) {
      setError("Mohon isi seluruh data login Konselor Anda.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/counselor/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nip: nip.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login gagal");
      }

      onLoginSuccess(data.name);
      onActivateBK();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal terhubung ke server");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center py-6 md:py-16 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden"
      >
        {/* Top visual brand bar */}
        <div className="h-2 bg-sage-primary w-full"></div>

        <div className="p-6 md:p-8 flex flex-col gap-6">
          
          {/* Header Layout */}
          <div className="text-center flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-sage-light flex items-center justify-center text-sage-primary shadow-inner">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <h2 className="font-display font-black text-xl md:text-2xl text-charcoal-dark tracking-tight">
                Portal Masuk Konselor
              </h2>
              <p className="font-sans text-xs text-charcoal-muted mt-1 leading-normal">
                Khusus Dosen Bimbingan Konseling &amp; Staf Psikolog Ruang Aman
              </p>
            </div>
          </div>

          {/* Locked Information banner */}
          <div className="bg-background-soft rounded-xl p-3.5 border border-outline-variant/15 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-sage-primary shrink-0 mt-0.5" />
            <p className="font-sans text-[11px] text-charcoal-muted leading-relaxed text-left">
              Sesi konseling dijaga secara ketat dan terlindungi secara hukum privasi mahasiswa. Aktivitas Anda dicatat oleh sistem audit universitas.
            </p>
          </div>

          {/* Form wrapper */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            {/* Input 1: NIP (Nomor Induk Pegawai) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-mono tracking-wider text-charcoal-dark font-black flex items-center gap-1.5">
                NIP Dosen / Staf BK
              </label>
              <div className="relative bg-[#f8fbfc] rounded-lg border border-outline-variant/35 focus-within:border-sage-primary transition-all">
                <input
                  type="text"
                  value={nip}
                  onChange={(e) => setNip(e.target.value)}
                  placeholder="Masukkan 18 digit NIP Anda"
                  className="w-full bg-transparent px-3 py-2.5 text-xs md:text-sm outline-none text-charcoal-dark focus:ring-0"
                />
              </div>
            </div>

            {/* Input 2: Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-mono tracking-wider text-charcoal-dark font-black">
                Kata Sandi Portal
              </label>
              <div className="relative bg-[#f8fbfc] rounded-lg border border-outline-variant/35 focus-within:border-sage-primary transition-all flex items-center pr-3">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Kata sandi aman konselor"
                  className="flex-grow bg-transparent px-3 py-2.5 text-xs md:text-sm outline-none text-charcoal-dark focus:ring-0"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-charcoal-muted hover:text-sage-primary transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error notifications */}
            {error && (
              <div className="bg-coral-pink text-coral-dark-text rounded-xl p-3 border border-red-200 flex items-start gap-2 text-xs leading-relaxed animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="font-sans font-medium">{error}</p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col gap-2 mt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-sage-primary hover:bg-sage-dark text-white font-semibold text-sm rounded-full py-3.5 transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isLoading ? (
                  <span>Memverifikasi Akun BK...</span>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>Masuk ke Portal Konselor</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onCancel}
                className="w-full bg-transparent hover:bg-background-soft text-charcoal-muted font-semibold text-xs rounded-full py-2.5 transition-all cursor-pointer"
              >
                Kembali ke Beranda
              </button>
            </div>
          </form>

        </div>
      </motion.div>
    </div>
  );
}
