import { ApiClient, ApiClientError } from './api.client.js';

describe('ApiClient', () => {
  afterEach(() => vi.restoreAllMocks());

  it('exposes backend validation statuses as typed errors', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ message: 'duplicate' }), { status: 409 }),
    );
    await expect(new ApiClient().create('courses', { name: 'Cálculo' })).rejects.toEqual(
      expect.objectContaining<ApiClientError>({ status: 409 }),
    );
  });

  it('lists JSON records from the configured API', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify([{ id: '1', name: 'Cálculo I' }]), { status: 200 }),
    );
    await expect(new ApiClient().list('subjects')).resolves.toEqual([
      { id: '1', name: 'Cálculo I' },
    ]);
  });
});
