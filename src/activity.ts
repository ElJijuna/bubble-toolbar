import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

export interface BubbleActivityValue {
  isBusy: boolean;
  run: <T>(task: () => Promise<T>) => Promise<T>;
}

export const BubbleActivityContext = createContext<BubbleActivityValue | null>(null);

export const useBubbleActivity = (): BubbleActivityValue => {
  const activity = useContext(BubbleActivityContext);
  if (!activity) {
    throw new Error('useBubbleActivity must be used inside a BubbleGroup or BubbleToolbar.Group.');
  }
  return activity;
};

export const useGroupActivity = (externalBusy: boolean): BubbleActivityValue => {
  const [pending, setPending] = useState(0);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const run = useCallback(async <T>(task: () => Promise<T>): Promise<T> => {
    if (mounted.current) {
      setPending((count) => count + 1);
    }
    try {
      return await task();
    } finally {
      if (mounted.current) {
        setPending((count) => count - 1);
      }
    }
  }, []);

  const isBusy = externalBusy || pending > 0;
  return useMemo(() => ({ isBusy, run }), [isBusy, run]);
};
