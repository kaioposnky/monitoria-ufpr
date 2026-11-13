const TOKEN_STORAGE_KEY = 'monitoria_auth_token';
let memoryToken: string | null = null;

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly fieldErrors?: Record<string, string>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function getAuthToken(): string | null {
  try {
    if (typeof globalThis.localStorage?.getItem === 'function') {
      return globalThis.localStorage.getItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    // Fallback para memória quando localStorage estiver indisponível.
  }
  return memoryToken;
}

export function setAuthToken(token: string | null): void {
  memoryToken = token;
  try {
    if (typeof globalThis.localStorage?.setItem !== 'function') return;
    if (token) {
      globalThis.localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      globalThis.localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    // Ignora indisponibilidade de storage em ambientes restritos.
  }
}

const baseUrl = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(
  /\/$/,
  '',
);

export function apiUrl(path: string): string {
  return baseUrl + path;
}

interface BackendErrorBody {
  mensagem?: unknown;
  erros?: unknown;
}

function defaultStatusMessage(status: number): string {
  if (status === 401) {
    return 'Autenticação necessária ou sessão expirada. Faça login novamente.';
  }
  if (status === 403) {
    return 'Você não tem permissão para executar esta operação.';
  }
  if (status === 404) {
    return 'Registro não encontrado.';
  }
  return 'Não foi possível consultar o backend (HTTP ' + status + ').';
}

async function toApiError(response: Response): Promise<ApiError> {
  let message = defaultStatusMessage(response.status);
  let fieldErrors: Record<string, string> | undefined;

  try {
    const text = await response.text();
    if (text) {
      const parsed = JSON.parse(text) as BackendErrorBody;
      if (typeof parsed.mensagem === 'string' && parsed.mensagem.trim()) {
        message = parsed.mensagem;
      }
      if (
        parsed.erros &&
        typeof parsed.erros === 'object' &&
        !Array.isArray(parsed.erros)
      ) {
        const entries = Object.entries(
          parsed.erros as Record<string, unknown>,
        ).filter((entry): entry is [string, string] => typeof entry[1] === 'string');
        if (entries.length > 0) {
          fieldErrors = Object.fromEntries(entries);
          if (typeof parsed.mensagem !== 'string') {
            message = entries
              .map(([field, msg]) => `${field}: ${msg}`)
              .join(' | ');
          }
        }
      }
    }
  } catch {
    // Mantém a mensagem padrão para o status HTTP quando o corpo não for JSON.
  }

  return new ApiError(response.status, message, fieldErrors);
}

function buildHeaders(hasBody: boolean): HeadersInit {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (hasBody) {
    headers['Content-Type'] = 'application/json';
  }
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function requestJson<T>(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH',
  path: string,
  body?: unknown,
  signal?: AbortSignal,
): Promise<T> {
  const hasBody = body !== undefined;
  const init: RequestInit = {
    method,
    signal,
    headers: buildHeaders(hasBody),
  };
  if (hasBody) {
    init.body = JSON.stringify(body);
  }
  const response = await fetch(baseUrl + path, init);
  if (!response.ok) {
    throw await toApiError(response);
  }
  try {
    return (await response.json()) as T;
  } catch {
    throw new ApiError(502, 'O backend retornou uma resposta inválida.');
  }
}

export function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  return requestJson<T>('GET', path, undefined, signal);
}

export function postJson<TReq, TRes>(
  path: string,
  body: TReq,
  signal?: AbortSignal,
): Promise<TRes> {
  return requestJson<TRes>('POST', path, body, signal);
}

export function putJson<TReq, TRes>(
  path: string,
  body: TReq,
  signal?: AbortSignal,
): Promise<TRes> {
  return requestJson<TRes>('PUT', path, body, signal);
}

export function patchJson<TReq, TRes>(
  path: string,
  body: TReq,
  signal?: AbortSignal,
): Promise<TRes> {
  return requestJson<TRes>('PATCH', path, body, signal);
}

export async function deleteRequest(
  path: string,
  signal?: AbortSignal,
): Promise<void> {
  const response = await fetch(baseUrl + path, {
    method: 'DELETE',
    signal,
    headers: buildHeaders(false),
  });
  if (!response.ok) {
    throw await toApiError(response);
  }
}

export function errorMessage(error: unknown): string {
  return error instanceof ApiError
    ? error.message
    : 'Não foi possível conectar ao backend. Verifique se o Spring está em execução.';
}
