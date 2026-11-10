import { getJson, postJson } from '../../shared/api/http';
import type {
  AuthSession,
  AuthUser,
  LoginPayload,
  UserRole,
} from './auth.types';

interface AuthUserDto {
  id: number;
  nome: string;
  email: string;
  tipoUsuario: UserRole;
  matricula: string | null;
  cursoId: number | null;
  ativo: boolean;
  monitor: boolean;
}

interface AuthResponseDto {
  token: string;
  usuario: AuthUserDto;
}

const mapAuthUser = (dto: AuthUserDto): AuthUser => ({
  id: dto.id,
  name: dto.nome,
  email: dto.email,
  role: dto.tipoUsuario,
  registration: dto.matricula,
  courseId: dto.cursoId,
  active: dto.ativo,
  isMonitor: dto.monitor,
});

export async function loginRequest(
  payload: LoginPayload,
  signal?: AbortSignal,
): Promise<AuthSession> {
  const response = await postJson<
    { email: string; senha: string },
    AuthResponseDto
  >('/auth/login', { email: payload.email, senha: payload.password }, signal);
  return {
    token: response.token,
    user: mapAuthUser(response.usuario),
  };
}

export async function loadCurrentUser(signal?: AbortSignal): Promise<AuthUser> {
  const dto = await getJson<AuthUserDto>('/auth/me', signal);
  return mapAuthUser(dto);
}
