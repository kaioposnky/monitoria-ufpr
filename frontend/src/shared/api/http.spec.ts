import {
  deleteRequest,
  getJson,
  patchJson,
  postJson,
  setAuthToken,
} from './http';
import { loadCourses } from '../../features/catalog/catalog.api';

const signal = () => new AbortController().signal;
afterEach(() => {
  setAuthToken(null);
  vi.restoreAllMocks();
});

it('preserva o status HTTP de uma consulta recusada', async () => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response('', { status: 404 }),
  );
  await expect(
    getJson('/vagas-monitoria/999', signal()),
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
  await expect(getJson('/cursos', signal())).rejects.toMatchObject({
    status: 502,
  });
});

it('mantém o cancelamento da consulta em vez de convertê-lo em erro de negócio', async () => {
  const controller = new AbortController();
  controller.abort();
  vi.spyOn(globalThis, 'fetch').mockRejectedValue(controller.signal.reason);
  await expect(getJson('/cursos', controller.signal)).rejects.toMatchObject({
    name: 'AbortError',
  });
});

it('envia header Authorization Bearer e corpo JSON em operações POST/PATCH', async () => {
  setAuthToken('jwt-token-teste');
  const fetchSpy = vi
    .spyOn(globalThis, 'fetch')
    .mockResolvedValueOnce(
      new Response(JSON.stringify({ id: 10 }), { status: 201 }),
    )
    .mockResolvedValueOnce(
      new Response(JSON.stringify({ id: 10, status: 'APROVADO' }), {
        status: 200,
      }),
    );

  const created = await postJson<{ vagaId: number }, { id: number }>(
    '/candidaturas',
    { vagaId: 1 },
  );
  expect(created.id).toBe(10);

  const patched = await patchJson<{ status: string }, { status: string }>(
    '/candidaturas/10/status',
    { status: 'APROVADO' },
  );
  expect(patched.status).toBe('APROVADO');

  const firstCallInit = fetchSpy.mock.calls[0]?.[1];
  expect(firstCallInit?.method).toBe('POST');
  expect(
    (firstCallInit?.headers as Record<string, string> | undefined)?.Authorization,
  ).toBe('Bearer jwt-token-teste');
});

it('interpreta mensagem e erros de campo do GlobalExceptionHandler e suporta DELETE', async () => {
  vi.spyOn(globalThis, 'fetch')
    .mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          status: 409,
          mensagem: 'Aluno já se candidatou a esta vaga.',
        }),
        { status: 409 },
      ),
    )
    .mockResolvedValueOnce(new Response(null, { status: 204 }));

  await expect(postJson('/candidaturas', { vagaId: 1 })).rejects.toMatchObject({
    status: 409,
    message: 'Aluno já se candidatou a esta vaga.',
  });

  await expect(deleteRequest('/candidaturas/10')).resolves.toBeUndefined();
});
