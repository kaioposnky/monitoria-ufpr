import type { ReactNode } from 'react';

type Props<T> = {
  state:
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'success'; data: T };
  retry: () => void;
  children: (data: T) => ReactNode;
};

export function QueryResult<T>({ state, retry, children }: Props<T>) {
  if (state.status === 'loading')
    return (
      <p role="status" className="panel">
        Carregando dados…
      </p>
    );
  if (state.status === 'error')
    return (
      <div className="notice error" role="alert">
        <p>{state.message}</p>
        <button onClick={retry}>Tentar novamente</button>
      </div>
    );
  return children(state.data);
}
