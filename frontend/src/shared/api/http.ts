export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const baseUrl = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(
  /\/$/,
  '',
);

export async function getJson<T>(
  path: string,
  signal: AbortSignal,
): Promise<T> {
  const response = await fetch(baseUrl + path, {
    signal,
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new ApiError(
      response.status,
      response.status === 404
        ? 'Registro não encontrado.'
        : 'Não foi possível consultar o backend (HTTP ' +
            response.status +
            ').',
    );
  }
  try {
    return (await response.json()) as T;
  } catch {
    throw new ApiError(502, 'O backend retornou uma resposta inválida.');
  }
}

export function errorMessage(error: unknown): string {
  return error instanceof ApiError
    ? error.message
    : 'Não foi possível conectar ao backend. Verifique se o Spring está em execução.';
}
