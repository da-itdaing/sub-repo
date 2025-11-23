import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ToastContext = createContext(null);

const TOAST_VARIANTS = {
  info: 'border-blue-200 bg-white text-gray-900',
  success: 'border-emerald-200 bg-white text-gray-900',
  error: 'border-red-200 bg-white text-gray-900',
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    ({ title, description, variant = 'info', duration = 2500 } = {}) => {
      if (!title && !description) return;
      const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
      const toast = {
        id,
        title,
        description,
        variant: TOAST_VARIANTS[variant] ? variant : 'info',
      };
      setToasts((prev) => [...prev, toast]);
      if (duration !== null) {
        window.setTimeout(() => removeToast(id), duration);
      }
    },
    [removeToast]
  );

  const contextValue = useMemo(
    () => ({
      addToast,
      removeToast,
    }),
    [addToast, removeToast]
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div className="pointer-events-none fixed top-4 right-4 flex max-w-sm flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-2xl border p-4 shadow-lg transition ${
              TOAST_VARIANTS[toast.variant] ?? TOAST_VARIANTS.info
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-1">
                {toast.title && <p className="text-sm font-semibold">{toast.title}</p>}
                {toast.description && <p className="text-xs text-gray-500 mt-1">{toast.description}</p>}
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="text-xs text-gray-400 hover:text-gray-600"
                aria-label="토스트 닫기"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToastContext = () => useContext(ToastContext);

