import React, { useState, useRef, useEffect, useCallback } from "react";
import { 
  Users, 
  Clock, 
  Send, 
  MessageSquare, 
} from "lucide-react";
import { Message, StudentSession } from "../types";

interface CounselorViewProps {
  studentId: string;
  messages: Message[];
  counselorName: string;
  onLogout: () => void;
}

interface QueueItem {
  id: string;
  name: string;
  status: string;
  created_at: string;
}

export default function CounselorView({
  studentId,
  messages: propMessages,
  counselorName,
  onLogout,
}: CounselorViewProps) {
  const [counselorOnline, setCounselorOnline] = useState(true);
  const [inputText, setInputText] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState(studentId);
  const [showMobileQueue, setShowMobileQueue] = useState(false);

  // API-driven queue and messages
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [selectedMessages, setSelectedMessages] = useState<Message[]>(propMessages);

  const chatEndRef = useRef<HTMLDivElement>(null);

  function formatTimestamp(ts: string): string {
    const ms = Number(ts);
    if (isNaN(ms)) return ts;
    return new Date(ms).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Jakarta",
    }) + " WIB";
  }

  // Fetch queue from API
  const fetchQueue = useCallback(async () => {
    try {
      const res = await fetch("/api/counselor/queue");
      if (res.ok) {
        const data = await res.json();
        setQueue(data.queue || []);
      }
    } catch {
      // Keep existing queue
    }
  }, []);

  // Fetch messages for selected student
  const fetchStudentMessages = useCallback(async () => {
    if (!selectedStudentId) return;
    try {
      const res = await fetch(`/api/chat/history?studentId=${selectedStudentId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.messages) {
          setSelectedMessages(data.messages);
        }
      }
    } catch {
      // Keep existing messages
    }
  }, [selectedStudentId]);

  // Initial fetch + polling
  useEffect(() => { fetchQueue(); }, [fetchQueue]);
  useEffect(() => { fetchStudentMessages(); }, [fetchStudentMessages]);

  // Poll queue every 5s
  useEffect(() => {
    const interval = setInterval(fetchQueue, 5000);
    return () => clearInterval(interval);
  }, [fetchQueue]);

  // Poll messages every 3s when student is selected
  useEffect(() => {
    if (!selectedStudentId) return;
    const interval = setInterval(fetchStudentMessages, 3000);
    return () => clearInterval(interval);
  }, [selectedStudentId, fetchStudentMessages]);

  // Auto-scroll only if user was near bottom
  const counselorChatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = counselorChatRef.current;
    if (!container) return;
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;
    if (isNearBottom) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedMessages]);

  // Update selectedMessages when propMessages change (for current studentId)
  useEffect(() => {
    if (selectedStudentId === studentId) {
      setSelectedMessages(propMessages);
    }
  }, [propMessages, selectedStudentId, studentId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const timestamp = String(Date.now());

    const modelMessage: Message = {
      id: Date.now().toString(),
      role: "model",
      text: inputText.trim(),
      timestamp,
    };

    // Optimistic local update
    setSelectedMessages((prev) => [...prev, modelMessage]);
    setInputText("");

    // Send via API
    try {
      await fetch("/api/counselor/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: selectedStudentId, text: modelMessage.text, timestamp }),
      });
    } catch {
      console.warn("Counselor message API failed, saved locally.");
    }
  };

  const displayedMessages = selectedStudentId === studentId
    ? (selectedMessages.length > 0 ? selectedMessages : propMessages)
    : selectedMessages;

  const queueList: StudentSession[] = queue.map((item) => ({
    id: item.id,
    name: item.name,
    waitingSince: item.status === "active" ? "Sedang Aktif" : "Menunggu",
    status: item.status as "waiting" | "active" | "completed",
    unreadCount: 0,
  }));

  return (
    <div className="flex-grow flex flex-col md:flex-row max-w-7xl mx-auto w-full px-4 py-6 md:py-8 h-[calc(100vh-200px)] md:h-[calc(100vh-120px)] min-h-[50vh] md:min-h-[600px] gap-6">
      
      {/* 1. Counselor Sidebar Panel (Left split, 1/3 cols) */}
      {showMobileQueue && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black/30 backdrop-blur-sm"
          onClick={() => setShowMobileQueue(false)}
        />
      )}
      <section
        className={`
          ${showMobileQueue ? "max-md:fixed max-md:inset-4 max-md:z-40 max-md:rounded-2xl" : "max-md:hidden"}
          md:flex w-full md:w-80 flex-col bg-white rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden shrink-0
        `}
      >
        <div className="p-5 border-b border-outline-variant/20 bg-[#f8fbfc]">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="font-display font-extrabold text-charcoal-muted text-lg select-none">
                Student Queue
              </h2>
              <p className="text-[11px] font-mono uppercase text-outline tracking-wider font-extrabold">
                Antrean Curhat Kampus
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-sage-light text-sage-dark font-sans text-xs font-bold px-3 py-1 rounded-full">
                {queue.length} Terdaftar
              </span>
              <button
                onClick={() => setShowMobileQueue(false)}
                className="md:hidden p-1.5 min-w-[44px] min-h-[44px] rounded-full hover:bg-background-soft text-charcoal-muted cursor-pointer flex items-center justify-center"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-outline-variant/20 shadow-inner">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-sage-light flex items-center justify-center text-sage-primary text-sm font-bold shadow-inner">
                  BK
                </div>
                <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${counselorOnline ? 'bg-sage-primary' : 'bg-outline-variant'}`}></span>
              </div>
              <div>
                <p className="font-sans font-bold text-xs text-charcoal-dark leading-none">
                  {counselorName || "Konselor BK"}
                </p>
                <p className="text-[10px] text-charcoal-muted mt-1 font-medium">
                  Dosen BK Kampus Online
                </p>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="text-[10px] text-coral-panic hover:underline font-bold px-2 py-1 cursor-pointer hover:bg-red-50 rounded-lg transition-colors shrink-0"
              title="Keluar dari Portal"
            >
              Log out
            </button>
          </div>

          <div className="flex justify-between items-center mt-4">
            <span className="font-sans text-xs text-charcoal-muted font-semibold">
              Status Konselor:
            </span>
            <button
              onClick={() => setCounselorOnline(!counselorOnline)}
              className={`px-4 py-1.5 rounded-full font-mono text-[10px] font-bold tracking-wider uppercase transition-colors pointer-events-auto cursor-pointer ${
                counselorOnline 
                  ? "bg-sage-light text-sage-dark border border-sage-primary/30" 
                  : "bg-outline-variant/20 text-charcoal-muted border"
              }`}
            >
              {counselorOnline ? "● MENERIMA CHAT" : "○ SEDANG SIBUK"}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 bg-[#fdfdfd]">
          <span className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-outline px-2 py-1 select-none">
            Antrean Masuk
          </span>

          {queueList.length === 0 && (
            <p className="text-xs text-charcoal-muted italic p-3 text-center">
              Belum ada mahasiswa yang mengirim curhat.
            </p>
          )}

          {queueList.map((student) => {
            const isSelected = student.id === selectedStudentId;
            return (
              <button
                key={student.id}
                onClick={() => setSelectedStudentId(student.id)}
                className={`w-full text-left rounded-xl p-3.5 border transition-all flex justify-between items-center cursor-pointer ${
                  isSelected
                    ? "bg-[#e3efff] border-blue-300 shadow-sm"
                    : "bg-white hover:bg-background-soft border-outline-variant/15"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-2 h-2 rounded-full ${student.status === 'active' ? 'bg-sage-primary' : 'bg-outline-variant'}`}></span>
                    <span className="font-sans text-xs md:text-sm font-bold text-charcoal-dark">
                      {student.name}
                    </span>
                    {student.unreadCount > 0 && (
                      <span className="bg-coral-panic text-white text-[9px] font-black px-1.5 py-0.2 rounded-full animate-pulse">
                        {student.unreadCount}
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-[10px] text-charcoal-muted flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {student.waitingSince}
                  </span>
                </div>
                {isSelected && (
                  <span className="text-[10px] uppercase font-mono font-bold text-sage-primary">Aktif</span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. Chat Workspace */}
      <section className="flex-1 flex flex-col bg-white rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden h-full">
        <div className="p-4 bg-[#f8fbfc] border-b border-outline-variant/20 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMobileQueue(true)}
              className="md:hidden p-2 min-w-[44px] min-h-[44px] rounded-lg hover:bg-white text-charcoal-muted hover:text-sage-primary transition-colors cursor-pointer flex items-center justify-center"
              title="Buka antrean"
            >
              <Users className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-display font-extrabold text-blue-600 shadow-inner">
               S
            </div>
            <div>
              <h3 className="font-sans font-bold text-sm md:text-base text-charcoal-dark">
                Sesi Curhat: {selectedStudentId}
              </h3>
              <p className="font-sans text-xs text-charcoal-muted font-medium flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sage-primary"></span>
                 Anonim • Dosen BK Terhubung Secara Aman
              </p>
            </div>
          </div>
          </div>
          </div>

        <div ref={counselorChatRef} className="flex-1 p-5 overflow-y-auto space-y-4 bg-[#fbfdfd]/60">
          <div className="flex justify-center">
            <span className="bg-background-soft border border-outline-variant/20 rounded-full text-charcoal-muted font-sans text-xs font-semibold px-4 py-1 animate-pulse">
              Sesi konseling aman dimulai
            </span>
          </div>

          {displayedMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 h-40 text-center max-w-sm mx-auto">
              <MessageSquare className="w-10 h-10 text-outline-variant/80" />
              <p className="text-xs font-sans text-charcoal-muted italic">
                Belum ada pesan dari mahasiswa ini. Tunggu hingga mereka memulai percakapan.
              </p>
            </div>
          ) : (
            displayedMessages.map((msg) => {
              const isCounselor = msg.role === "model";
              return (
                <div
                  key={msg.id}
                  className={`flex ${isCounselor ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] p-4 rounded-2xl font-sans text-xs md:text-sm shadow-inner ${
                      isCounselor
                        ? "bg-sage-light text-charcoal-dark rounded-br-sm"
                        : "bg-[#e3efff] text-charcoal-dark rounded-bl-sm border border-blue-200"
                    }`}
                  >
                    <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                    <span className="block text-right text-[9px] text-charcoal-muted mt-1">
                      {formatTimestamp(msg.timestamp)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={chatEndRef} />
        </div>

        {displayedMessages.length > 0 && (
          <div className="p-4 bg-background-soft border-t border-outline-variant/15 flex flex-col gap-2.5">
          </div>
        )}

        <div className="p-4 border-t border-outline-variant/20 bg-white">
          <form onSubmit={handleSend} className="flex gap-2 p-2 bg-background-soft border rounded-xl items-center focus-within:border-sage-primary transition-all">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={displayedMessages.length === 0 ? "Tunggu mahasiswa mulai curhat..." : "Balas bimbingan konseling dengan empati..."}
              disabled={displayedMessages.length === 0}
              className="flex-1 bg-transparent px-2.5 text-xs md:text-sm text-charcoal-dark border-none outline-none focus:outline-none focus:ring-0"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className={`p-3 rounded-lg text-white font-semibold flex items-center justify-center transition-all cursor-pointer ${
                inputText.trim() ? "bg-sage-primary hover:bg-sage-dark hover:scale-105" : "bg-outline-variant/40"
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="text-center mt-2">
            <p className="text-[10px] text-charcoal-muted leading-tight font-sans">
              Pesan tersimpan di database. Mahasiswa dapat melihat balasan secara real-time.
            </p>
          </div>
        </div>

      </section>

    </div>
  );
}
