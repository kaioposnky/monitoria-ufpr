import { getJson } from './http';
import { loadCourses } from '../../features/catalog/catalog.api';

const signal = () => new AbortController().signal;
afterEach(() => vi.restoreAllMocks());

it('preserva o status HTTP de uma consulta recusada', async () => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response('', { status: 404 }),
  );
  await expect(
    getJson('/monitoring-vacancies/999', signal()),
  ).rejects.toMatchObject({ status: 404 });
});

it('não transforma uma resposta de objeto em catálogo vazio', async () => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response(JSON.stringify({ error: 'invalid contract' }), {
      status: 200,
    }),
  );
  await expect(loadCourses(signal())).rejects.toMatchObject({ status: 502 });
});

it('rejeita conteúdo que não é JSON em uma resposta bem-sucedida', async () => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response('<html>proxy error</html>', { status: 200 }),
  );
  await expect(getJson('/courses', signal())).rejects.toMatchObject({
    status: 502,
  });
});

it('mantém o cancelamento da consulta em vez de convertê-lo em erro de negócio', async () => {
  const controller = new AbortController();
  controller.abort();
  vi.spyOn(globalThis, 'fetch').mockRejectedValue(controller.signal.reason);
  await expect(getJson('/courses', controller.signal)).rejects.toMatchObject({
    name: 'AbortError',
  });
});
