import React, { useState, useEffect, useCallback, useReducer } from "react";
import { motion } from "motion/react";
import { 
  Wind, 
  Play, 
  Square, 
  BookOpen, 
  Heart, 
  Smile, 
  PhoneCall, 
  AlertTriangle, 
  PlusCircle, 
  Trash2,
  HelpCircle,
  Clock
} from "lucide-react";
import { EmergencyContact, WellnessJournal } from "../types";
import FeedbackModal from "./FeedbackModal";

interface SelfHelpViewProps {
  studentId: string;
}

export default function SelfHelpView({ studentId }: SelfHelpViewProps) {
  // Breathing state
  type BreathPhase = "Tarik" | "Tahan" | "Hembuskan" | "Tahan Kosong";
  interface BreathState { phase: BreathPhase; remaining: number; }
  const [isBreathing, setIsBreathing] = useState(false);

  function breathReducer(state: BreathState, action: "TICK" | "RESET"): BreathState {
    if (action === "RESET") return { phase: "Tarik", remaining: 4 };
    if (state.remaining <= 1) {
      const next: Record<BreathPhase, BreathPhase> = {
        "Tarik": "Tahan",
        "Tahan": "Hembuskan",
        "Hembuskan": "Tahan Kosong",
        "Tahan Kosong": "Tarik",
      };
      return { phase: next[state.phase], remaining: 4 };
    }
    return { phase: state.phase, remaining: state.remaining - 1 };
  }

  const [breath, dispatchBreath] = useReducer(breathReducer, { phase: "Tarik", remaining: 4 });

  // Wellness Journal State
  const [journalLogs, setJournalLogs] = useState<WellnessJournal[]>(() => {
    const local = localStorage.getItem("ruang_aman_journal");
    return local ? JSON.parse(local) : [];
  });
  const [newTrigger, setNewTrigger] = useState("");
  const [newFeeling, setNewFeeling] = useState("");
  const [newIntensity, setNewIntensity] = useState("Sedang");

  // Daily quote indexing
  const relaxTips = [
    "Luangkan waktu sekitar 5 menit untuk menyeduh secangkir teh hangat tanpa memegang gawai/hp. Rasakan suhunya menjalar di telapak tanganmu.",
    "Gunakan teknik grounding 5-4-3-2-1: Sebutkan 5 hal yang kamu lihat, 4 hal yang bisa disentuh, 3 hal yang didengar, 2 hal yang dicium, dan 1 hal positif tentang dirimu.",
    "Tuliskan seluruh kekhawatiranmu di selembar kertas, remas kertas tersebut kuat-kuat, lalu buang ke tempat sampah sebagai simbol pelepasan beban pikiran.",
    "Cobalah berjalan kaki di sekitar halaman rumah atau teras tanpa alas kaki selama beberapa menit. Rasakan sensasi sentuhan tanah yang dingin menenangkan.",
    "Regangkan leher, bahu, dan pergelangan tanganmu. Ambil nafas perlahan selama 4 detik, tahan 4 detik, dan hembuskan perlahan selama 4 detik.",
    "Katakan kepada dirimu sendiri secara lantang: 'Aku sudah melakukan yang terbaik hari ini. Tidak apa-apa jika hasil saat ini belum sempurna, aku berharga.'"
  ];
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [showJournalConfirm, setShowJournalConfirm] = useState(false);
  const [dialFeedback, setDialFeedback] = useState<{ title: string; message: string } | null>(null);

  // Controlled breathing interval
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isBreathing) {
      timer = setInterval(() => dispatchBreath("TICK"), 1000);
    } else {
      dispatchBreath("RESET");
    }
    return () => clearInterval(timer);
  }, [isBreathing]);

  // Fetch journals from API with localStorage fallback
  const fetchJournals = useCallback(async () => {
    try {
      const res = await fetch(`/api/journals?studentId=${studentId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.journals && data.journals.length > 0) {
          setJournalLogs(data.journals);
          localStorage.setItem("ruang_aman_journal", JSON.stringify(data.journals));
          return;
        }
      }
    } catch {
      // Fall through to localStorage
    }
    const local = localStorage.getItem("ruang_aman_journal");
    if (local) {
      try { setJournalLogs(JSON.parse(local)); } catch { /* ignore */ }
    }
  }, [studentId]);

  useEffect(() => { fetchJournals(); }, [fetchJournals]);

  // Handle Quote cycling
  const handleNextTip = () => {
    setCurrentTipIndex((prev) => (prev + 1) % relaxTips.length);
  };

  // Log save — API with localStorage fallback
  const handleAddJournal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrigger.trim() || !newFeeling.trim()) return;

    const feeling = `Intensitas ${newIntensity}: ${newFeeling.trim()}`;
    const wellnessTip = "Grounding: Ambil nafas lembut 4-4-4, regangkan pundak, katakan 'Aku aman dan mampu melalui ini.'";
    const date = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" }) + " WIB";

    try {
      const res = await fetch("/api/journals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, date, trigger: newTrigger.trim(), feeling, wellnessTip }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.journal) {
          const newLog: WellnessJournal = {
            id: data.journal.id,
            date: data.journal.date,
            trigger: data.journal.trigger,
            feeling: data.journal.feeling,
            wellnessTip: data.journal.wellness_tip,
          };
          const updated = [newLog, ...journalLogs];
          setJournalLogs(updated);
          localStorage.setItem("ruang_aman_journal", JSON.stringify(updated));
          setNewTrigger("");
          setNewFeeling("");
          setNewIntensity("Sedang");
          return;
        }
      }
    } catch {
      // Fallback to localStorage only
    }

    const newLog: WellnessJournal = {
      id: Date.now().toString(),
      date,
      trigger: newTrigger.trim(),
      feeling,
      wellnessTip,
    };
    const updated = [newLog, ...journalLogs];
    setJournalLogs(updated);
    localStorage.setItem("ruang_aman_journal", JSON.stringify(updated));

    setNewTrigger("");
    setNewFeeling("");
    setNewIntensity("Sedang");
  };

  // Clear journal confirm trigger
  const handleClearJournal = () => {
    setShowJournalConfirm(true);
  };

  const confirmClearJournal = async () => {
    for (const log of journalLogs) {
      try {
        await fetch(`/api/journals/${log.id}`, { method: "DELETE" });
      } catch {
        // Continue deleting locally
      }
    }
    setJournalLogs([]);
    localStorage.removeItem("ruang_aman_journal");
  };

  // Emergency Directory data
  const contactsList: EmergencyContact[] = [
    {
      id: "univ-1",
      title: "Layanan Konseling Kampus Utama",
      subtitle: "Tersedia 08:00 - 16:00 WIB (Senin - Jumat) • Bebas Biaya untuk Mahasiswa",
      number: "021-7888-2991",
      isEmergency: false,
      type: "Universitas"
    },
    {
      id: "univ-2",
      title: "Hotline Darurat Psikologi Universitas",
      subtitle: "Siaga Krisis Akademis &amp; Panik Mahasiswa (24 Jam)",
      number: "0812-3456-7890",
      isEmergency: true,
      type: "Universitas"
    },
    {
      id: "national-1",
      title: "Hotline Pencegahan Bunuh Diri Nasional (Kemenkes)",
      subtitle: "Layanan Siaga Sehat Jiwa Direktorat Bina Kesehatan Jiwa (24 Jam)",
      number: "500-454",
      isEmergency: true,
      type: "Nasional"
    },
    {
      id: "national-2",
      title: "Yayasan Into The Light Indonesia",
      subtitle: "Komunitas Pencegahan Suisidologi Berbasis Bukti Ilmiah",
      number: "Hubungi via Website / IG",
      isEmergency: false,
      type: "Nasional"
    }
  ];

  const handleDial = (contact: EmergencyContact) => {
    setDialFeedback({
      title: "Hubungi " + contact.title,
      message: `Membuka panggilan ke ${contact.title}: ${contact.number}. Sifat layanan bimbingan ini aman dan berempati tinggi.`,
    });
  };

  return (
    <>
    <div className="flex-grow max-w-7xl mx-auto w-full px-4 py-8 md:py-12 flex flex-col gap-10">
      
      {/* Page Header */}
      <header className="text-center max-w-3xl mx-auto flex flex-col gap-4">
        <h1 className="font-display font-extrabold text-3xl md:text-4xl text-charcoal-dark">
          Pusat Bantuan Mandiri
        </h1>
        <p className="font-sans text-base md:text-lg text-charcoal-muted leading-relaxed">
          Kamu berhak merasa tenang. Berikut beberapa panduan interaktif luring untuk membantumu kembali membumi dan meredakan kepalamu yang bising hari ini.
        </p>
      </header>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Card 1: Guided Breathing (Left, 8 cols) */}
        <div className="col-span-1 lg:col-span-8 bg-white rounded-2xl border border-outline-variant/20 p-6 md:p-8 safe-shadow relative overflow-hidden flex flex-col md:flex-row gap-8 items-center">
          
          {/* Animated concentric element behind */}
          <div className="absolute -right-24 -top-24 w-72 h-72 bg-sage-light rounded-full blur-3xl opacity-40 animate-breathe pointer-events-none"></div>

          <div className="flex-1 flex flex-col gap-4 z-10 w-full">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#ebf4f6] flex items-center justify-center text-sage-primary">
                <Wind className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h2 className="font-display font-bold text-xl text-charcoal-dark">
                  Latihan Pernapasan (Breathing Space)
                </h2>
                <span className="text-xs text-sage-primary font-semibold">Menenangkan Sistem Saraf Instan</span>
              </div>
            </div>

            <p className="font-sans text-sm text-charcoal-muted leading-relaxed">
              Teknik pernapasan taktis 4-4-4 untuk menurunkan ritme detak jantung berlebih, meredakan panic attack, dan mengistirahatkan pikiran yang kalut. Ikuti instruksi meluasnya lingkaran visual ini.
            </p>

            {/* Dynamic visual box */}
            <div className="bg-[#f8fbfc] rounded-xl p-4 md:p-6 border border-outline-variant/35 flex flex-col items-center justify-center gap-4 py-8 mt-2">
              
              {/* Interactive concentric layout */}
              <div className="relative w-40 h-40 flex items-center justify-center">
                
                {/* Visual breathing bellows outer circle */}
                  <motion.div
                    animate={{
                      scale: isBreathing 
                        ? (breath.phase === "Tarik" || breath.phase === "Tahan" ? 1.4 : 0.95)
                        : 1
                    }}
                    transition={{
                      duration: 4,
                      ease: "easeInOut"
                    }}
                    layout
                    style={{ referrerPolicy: "no-referrer" }}
                    className={`absolute inset-0 rounded-full border border-dashed transition-colors duration-1000 ${
                      isBreathing
                        ? breath.phase === "Tarik"
                          ? "border-sage-primary bg-sage-light/25"
                          : breath.phase === "Tahan"
                          ? "border-blue-400 bg-blue-50/20"
                          : breath.phase === "Hembuskan"
                          ? "border-gray-300 bg-gray-50/10"
                          : "border-orange-300 bg-orange-50/10"
                        : "border-outline-variant bg-background-soft"
                    }`}
                  />

                {/* Dense center target circle */}
                <div className="z-10 w-24 h-24 rounded-full bg-white border border-outline-variant/40 flex flex-col items-center justify-center shadow-md">
                  <span className="font-mono text-xs text-charcoal-muted uppercase tracking-wider font-extrabold">
                    {breath.phase}
                  </span>
                  <span className="font-display text-2xl font-black text-sage-primary">
                    {breath.remaining}s
                  </span>
                </div>
              </div>

              {/* Status Guide text */}
              <div className="text-center mt-2">
                <p className="font-sans text-sm font-semibold text-charcoal-dark min-h-6">
                  {!isBreathing 
                    ? "Klik tombol di bawah untuk memulai siklus ketenangan." 
                    : breath.phase === "Tarik" 
                    ? "Tarik napas lembut dan perlahan... isi paru-parumu." 
                    : breath.phase === "Tahan"
                    ? "Tahan napas sejenak... rasakan ketenangan batin."
                    : breath.phase === "Hembuskan"
                    ? "Hembuskan perlahan... lepaskan seluruh ketegangan otot."
                    : "Paru-paru kosong... rileks, nikmati keheningan sesaat."
                  }
                </p>
              </div>

              {/* Triggers */}
              <button
                onClick={() => setIsBreathing(!isBreathing)}
                className={`px-6 py-2.5 rounded-full font-sans text-xs font-bold tracking-wider uppercase transition-all shadow-sm ${
                  isBreathing
                    ? "bg-coral-panic text-white hover:bg-red-700"
                    : "bg-sage-primary text-white hover:bg-sage-dark"
                } flex items-center gap-2 cursor-pointer`}
              >
                {isBreathing ? (
                  <>
                    <Square className="w-3.5 h-3.5 fill-current" />
                    Hentikan Latihan
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Mulai Bimbingan Visual
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Serene stack images with no-referrer */}
          <div className="w-full md:w-1/3 flex justify-center items-center z-10 shrink-0">
            <div className="w-full max-w-[200px] aspect-square rounded-2xl overflow-hidden shadow-sm border bg-background-soft">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAlTe7-phVt2p9j-lwEOIs9u8RBNx1gioPyCHoa4HAsB3LAArrCs_2j340EqjF0Eq1qA8AM6cFCCyCSFdF_RXaFHn3hBqMvaD_VTYkdfMGutyThU6f9E6NQh0mbtoUz1aqmhMiIcNVTfUrGleBLAL3ktanj8oF4Mk_ZBCVrHBp_2HS-Z6LYd0URYcbqqoFrcZOUe_UfLS9Fbt84sEqvXtTyvfJp4wpxM3uZNtCrPcB2NR6tkYyJR8MQfs2JofqyiLaZQHRAhbd34ao"
                alt="Stacked Calm Stones"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Interactive Anxiety Journal (Right, 4 cols) */}
        <div className="col-span-1 lg:col-span-4 bg-white rounded-2xl border border-outline-variant/20 p-6 safe-shadow flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-sage-primary" />
            <h3 className="font-display font-bold text-lg text-charcoal-dark">
              Manajemen Jurnal Mini
            </h3>
          </div>
          
          <p className="font-sans text-xs text-charcoal-muted leading-relaxed">
            Menuliskan apa yang memicu rasa cemas membantumu melacak pemicu emosi dan memisahkan pikiran kognitif dari kecemasan irasional.
          </p>

          {/* Mini input form */}
          <form onSubmit={handleAddJournal} className="flex flex-col gap-3 mt-1.5 p-3 rounded-xl bg-background-soft border border-outline-variant/15">
            <div>
              <label className="block text-[10px] uppercase font-mono tracking-wider text-charcoal-dark font-black mb-1">
                Pemicu Utama (Trigger)
              </label>
              <input
                type="text"
                required
                value={newTrigger}
                onChange={(e) => setNewTrigger(e.target.value)}
                placeholder="Contoh: Skripsi ditolak, KRS bentrok..."
                className="w-full bg-white border border-outline-variant/35 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-sage-primary transition-all text-charcoal-dark"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-mono tracking-wider text-charcoal-dark font-black mb-1">
                Sensasi Tubuh (Feeling)
              </label>
              <input
                type="text"
                required
                value={newFeeling}
                onChange={(e) => setNewFeeling(e.target.value)}
                placeholder="Contoh: Deg-degan, otot pundak kaku..."
                className="w-full bg-white border border-outline-variant/35 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-sage-primary transition-all text-charcoal-dark"
              />
            </div>

            <div className="flex justify-between items-center gap-2">
              <div>
                <label className="block text-[10px] uppercase font-mono tracking-wider text-charcoal-dark font-black mb-1">
                  Intensitas
                </label>
                <select
                  value={newIntensity}
                  onChange={(e) => setNewIntensity(e.target.value)}
                  className="bg-white border border-outline-variant/35 rounded-lg px-2 py-1 text-xs text-charcoal-dark"
                >
                  <option>Ringan</option>
                  <option>Sedang</option>
                  <option>Berat (Panic)</option>
                </select>
              </div>

              <button
                type="submit"
                className="self-end bg-sage-primary hover:bg-sage-dark text-white font-semibold text-xs px-4 py-2 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Catat Log
              </button>
            </div>
          </form>

          {/* History Feed */}
          <div className="mt-2 flex flex-col gap-2 max-h-40 overflow-y-auto pr-1">
            <div className="flex justify-between items-center">
              <span className="font-mono text-[9px] uppercase tracking-wider text-outline font-extrabold flex items-center gap-1">
                <Clock className="w-3 h-3" /> Riwayat Cemas Luring ({journalLogs.length})
              </span>
              {journalLogs.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearJournal}
                  className="text-[9px] font-bold text-coral-panic hover:underline cursor-pointer flex items-center gap-0.5"
                >
                  <Trash2 className="w-3 h-3" /> Hapus
                </button>
              )}
            </div>

            {journalLogs.length === 0 ? (
              <p className="font-sans text-xs italic text-center p-3 text-charcoal-muted">
                Jurnal bersih. Pikiranmu tenang hari ini.
              </p>
            ) : (
              journalLogs.map((log) => (
                <div key={log.id} className="bg-white p-2.5 rounded-lg border border-outline-variant/20 text-xs flex flex-col gap-1">
                  <div className="flex justify-between font-bold text-charcoal-muted text-[10px] border-b border-background-soft pb-1">
                    <span>{log.date}</span>
                    <span className="text-sage-primary">Grounding Ok</span>
                  </div>
                  <p className="font-sans font-semibold text-charcoal-dark italic">"{log.trigger}"</p>
                  <p className="text-charcoal-muted text-[11px] leading-relaxed">{log.feeling}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Card 3: Tips Harian (Left Column, Bottom, 4 cols) */}
        <div className="col-span-1 lg:col-span-4 bg-sage-light rounded-2xl p-6 border border-sage-primary/20 text-sage-dark flex flex-col justify-between items-start min-h-[220px]">
          <div className="flex flex-col gap-2 w-full">
            <div className="flex justify-between items-center w-full">
              <span className="bg-white text-sage-primary px-3 py-1 rounded-full text-xs font-bold leading-none select-none">
                Tips Relaksasi Hari Ini
              </span>
              <button
                onClick={handleNextTip}
                className="text-xs hover:underline font-bold text-sage-primary cursor-pointer"
              >
                Acak Tips ⇄
              </button>
            </div>
            <p className="font-sans text-sm md:text-base italic leading-relaxed font-semibold mt-3 text-sage-dark">
              "{relaxTips[currentTipIndex]}"
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs font-mono font-bold text-sage-dark">
            <Smile className="w-4 h-4 fill-current text-sage-dark" />
            <span>Tarik napas, lepaskan beban.</span>
          </div>
        </div>

        {/* Card 4: Direktori Kontak Darurat (Right Column, Bottom, 8 cols) */}
        <div className="col-span-1 lg:col-span-8 bg-white rounded-2xl border border-coral-panic/20 p-6 md:p-8 safe-shadow flex flex-col gap-5">
          <div className="flex items-center gap-3 border-b border-outline-variant pb-4">
            <div className="w-10 h-10 rounded-full bg-coral-pink flex items-center justify-center text-coral-panic">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-black text-lg text-charcoal-dark">
                Direktori Kontak Darurat Psikologis
              </h3>
              <span className="text-xs text-charcoal-muted font-medium">Bantuan Tanggap Krisis Mental Kampus &amp; Nasional</span>
            </div>
          </div>

          <ul className="flex flex-col gap-3">
            {contactsList.map((contact) => (
              <li
                key={contact.id}
                className={`flex flex-col sm:flex-row justify-between sm:items-center p-4 bg-white rounded-xl border transition-all gap-4 ${
                  contact.isEmergency
                    ? "border-red-200 hover:border-red-400 bg-red-50/5"
                    : "border-outline-variant/30 hover:border-sage-primary"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {contact.isEmergency && (
                      <span className="bg-coral-pink text-coral-dark-text text-[9px] uppercase font-black px-2 py-0.5 rounded border border-red-200">
                        DARURAT UTAMA
                      </span>
                    )}
                    <h4 className="font-sans font-bold text-sm text-charcoal-dark">
                      {contact.title}
                    </h4>
                  </div>
                  <p className="text-xs text-charcoal-muted uppercase tracking-wide font-medium">
                    {contact.subtitle}
                  </p>
                </div>
                
                <button
                  onClick={() => handleDial(contact)}
                  className={`w-full sm:w-auto px-5 py-2.5 rounded-full font-sans text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer ${
                    contact.isEmergency
                      ? "bg-coral-panic text-white hover:bg-red-700"
                      : "border border-sage-primary text-sage-primary hover:bg-sage-light/25 bg-white"
                  }`}
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>{contact.isEmergency ? "Mulai Panggilan Darurat" : "Hubungi Layanan"}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>

      {/* Confirm clear journal */}
      <FeedbackModal
        isOpen={showJournalConfirm}
        variant="confirm"
        title="Hapus Jurnal"
        message="Apakah Anda ingin menghapus catatan mini jurnal kecemasan ini?"
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        onClose={() => setShowJournalConfirm(false)}
        onConfirm={confirmClearJournal}
      />

      {/* Dial emergency feedback */}
      <FeedbackModal
        isOpen={dialFeedback !== null}
        title={dialFeedback?.title}
        message={dialFeedback?.message || ""}
        onClose={() => setDialFeedback(null)}
      />
    </>
  );
}
