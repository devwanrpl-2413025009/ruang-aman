import { motion, AnimatePresence } from "motion/react";
import { X, Info, AlertTriangle } from "lucide-react";

interface FeedbackModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  variant?: "alert" | "confirm";
  confirmLabel?: string;
  cancelLabel?: string;
  onClose: () => void;
  onConfirm?: () => void;
}

export default function FeedbackModal({
  isOpen,
  title,
  message,
  variant = "alert",
  confirmLabel = "Ya, Saya Yakin",
  cancelLabel = "Batal",
  onClose,
  onConfirm,
}: FeedbackModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-sm bg-white rounded-2xl border border-outline-variant/30 shadow-xl overflow-hidden"
          >
            <div className={`h-1.5 w-full ${variant === "confirm" ? "bg-coral-panic" : "bg-sage-primary"}`} />

            <div className="p-5 flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${variant === "confirm" ? "bg-coral-pink" : "bg-sage-light"}`}>
                    {variant === "confirm" ? (
                      <AlertTriangle className="w-4 h-4 text-coral-panic" />
                    ) : (
                      <Info className="w-4 h-4 text-sage-primary" />
                    )}
                  </div>
                  <h3 className="font-display font-bold text-sm text-charcoal-dark">
                    {title || (variant === "confirm" ? "Konfirmasi" : "Informasi")}
                  </h3>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 text-charcoal-muted hover:text-charcoal-dark hover:bg-background-soft rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="font-sans text-xs md:text-sm text-charcoal-muted leading-relaxed whitespace-pre-line">
                {message}
              </p>

              {variant === "confirm" ? (
                <div className="flex gap-2.5">
                  <button
                    onClick={onClose}
                    className="flex-1 bg-background-soft hover:bg-outline-variant/30 text-charcoal-dark font-semibold text-xs rounded-full py-2.5 transition-all cursor-pointer"
                  >
                    {cancelLabel}
                  </button>
                  <button
                    onClick={() => {
                      onConfirm?.();
                      onClose();
                    }}
                    className="flex-1 bg-coral-panic hover:bg-red-700 text-white font-semibold text-xs rounded-full py-2.5 transition-all cursor-pointer"
                  >
                    {confirmLabel}
                  </button>
                </div>
              ) : (
                <button
                  onClick={onClose}
                  className="w-full bg-sage-primary hover:bg-sage-dark text-white font-semibold text-xs rounded-full py-2.5 transition-all cursor-pointer"
                >
                  OK, Saya Mengerti
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
