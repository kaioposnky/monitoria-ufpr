import { useEffect, useState } from 'react';
import { errorMessage } from './api/http';

type QueryState<T> =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; data: T };

export function useQuery<T>(load: (signal: AbortSignal) => Promise<T>) {
  const [state, setState] = useState<QueryState<T>>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setState({ status: 'loading' });
    void load(controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setState({ status: 'success', data });
      },
      (error) => {
        if (!controller.signal.aborted)
          setState({ status: 'error', message: errorMessage(error) });
      },
    );
    return () => controller.abort();
  }, [load, attempt]);
  return { state, retry: () => setAttempt((value) => value + 1) };
}
