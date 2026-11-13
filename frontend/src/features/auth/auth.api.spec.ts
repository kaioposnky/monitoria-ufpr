import { setAuthToken } from '../../shared/api/http';
import { loadCurrentUser, loginRequest } from './auth.api';

afterEach(() => {
  setAuthToken(null);
  vi.restoreAllMocks();
});

describe('auth.api', () => {
  it('realiza login e mapeia flags de monitor e papel do usuário', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          token: 'jwt-123',
          usuario: {
            id: 4,
            nome: 'Lucas Silva',
            email: 'lucas.silva@ufpr.br',
            tipoUsuario: 'ALUNO',
            matricula: 'GRR20230101',
            cursoId: 1,
            ativo: true,
            monitor: true,
          },
        }),
        { status: 200 },
      ),
    );

    const session = await loginRequest({
      email: 'lucas.silva@ufpr.br',
      password: 'monitoria123',
    });

    expect(session.token).toBe('jwt-123');
    expect(session.user.role).toBe('ALUNO');
    expect(session.user.isMonitor).toBe(true);
  });

  it('consulta /auth/me enviando Bearer token', async () => {
    setAuthToken('jwt-me');
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 1,
          nome: 'Prof. Carlos',
          email: 'carlos.eduardo@ufpr.br',
          tipoUsuario: 'PROFESSOR',
          matricula: 'SIAPE112233',
          cursoId: null,
          ativo: true,
          monitor: false,
        }),
        { status: 200 },
      ),
    );

    const me = await loadCurrentUser(new AbortController().signal);
    expect(me.role).toBe('PROFESSOR');
    expect(me.isMonitor).toBe(false);
    expect(
      (fetchSpy.mock.calls[0]?.[1]?.headers as Record<string, string>)
        ?.Authorization,
    ).toBe('Bearer jwt-me');
  });
});
