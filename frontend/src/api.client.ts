import { Injectable } from '@nestjs/common';
import { getResource, type ResourceKey } from './resources.js';

export class ApiClientError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

@Injectable()
export class ApiClient {
  private readonly baseUrl = (
    process.env.BACKEND_API_URL ?? 'http://localhost:8080/api/v1'
  ).replace(/\/$/, '');

  async list(resource: ResourceKey): Promise<unknown[]> {
    const result = await this.request<unknown[]>(getResource(resource).path);
    return Array.isArray(result) ? result : [];
  }

  create(resource: ResourceKey, body: Record<string, string>): Promise<unknown> {
    return this.request(getResource(resource).path, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  update(
    resource: ResourceKey,
    id: string,
    body: Record<string, string>,
  ): Promise<unknown> {
    return this.request(`${getResource(resource).path}/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  remove(resource: ResourceKey, id: string): Promise<unknown> {
    return this.request(`${getResource(resource).path}/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    let response: Response;
    try {
      const headers = new Headers(init.headers);
      headers.set('Accept', 'application/json');
      headers.set('Content-Type', 'application/json');
      response = await fetch(`${this.baseUrl}${path}`, {
        ...init,
        headers,
      });
    } catch (error) {
      throw new ApiClientError(
        502,
        error instanceof Error ? error.message : 'Network request failed',
      );
    }

    const text = await response.text();
    let payload: unknown = undefined;
    if (text) {
      try {
        payload = JSON.parse(text) as unknown;
      } catch {
        payload = text;
      }
    }
    if (!response.ok) {
      const message =
        typeof payload === 'object' && payload !== null && 'message' in payload
          ? String(payload.message)
          : `Backend response: ${response.status}`;
      throw new ApiClientError(response.status, message);
    }
    return payload as T;
  }
}
