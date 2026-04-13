import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const FeedbackContext = createContext(null);

const TOAST_VARIANTS = {
  success: {
    container:
      "border-emerald-400/40 bg-emerald-500/15 text-emerald-200 shadow-emerald-900/40",
    iconClass: "text-emerald-300",
    Icon: CheckCircleIcon,
    title: "Success",
  },
  error: {
    container: "border-red-400/40 bg-red-500/15 text-red-200 shadow-red-900/40",
    iconClass: "text-red-300",
    Icon: ExclamationCircleIcon,
    title: "Error",
  },
  warning: {
    container:
      "border-amber-400/40 bg-amber-500/15 text-amber-100 shadow-amber-900/40",
    iconClass: "text-amber-300",
    Icon: ExclamationTriangleIcon,
    title: "Warning",
  },
  info: {
    container: "border-sky-400/40 bg-sky-500/15 text-sky-100 shadow-sky-900/40",
    iconClass: "text-sky-300",
    Icon: InformationCircleIcon,
    title: "Info",
  },
};

const DEFAULT_CONFIRM = {
  title: "Please Confirm",
  message: "Are you sure you want to continue?",
  confirmText: "Confirm",
  cancelText: "Cancel",
  tone: "danger",
};

export const FeedbackProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState(null);

  const toastIdRef = useRef(0);
  const confirmResolverRef = useRef(null);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message, options = {}) => {
      const {
        type = "success",
        title,
        duration = 3200,
      } = options;

      const variant = TOAST_VARIANTS[type] ? type : "info";
      const id = ++toastIdRef.current;

      setToasts((prev) => {
        const next = [
          ...prev,
          {
            id,
            message,
            type: variant,
            title: title || TOAST_VARIANTS[variant].title,
          },
        ];

        // Keep only the most recent four notifications.
        return next.slice(-4);
      });

      if (duration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, duration);
      }

      return id;
    },
    [dismissToast],
  );

  const resolveConfirm = useCallback((result) => {
    if (confirmResolverRef.current) {
      confirmResolverRef.current(result);
      confirmResolverRef.current = null;
    }
    setConfirmDialog(null);
  }, []);

  const confirm = useCallback((options = {}) => {
    return new Promise((resolve) => {
      if (confirmResolverRef.current) {
        confirmResolverRef.current(false);
      }

      confirmResolverRef.current = resolve;
      setConfirmDialog({ ...DEFAULT_CONFIRM, ...options });
    });
  }, []);

  useEffect(() => {
    if (!confirmDialog) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        resolveConfirm(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [confirmDialog, resolveConfirm]);

  const value = useMemo(
    () => ({
      showToast,
      confirm,
    }),
    [showToast, confirm],
  );

  return (
    <FeedbackContext.Provider value={value}>
      {children}

      <div className="fixed top-4 right-4 z-[100] space-y-3 pointer-events-none">
        {toasts.map((toast) => {
          const variant = TOAST_VARIANTS[toast.type] || TOAST_VARIANTS.info;
          const Icon = variant.Icon;

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto w-[min(92vw,380px)] rounded-xl border px-4 py-3 backdrop-blur-md shadow-2xl ${variant.container}`}
              role="status"
              aria-live="polite"
            >
              <div className="flex items-start gap-3">
                <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${variant.iconClass}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{toast.title}</p>
                  <p className="text-sm leading-snug opacity-90">{toast.message}</p>
                </div>
                <button
                  type="button"
                  onClick={() => dismissToast(toast.id)}
                  className="p-1 rounded-md hover:bg-white/10 transition-colors"
                  aria-label="Dismiss notification"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {confirmDialog && (
        <div
          className="fixed inset-0 z-[110] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              resolveConfirm(false);
            }
          }}
        >
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0f1118] shadow-2xl p-6">
            <h3 className="text-xl font-semibold text-white mb-2">
              {confirmDialog.title}
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed mb-6">
              {confirmDialog.message}
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => resolveConfirm(false)}
                className="px-4 py-2 rounded-lg border border-white/15 bg-white/5 text-gray-200 hover:bg-white/10 transition-colors"
              >
                {confirmDialog.cancelText}
              </button>
              <button
                type="button"
                onClick={() => resolveConfirm(true)}
                className={`px-4 py-2 rounded-lg text-white transition-colors ${
                  confirmDialog.tone === "danger"
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-emerald-500 hover:bg-emerald-600"
                }`}
              >
                {confirmDialog.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </FeedbackContext.Provider>
  );
};

export const useFeedback = () => {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error("useFeedback must be used inside FeedbackProvider");
  }
  return context;
};
