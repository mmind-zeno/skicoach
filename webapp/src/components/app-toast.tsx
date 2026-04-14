"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type ToastKind = "success" | "error" | "info";

type ToastItem = {
  id: string;
  message: string;
  kind: ToastKind;
};

type AppToastContextValue = {
  showToast: (message: string, kind?: ToastKind) => void;
  successToastsEnabled: boolean;
  infoToastsEnabled: boolean;
  sessionQuietModeEnabled: boolean;
  setSuccessToastsEnabled: (enabled: boolean) => void;
  setInfoToastsEnabled: (enabled: boolean) => void;
  toggleSuccessToasts: () => void;
  toggleInfoToasts: () => void;
  toggleSessionQuietMode: () => void;
};

const AppToastContext = createContext<AppToastContextValue | null>(null);
const TOAST_TTL_MS = 5000;
const TOAST_DEDUPE_WINDOW_MS = 1500;
const MAX_VISIBLE_TOASTS = 3;
const SUCCESS_TOASTS_STORAGE_KEY = "sk_success_toasts_enabled";
const INFO_TOASTS_STORAGE_KEY = "sk_info_toasts_enabled";

export function AppToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [successToastsEnabled, setSuccessToastsEnabledState] = useState(true);
  const [infoToastsEnabled, setInfoToastsEnabledState] = useState(true);
  const [sessionQuietModeEnabled, setSessionQuietModeEnabled] = useState(false);
  const recentToastsRef = useRef<Map<string, number>>(new Map());
  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);
  const dismissLatestToast = useCallback(() => {
    setToasts((prev) => prev.slice(0, -1));
  }, []);

  const setSuccessToastsEnabled = useCallback((enabled: boolean) => {
    setSuccessToastsEnabledState(enabled);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        SUCCESS_TOASTS_STORAGE_KEY,
        enabled ? "1" : "0"
      );
    }
  }, []);
  const toggleSuccessToasts = useCallback(() => {
    setSuccessToastsEnabled(!successToastsEnabled);
  }, [setSuccessToastsEnabled, successToastsEnabled]);
  const setInfoToastsEnabled = useCallback((enabled: boolean) => {
    setInfoToastsEnabledState(enabled);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        INFO_TOASTS_STORAGE_KEY,
        enabled ? "1" : "0"
      );
    }
  }, []);
  const toggleInfoToasts = useCallback(() => {
    setInfoToastsEnabled(!infoToastsEnabled);
  }, [infoToastsEnabled, setInfoToastsEnabled]);
  const toggleSessionQuietMode = useCallback(() => {
    setSessionQuietModeEnabled((prev) => !prev);
  }, []);

  const showToast = useCallback((message: string, kind: ToastKind = "info") => {
    if (sessionQuietModeEnabled && kind !== "error") {
      return;
    }
    if (kind === "success" && !successToastsEnabled) {
      return;
    }
    if (kind === "info" && !infoToastsEnabled) {
      return;
    }
    const now = Date.now();
    const dedupeKey = `${kind}|${message}`;
    const lastSeen = recentToastsRef.current.get(dedupeKey);
    if (lastSeen && now - lastSeen < TOAST_DEDUPE_WINDOW_MS) {
      return;
    }
    recentToastsRef.current.set(dedupeKey, now);

    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}_${Math.random()}`;
    setToasts((prev) => {
      const next = [...prev, { id, message, kind }];
      return next.slice(-MAX_VISIBLE_TOASTS);
    });
    window.setTimeout(() => {
      dismissToast(id);
    }, TOAST_TTL_MS);
    window.setTimeout(() => {
      const current = recentToastsRef.current.get(dedupeKey);
      if (current === now) {
        recentToastsRef.current.delete(dedupeKey);
      }
    }, TOAST_DEDUPE_WINDOW_MS + 50);
  }, [
    dismissToast,
    infoToastsEnabled,
    sessionQuietModeEnabled,
    successToastsEnabled,
  ]);

  const value = useMemo(
    () => ({
      showToast,
      successToastsEnabled,
      infoToastsEnabled,
      sessionQuietModeEnabled,
      setSuccessToastsEnabled,
      setInfoToastsEnabled,
      toggleSuccessToasts,
      toggleInfoToasts,
      toggleSessionQuietMode,
    }),
    [
      infoToastsEnabled,
      sessionQuietModeEnabled,
      setInfoToastsEnabled,
      setSuccessToastsEnabled,
      showToast,
      successToastsEnabled,
      toggleInfoToasts,
      toggleSessionQuietMode,
      toggleSuccessToasts,
    ]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(SUCCESS_TOASTS_STORAGE_KEY);
    if (raw === "0") {
      setSuccessToastsEnabledState(false);
    }
    const infoRaw = window.localStorage.getItem(INFO_TOASTS_STORAGE_KEY);
    if (infoRaw === "0") {
      setInfoToastsEnabledState(false);
    }
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      dismissLatestToast();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dismissLatestToast]);

  return (
    <AppToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[70] flex w-full max-w-sm flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-lg border px-4 py-3 text-sm shadow-lg ${
              toast.kind === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                : toast.kind === "error"
                  ? "border-red-200 bg-red-50 text-red-900"
                  : "border-sk-ink/10 bg-white text-sk-ink"
            }`}
            role={toast.kind === "error" ? "alert" : "status"}
            aria-live={toast.kind === "error" ? "assertive" : "polite"}
          >
            <div className="flex items-start justify-between gap-3">
              <span>{toast.message}</span>
              <button
                type="button"
                className="shrink-0 rounded px-1 text-xs opacity-70 hover:opacity-100"
                onClick={() => dismissToast(toast.id)}
                aria-label="Dismiss notification"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </AppToastContext.Provider>
  );
}

export function useAppToast(): AppToastContextValue {
  const ctx = useContext(AppToastContext);
  if (ctx) return ctx;
  // Defensive fallback: prevents hard client crash if a consumer
  // is rendered outside provider due layout/cache mismatch.
  return {
    showToast: () => {},
    successToastsEnabled: true,
    infoToastsEnabled: true,
    sessionQuietModeEnabled: false,
    setSuccessToastsEnabled: () => {},
    setInfoToastsEnabled: () => {},
    toggleSuccessToasts: () => {},
    toggleInfoToasts: () => {},
    toggleSessionQuietMode: () => {},
  };
}
