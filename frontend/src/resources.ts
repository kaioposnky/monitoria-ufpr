export type ResourceKey =
  | 'courses'
  | 'subjects'
  | 'course-subjects'
  | 'users'
  | 'monitoring-vacancies'
  | 'applications'
  | 'monitors'
  | 'office-hours'
  | 'activity-records';

export type FieldType = 'text' | 'email' | 'number' | 'date' | 'time' | 'textarea' | 'select';

export interface ResourceField {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  relation?: ResourceKey;
  help?: string;
}

export interface ResourceDefinition {
  key: ResourceKey;
  path: string;
  label: string;
  singular: string;
  description: string;
  fields: ResourceField[];
}

const relation = (key: string, label: string, resource: ResourceKey): ResourceField => ({
  key,
  label,
  type: 'select',
  relation: resource,
  required: true,
});

export const RESOURCE_DEFINITIONS: ResourceDefinition[] = [
  {
    key: 'courses',
    path: '/courses',
    label: 'Cursos',
    singular: 'Curso',
    description: 'Graduações atendidas pelo programa de monitoria.',
    fields: [
      { key: 'name', label: 'Nome', type: 'text', required: true },
      { key: 'code', label: 'Código', type: 'text', required: true },
    ],
  },
  {
    key: 'subjects',
    path: '/subjects',
    label: 'Matérias',
    singular: 'Matéria',
    description: 'Disciplinas disponíveis para atendimento.',
    fields: [
      { key: 'name', label: 'Nome', type: 'text', required: true },
      { key: 'code', label: 'Código', type: 'text', required: true },
    ],
  },
  {
    key: 'course-subjects',
    path: '/course-subjects',
    label: 'Vínculos curso-matéria',
    singular: 'Vínculo',
    description: 'Relações entre cursos e matérias.',
    fields: [relation('courseId', 'Curso', 'courses'), relation('subjectId', 'Matéria', 'subjects')],
  },
  {
    key: 'users',
    path: '/users',
    label: 'Usuários',
    singular: 'Usuário',
    description: 'Pessoas cadastradas no sistema.',
    fields: [
      { key: 'name', label: 'Nome', type: 'text', required: true },
      { key: 'email', label: 'E-mail', type: 'email', required: true },
      { key: 'role', label: 'Perfil', type: 'text', required: true, help: 'Ex.: STUDENT, TEACHER ou ADMIN.' },
    ],
  },
  {
    key: 'monitoring-vacancies',
    path: '/monitoring-vacancies',
    label: 'Vagas de monitoria',
    singular: 'Vaga de monitoria',
    description: 'Oportunidades abertas para monitores.',
    fields: [
      relation('subjectId', 'Matéria', 'subjects'),
      relation('createdById', 'Responsável', 'users'),
      { key: 'title', label: 'Título', type: 'text', required: true },
      { key: 'description', label: 'Descrição', type: 'textarea', required: true },
      { key: 'status', label: 'Status', type: 'text', required: true, help: 'Ex.: OPEN ou CLOSED.' },
    ],
  },
  {
    key: 'applications',
    path: '/applications',
    label: 'Candidaturas',
    singular: 'Candidatura',
    description: 'Solicitações de estudantes para vagas.',
    fields: [
      relation('vacancyId', 'Vaga', 'monitoring-vacancies'),
      relation('userId', 'Candidato', 'users'),
      { key: 'status', label: 'Status', type: 'text', required: true, help: 'Ex.: PENDING, APPROVED ou REJECTED.' },
      { key: 'message', label: 'Mensagem', type: 'textarea' },
    ],
  },
  {
    key: 'monitors',
    path: '/monitors',
    label: 'Monitores',
    singular: 'Monitor',
    description: 'Monitores aprovados e associados a matérias.',
    fields: [
      relation('userId', 'Usuário', 'users'),
      relation('subjectId', 'Matéria', 'subjects'),
      relation('vacancyId', 'Vaga', 'monitoring-vacancies'),
      { key: 'status', label: 'Status', type: 'text', required: true, help: 'Ex.: ACTIVE ou INACTIVE.' },
    ],
  },
  {
    key: 'office-hours',
    path: '/office-hours',
    label: 'Horários de atendimento',
    singular: 'Horário',
    description: 'Janelas em que cada monitor atende estudantes.',
    fields: [
      relation('monitorId', 'Monitor', 'monitors'),
      { key: 'dayOfWeek', label: 'Dia da semana', type: 'text', required: true, help: 'Ex.: MONDAY.' },
      { key: 'startTime', label: 'Início', type: 'time', required: true },
      { key: 'endTime', label: 'Fim', type: 'time', required: true },
      { key: 'location', label: 'Local', type: 'text' },
    ],
  },
  {
    key: 'activity-records',
    path: '/activity-records',
    label: 'Registros de atividades',
    singular: 'Registro de atividade',
    description: 'Atividades realizadas pelos monitores.',
    fields: [
      relation('monitorId', 'Monitor', 'monitors'),
      { key: 'date', label: 'Data', type: 'date', required: true },
      { key: 'hours', label: 'Horas', type: 'number', required: true },
      { key: 'description', label: 'Descrição', type: 'textarea', required: true },
    ],
  },
];

export function isResourceKey(value: string): value is ResourceKey {
  return RESOURCE_DEFINITIONS.some((resource) => resource.key === value);
}

export function getResource(key: ResourceKey): ResourceDefinition {
  return RESOURCE_DEFINITIONS.find((resource) => resource.key === key) as ResourceDefinition;
}

export function getResources(): ResourceDefinition[] {
  return RESOURCE_DEFINITIONS;
}
