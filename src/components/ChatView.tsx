import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Send, 
  Paperclip, 
  Trash2, 
  Lock, 
  Compass, 
  Sparkles, 
  ShieldCheck, 
  Menu,
  CheckCheck,
  Footprints
} from "lucide-react";
import { AppView, Message } from "../types";
import FeedbackModal from "./FeedbackModal";

interface ChatViewProps {
  studentId: string;
  messages: Message[];
  onSendMessage: (text: string) => void;
  onClearHistory: () => void;
  onNavigate: (view: AppView) => void;
}

export default function ChatView({
  studentId,
  messages,
  onSendMessage,
  onClearHistory,
  onNavigate,
}: ChatViewProps) {
  const [inputText, setInputText] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom only if user was already near the bottom
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;
    if (isNearBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Adjust textarea height on text change
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim()) return;
    
    onSendMessage(inputText.trim());
    setInputText("");
    
    if (textareaRef.current) {
      textareaRef.current.style.height = "44px";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Add mock file upload trigger
  const [pickedFile, setPickedFile] = useState<string | null>(null);
  const handleFileUpload = () => {
    const mockFiles = [
      "Screenshot_KRS.png",
      "Draft_Tugas_Akhir_v3_rev.docx",
      "Hasil_Konsultasi_Dulu.pdf",
    ];
    const picked = mockFiles[Math.floor(Math.random() * mockFiles.length)];
    setPickedFile(picked);
  };

  return (
    <div className="flex-grow flex flex-col max-w-5xl mx-auto w-full px-4 h-[calc(100vh-180px)] md:h-[calc(100vh-100px)] min-h-[50vh] md:min-h-[600px]">
      {/* Dynamic Chat Frame */}
      <div className="flex-grow flex flex-col bg-white rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden relative my-4 h-full">
        
        {/* Chat Header */}
        <header className="bg-[#f7f9ff] border-b border-outline-variant/30 px-6 py-4 flex justify-between items-center z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="relative">
              {/* Profile Avatar Icon */}
              <div className="w-12 h-12 rounded-full bg-sage-light flex items-center justify-center text-sage-primary">
                <span className="font-display font-extrabold text-base">BK</span>
              </div>
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-sage-primary rounded-full border-2 border-white" title="Konselor Aktif &amp; Terhubung"></div>
            </div>
            <div>
              <h1 className="font-display font-bold text-charcoal-dark text-sm md:text-base leading-none">
                Dosen BK Terhubung (Konselor)
              </h1>
              <p className="font-sans text-xs text-charcoal-muted flex items-center gap-1 mt-1.5 font-medium">
                <Lock className="w-3.5 h-3.5 text-sage-primary" />
                Enkripsi End-to-End | <span className="font-semibold text-sage-primary">{studentId}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowClearConfirm(true)}
              className="text-charcoal-muted hover:text-coral-panic transition-colors p-2.5 min-w-[44px] min-h-[44px] rounded-full hover:bg-coral-pink flex items-center gap-2 group cursor-pointer"
              title="Akhiri Sesi &amp; Hapus Riwayat"
              id="btn-clear-chat"
            >
              <Trash2 className="w-5 h-5" />
              <span className="hidden md:inline font-sans text-xs font-semibold">Akhiri &amp; HapusSesi</span>
            </button>
          </div>
        </header>

        {/* Chat Messages List viewport */}
        <div ref={chatContainerRef} className="flex-1 p-6 overflow-y-auto flex flex-col gap-4 bg-[#f8fbfc]">
          
          {/* Day Boundary Seal */}
          <div className="flex justify-center my-2">
            <span className="bg-[#d1e4fb] text-charcoal-dark font-sans text-xs font-semibold px-4 py-1.5 rounded-full">
              Hari ini, Bilik Curhat Anonim
            </span>
          </div>

          {/* System Verifications */}
          <div className="flex justify-center mb-2">
            <div className="bg-white border border-outline-variant/30 rounded-xl p-4 max-w-xl text-center shadow-inner">
              <p className="font-sans text-xs text-charcoal-muted flex items-center justify-center gap-2 leading-relaxed">
                <ShieldCheck className="w-4 h-4 text-sage-primary shrink-0" />
                Dukungan 100% Anonim &amp; Terlindungi. Konselor tidak mengetahui nama lengkap, NIM, atau data IP Anda. Bicarakan apapun yang membuat hati Anda mengganjal.
              </p>
            </div>
          </div>

          {/* Active conversation flows */}
          <div className="flex-1 flex flex-col gap-4">
            {messages.map((msg) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-3 w-full ${
                    isUser ? "justify-end" : "justify-start"
                  }`}
                >
                  {/* Left avatar badge */}
                  {!isUser && (
                    <div className="w-8 h-8 rounded-full bg-sage-light flex-shrink-0 flex items-center justify-center text-sage-primary font-bold text-xs select-none">
                      BK
                    </div>
                  )}

                  <div
                    className={`flex flex-col gap-1 max-w-[80%] md:max-w-[70%] ${
                      isUser ? "items-end" : "items-start"
                    }`}
                  >
                    {!isUser && (
                      <span className="font-sans text-xs text-charcoal-muted ml-1 font-medium">
                        Konselor Dosen BK
                      </span>
                    )}

                    <div
                      className={`p-4 rounded-2xl font-sans text-sm md:text-base leading-relaxed ${
                        isUser
                          ? "bg-sage-light text-charcoal-dark rounded-br-sm border border-sage-light shadow-sm"
                          : "bg-white text-charcoal-dark rounded-bl-sm border border-outline-variant/30 shadow-sm"
                      }`}
                    >
                      {msg.text.startsWith("[Lampiran Dokumen Anonim:") ? (
                        <div className="flex items-center gap-2 border border-dashed border-sage-primary p-2.5 rounded-lg bg-background-soft">
                          <Compass className="w-5 h-5 text-sage-primary shrink-0" />
                          <span className="font-semibold text-xs font-mono">{msg.text}</span>
                        </div>
                      ) : (
                        <p className="whitespace-pre-line">{msg.text}</p>
                      )}
                    </div>

                    <span className="text-[10px] text-charcoal-muted mt-0.5 mx-1.5 flex items-center gap-1">
                      {msg.timestamp}
                      {isUser && <CheckCheck className="w-3 h-3 text-sage-primary" />}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Inline Breathing recommendation triggered inside the chat dynamically */}
            {messages.length >= 3 && (
              <div className="flex justify-center my-6">
                <div className="bg-white border border-sage-primary/35 rounded-2xl p-4 max-w-sm flex items-center gap-4 shadow-sm hover:border-sage-primary transition-all duration-300">
                  <div className="w-10 h-10 rounded-full bg-sage-light text-sage-primary flex items-center justify-center shadow-inner shrink-0 animate-pulse">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-display font-bold text-xs md:text-sm text-charcoal-dark mb-1">
                      Coba latihan pernapasan sejenak
                    </p>
                    <button
                      onClick={() => onNavigate(AppView.SELF_HELP)}
                      className="font-sans text-xs text-sage-primary font-bold hover:underline cursor-pointer flex items-center gap-1 text-left"
                    >
                      Buka panduan pernapasan di pusat bantuan →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Scroll bottom target */}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Floating Suggested Responses to keep user interactive */}
        {messages.length < 5 && (
          <div className="px-6 py-2 bg-white flex flex-wrap gap-2 border-t border-outline-variant/10">
            <span className="text-[10px] text-outline font-mono uppercase shrink-0 self-center">Pintas Curhat:</span>
            <button
              onClick={() => {
                setInputText("Saya sangat cemas dengan skripsi dan tugas akhir akhir-akhir ini, tidak sanggup mengerjakannya lagi.");
                textareaRef.current?.focus();
              }}
              className="text-xs border border-outline-variant/30 hover:border-sage-primary hover:bg-background-soft px-3 py-1 rounded-full text-charcoal-muted font-medium transition-all"
            >
              📝 Cemas skripsi/tugas akhir
            </button>
            <button
              onClick={() => {
                setInputText("Susah tidur beberapa minggu ini karena kepala selalu berisik memikirkan masa depan.");
                textareaRef.current?.focus();
              }}
              className="text-xs border border-outline-variant/30 hover:border-sage-primary hover:bg-background-soft px-3 py-1 rounded-full text-charcoal-muted font-medium transition-all"
            >
              💤 Susah tidur &amp; pikiran berisik
            </button>
            <button
              onClick={() => {
                setInputText("Saya merasa sangat sepi, tertekan menghadapi ekspektasi keluarga, rasanya ingin menyerah.");
                textareaRef.current?.focus();
              }}
              className="text-xs border border-outline-variant/30 hover:border-sage-primary hover:bg-background-soft px-3 py-1 rounded-full text-charcoal-muted font-medium transition-all"
            >
              🍃 Kesepian &amp; tertekan keluarga
            </button>
          </div>
        )}

        {/* Bottom Input Drawer */}
        <div className="bg-white border-t border-outline-variant/30 p-4">
          <form onSubmit={handleSend} className="flex items-end gap-3 max-w-4xl mx-auto bg-[#f8fbfc] rounded-2xl border border-outline-variant/50 p-2.5 focus-within:border-sage-primary focus-within:ring-1 focus-within:ring-sage-primary/50 transition-all shadow-inner">
            <button
              type="button"
              onClick={handleFileUpload}
              className="p-3 text-charcoal-muted hover:text-sage-primary transition-colors rounded-full hover:bg-white flex-shrink-0 cursor-pointer"
              title="Unggah KRS, berkas skripsi, atau lampiran secara anonim"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            <textarea
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Ceritakan apa yang kamu rasakan pelan-pelan..."
              className="flex-grow bg-transparent border-none outline-none focus:ring-0 resize-none font-sans text-sm md:text-base text-charcoal-dark placeholder:text-charcoal-muted/50 max-h-32 min-h-[44px] py-2.5 block leading-relaxed w-full focus:outline-none"
              id="message-input"
            />

            <button
              type="submit"
              disabled={!inputText.trim()}
              className={`p-3 rounded-full transition-all shadow-sm flex-shrink-0 cursor-pointer ${
                inputText.trim()
                  ? "bg-sage-primary text-white hover:bg-sage-dark hover:scale-105"
                  : "bg-outline-variant/35 text-white cursor-not-allowed"
              }`}
              title="Kirim pesan"
            >
              <Send className="w-5 h-5 translate-x-0.5 -translate-y-0.5" />
            </button>
          </form>

          <div className="text-center mt-2.5">
            <p className="font-sans text-[10px] text-charcoal-muted leading-none">
              Tekan <kbd className="font-mono bg-background-soft px-1.5 py-0.5 rounded font-bold border">Enter</kbd> untuk mengirim. Sesi konseling otomatis ditutup setelah 30 menit tidak aktif demi keamanan.
            </p>
          </div>
        </div>

      </div>

      {/* Confirm clear session */}
      <FeedbackModal
        isOpen={showClearConfirm}
        variant="confirm"
        title="Akhiri Sesi & Hapus Riwayat"
        message="Apakah Anda yakin ingin mengakhiri sesi bimbingan dan menghapus seluruh riwayat percakapan di perangkat ini? Sesi Anda tidak akan disimpan."
        confirmLabel="Ya, Akhiri & Hapus"
        cancelLabel="Batal"
        onClose={() => setShowClearConfirm(false)}
        onConfirm={onClearHistory}
      />

      {/* Confirm file upload */}
      <FeedbackModal
        isOpen={pickedFile !== null}
        variant="confirm"
        title="Unggah Dokumen"
        message={`Simulasi: Unggah ${pickedFile} secara anonim ke konselor?`}
        confirmLabel="Ya, Unggah"
        cancelLabel="Batal"
        onClose={() => setPickedFile(null)}
        onConfirm={() => {
          onSendMessage(`[Lampiran Dokumen Anonim: ${pickedFile}]`);
        }}
      />

    </div>
  );
}
