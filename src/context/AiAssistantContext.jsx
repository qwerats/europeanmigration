import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

const AiAssistantContext = createContext(null);

export function AiAssistantProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshImplRef = useRef(null);
  const busyRef = useRef(false);

  const openAssistant = useCallback(() => setIsOpen(true), []);
  const closeAssistant = useCallback(() => setIsOpen(false), []);
  const toggleAssistant = useCallback(() => setIsOpen((v) => !v), []);

  const registerMonitorRefresh = useCallback((fn) => {
    refreshImplRef.current = typeof fn === 'function' ? fn : null;
  }, []);

  const triggerRefresh = useCallback(async (source = 'manual') => {
    if (!refreshImplRef.current || busyRef.current) return false;
    busyRef.current = true;
    setIsRefreshing(true);
    try {
      const ok = await refreshImplRef.current(source);
      if (ok) setLastUpdatedAt(new Date().toISOString());
      return ok;
    } finally {
      busyRef.current = false;
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  const value = useMemo(
    () => ({
      isOpen,
      openAssistant,
      closeAssistant,
      toggleAssistant,
      lastUpdatedAt,
      setLastUpdatedAt,
      isRefreshing,
      registerMonitorRefresh,
      triggerRefresh,
    }),
    [
      isOpen,
      openAssistant,
      closeAssistant,
      toggleAssistant,
      lastUpdatedAt,
      isRefreshing,
      registerMonitorRefresh,
      triggerRefresh,
    ]
  );

  return <AiAssistantContext.Provider value={value}>{children}</AiAssistantContext.Provider>;
}

export function useAiAssistant() {
  const ctx = useContext(AiAssistantContext);
  if (!ctx) {
    throw new Error('useAiAssistant must be used within AiAssistantProvider');
  }
  return ctx;
}
