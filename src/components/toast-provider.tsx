"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

export type ToastType = "achievement" | "level-up" | "quest" | "boss-defeat" | "info" | "error";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  icon?: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

// -----------------------------------------------------------------------
// Context
// -----------------------------------------------------------------------

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}

// -----------------------------------------------------------------------
// Provider
// -----------------------------------------------------------------------

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counterRef = useRef(0);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = `toast-${++counterRef.current}`;
      const duration = toast.duration ?? 4000;
      setToasts((prev) => [...prev, { ...toast, id }]);

      setTimeout(() => removeToast(id), duration);
    },
    [removeToast],
  );

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
}

// -----------------------------------------------------------------------
// Container
// -----------------------------------------------------------------------

const TYPE_STYLES: Record<ToastType, { bg: string; border: string; defaultIcon: string }> = {
  achievement: { bg: "#1a2a40", border: "#4a9eff", defaultIcon: "🏆" },
  "level-up": { bg: "#0d2818", border: "#2ecc71", defaultIcon: "⬆" },
  quest: { bg: "#2a1a0d", border: "#f39c12", defaultIcon: "📜" },
  "boss-defeat": { bg: "#2a0d1a", border: "#e74c3c", defaultIcon: "💀" },
  info: { bg: "#1a1a2e", border: "#9b59b6", defaultIcon: "ℹ" },
  error: { bg: "#2a0d0d", border: "#e74c3c", defaultIcon: "✕" },
};

function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div className="toast-container">
      {toasts.map((toast) => {
        const style = TYPE_STYLES[toast.type];
        return (
          <div
            key={toast.id}
            className="toast-entry"
            style={{
              background: style.bg,
              borderLeft: `4px solid ${style.border}`,
            }}
            onClick={() => onDismiss(toast.id)}
          >
            <span className="toast-icon">{toast.icon ?? style.defaultIcon}</span>
            <div className="toast-body">
              <p className="toast-title">{toast.title}</p>
              {toast.description && <p className="toast-desc">{toast.description}</p>}
            </div>
          </div>
        );
      })}
      <style>{`
        .toast-container {
          position: fixed;
          top: 1rem;
          right: 1rem;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          max-width: 360px;
          pointer-events: none;
        }
        .toast-entry {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 0.85rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          pointer-events: auto;
          animation: toast-slide-in 0.3s ease-out;
          box-shadow: 0 4px 16px rgba(0,0,0,0.4);
        }
        @keyframes toast-slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .toast-icon { font-size: 1.4rem; line-height: 1; }
        .toast-body { flex: 1; min-width: 0; }
        .toast-title {
          margin: 0;
          font-size: 0.85rem;
          font-weight: 600;
          color: #e2e8f0;
        }
        .toast-desc {
          margin: 0.15rem 0 0;
          font-size: 0.75rem;
          color: #94a3b8;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      `}</style>
    </div>
  );
}
