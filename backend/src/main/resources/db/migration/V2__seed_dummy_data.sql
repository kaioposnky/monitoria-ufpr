-- ==============================================================================
-- V2__seed_dummy_data.sql
-- Carga de dados fictícios para desenvolvimento e testes
-- ==============================================================================

-- 1. Inserir Cursos do Setor de Exatas
INSERT INTO cursos (codigo, nome, setor) VALUES
('BCC', 'Bacharelado em Ciência da Computação', 'Setor de Ciências Exatas'),
('IBM', 'Bacharelado em Informática Biomédica', 'Setor de Ciências Exatas'),
('MAT', 'Licenciatura e Bacharelado em Matemática', 'Setor de Ciências Exatas'),
('EST', 'Bacharelado em Estatística', 'Setor de Ciências Exatas');

-- 2. Inserir Matérias
INSERT INTO materias (codigo, nome, departamento) VALUES
('CI1055', 'Algoritmos e Estruturas de Dados 1', 'DInf - Departamento de Informática'),
('CI1056', 'Algoritmos e Estruturas de Dados 2', 'DInf - Departamento de Informática'),
('CI1001', 'Programação de Computadores', 'DInf - Departamento de Informática'),
('CM041',  'Cálculo 1', 'DMat - Departamento de Matemática'),
('CM005',  'Álgebra Linear', 'DMat - Departamento de Matemática');

-- 3. Associar Cursos e Matérias
-- BCC tem CI1055, CI1056, CI1001, CM041, CM005
INSERT INTO cursos_materias (curso_id, materia_id) VALUES
((SELECT id FROM cursos WHERE codigo = 'BCC'), (SELECT id FROM materias WHERE codigo = 'CI1055')),
((SELECT id FROM cursos WHERE codigo = 'BCC'), (SELECT id FROM materias WHERE codigo = 'CI1056')),
((SELECT id FROM cursos WHERE codigo = 'BCC'), (SELECT id FROM materias WHERE codigo = 'CI1001')),
((SELECT id FROM cursos WHERE codigo = 'BCC'), (SELECT id FROM materias WHERE codigo = 'CM041')),
((SELECT id FROM cursos WHERE codigo = 'BCC'), (SELECT id FROM materias WHERE codigo = 'CM005')),
-- IBM tem CI1001, CI1055, CM041
((SELECT id FROM cursos WHERE codigo = 'IBM'), (SELECT id FROM materias WHERE codigo = 'CI1001')),
((SELECT id FROM cursos WHERE codigo = 'IBM'), (SELECT id FROM materias WHERE codigo = 'CI1055')),
((SELECT id FROM cursos WHERE codigo = 'IBM'), (SELECT id FROM materias WHERE codigo = 'CM041')),
-- MAT tem CM041, CM005, CI1001
((SELECT id FROM cursos WHERE codigo = 'MAT'), (SELECT id FROM materias WHERE codigo = 'CM041')),
((SELECT id FROM cursos WHERE codigo = 'MAT'), (SELECT id FROM materias WHERE codigo = 'CM005')),
((SELECT id FROM cursos WHERE codigo = 'MAT'), (SELECT id FROM materias WHERE codigo = 'CI1001'));

-- 4. Inserir Usuários (Professores, Alunos e Admin)
INSERT INTO usuarios (nome, email, tipo_usuario, matricula, curso_id, ativo) VALUES
-- Professores
('Prof. Carlos Eduardo', 'carlos.eduardo@ufpr.br', 'PROFESSOR', 'SIAPE112233', NULL, TRUE),
('Profa. Mariana Silveira', 'mariana.silveira@ufpr.br', 'PROFESSOR', 'SIAPE445566', NULL, TRUE),
-- Administrador
('Coordenação DInf', 'coordenacao.dinf@ufpr.br', 'ADMIN', 'SIAPE999999', NULL, TRUE),
-- Alunos
('Lucas Gabriel da Silva', 'lucas.silva@ufpr.br', 'ALUNO', 'GRR20230101', (SELECT id FROM cursos WHERE codigo = 'BCC'), TRUE),
('Beatriz Helena Costa', 'beatriz.costa@ufpr.br', 'ALUNO', 'GRR20230202', (SELECT id FROM cursos WHERE codigo = 'MAT'), TRUE),
('Gabriel Santos Lima', 'gabriel.santos@ufpr.br', 'ALUNO', 'GRR20240303', (SELECT id FROM cursos WHERE codigo = 'BCC'), TRUE),
('Ana Paula Ribeiro', 'ana.ribeiro@ufpr.br', 'ALUNO', 'GRR20240404', (SELECT id FROM cursos WHERE codigo = 'IBM'), TRUE);

-- 5. Inserir Vagas de Monitoria
INSERT INTO vagas_monitoria (materia_id, professor_id, semestre, quantidade_vagas, tipo_vaga, requisitos, descricao, status) VALUES
(
    (SELECT id FROM materias WHERE codigo = 'CI1055'),
    (SELECT id FROM usuarios WHERE email = 'carlos.eduardo@ufpr.br'),
    '2026/2',
    2,
    'REMUNERADA',
    'Aprovação prévia em CI1055 com nota igual ou superior a 80 e domínio da linguagem C.',
    'Monitoria acadêmica de Algoritmos e Estruturas de Dados 1 para apoio prático aos discentes.',
    'ABERTA'
),
(
    (SELECT id FROM materias WHERE codigo = 'CM041'),
    (SELECT id FROM usuarios WHERE email = 'mariana.silveira@ufpr.br'),
    '2026/2',
    1,
    'VOLUNTARIA',
    'Aprovação prévia em CM041 (Cálculo 1) com nota igual ou superior a 75.',
    'Plantões semanais para resolução de exercícios de limites, derivadas e integrais.',
    'ABERTA'
),
(
    (SELECT id FROM materias WHERE codigo = 'CI1001'),
    (SELECT id FROM usuarios WHERE email = 'carlos.eduardo@ufpr.br'),
    '2026/2',
    1,
    'REMUNERADA',
    'Aprovação em CI1001 com facilidade em didática básica e introdução à computação em Python.',
    'Monitoria básica de programação voltada a calouros de múltiplos cursos.',
    'EM_SELECAO'
);

-- 6. Inserir Candidaturas
INSERT INTO candidaturas (vaga_id, aluno_id, nota_disciplina, cr, justificativa, status) VALUES
-- Lucas candidata-se a CI1055 (Aprovado)
(
    (SELECT id FROM vagas_monitoria WHERE semestre = '2026/2' AND materia_id = (SELECT id FROM materias WHERE codigo = 'CI1055')),
    (SELECT id FROM usuarios WHERE email = 'lucas.silva@ufpr.br'),
    92.50,
    86.20,
    'Tenho grande interesse em ajudar calouros na transição para ponteiros e alocação dinâmica.',
    'APROVADO'
),
-- Beatriz candidata-se a CM041 (Aprovada)
(
    (SELECT id FROM vagas_monitoria WHERE semestre = '2026/2' AND materia_id = (SELECT id FROM materias WHERE codigo = 'CM041')),
    (SELECT id FROM usuarios WHERE email = 'beatriz.costa@ufpr.br'),
    89.00,
    83.75,
    'Gosto de lecionar matemática e quero desenvolver experiência pedagógica.',
    'APROVADO'
),
-- Gabriel candidata-se a CI1055 (Pendente)
(
    (SELECT id FROM vagas_monitoria WHERE semestre = '2026/2' AND materia_id = (SELECT id FROM materias WHERE codigo = 'CI1055')),
    (SELECT id FROM usuarios WHERE email = 'gabriel.santos@ufpr.br'),
    81.00,
    76.50,
    'Disponibilidade nas tardes de terça e quinta para plantão.',
    'PENDENTE'
),
-- Ana candidata-se a CI1001 (Em análise)
(
    (SELECT id FROM vagas_monitoria WHERE semestre = '2026/2' AND materia_id = (SELECT id FROM materias WHERE codigo = 'CI1001')),
    (SELECT id FROM usuarios WHERE email = 'ana.ribeiro@ufpr.br'),
    85.00,
    80.00,
    'Interesse em reforçar a base de programação para turmas de Informática Biomédica.',
    'EM_ANALISE'
);

-- 7. Inserir Monitores Efetivados
INSERT INTO monitores (vaga_id, aluno_id, candidatura_id, carga_horaria_semanal, status, data_inicio, data_fim) VALUES
-- Lucas alocado como monitor de CI1055
(
    (SELECT id FROM vagas_monitoria WHERE semestre = '2026/2' AND materia_id = (SELECT id FROM materias WHERE codigo = 'CI1055')),
    (SELECT id FROM usuarios WHERE email = 'lucas.silva@ufpr.br'),
    (SELECT id FROM candidaturas WHERE aluno_id = (SELECT id FROM usuarios WHERE email = 'lucas.silva@ufpr.br')),
    12,
    'ATIVO',
    '2026-08-01',
    '2026-12-15'
),
-- Beatriz alocada como monitora de CM041
(
    (SELECT id FROM vagas_monitoria WHERE semestre = '2026/2' AND materia_id = (SELECT id FROM materias WHERE codigo = 'CM041')),
    (SELECT id FROM usuarios WHERE email = 'beatriz.costa@ufpr.br'),
    (SELECT id FROM candidaturas WHERE aluno_id = (SELECT id FROM usuarios WHERE email = 'beatriz.costa@ufpr.br')),
    12,
    'ATIVO',
    '2026-08-01',
    '2026-12-15'
);

-- 8. Inserir Horários de Atendimento dos Monitores
INSERT INTO horarios_atendimento (monitor_id, dia_semana, hora_inicio, hora_fim, local_atendimento, link_reuniao) VALUES
-- Lucas (CI1055): Terça presencial, Quinta remoto
(
    (SELECT id FROM monitores WHERE aluno_id = (SELECT id FROM usuarios WHERE email = 'lucas.silva@ufpr.br')),
    'TERCA',
    '14:00',
    '16:00',
    'Laboratório 2 - DInf (Centro Politécnico)',
    NULL
),
(
    (SELECT id FROM monitores WHERE aluno_id = (SELECT id FROM usuarios WHERE email = 'lucas.silva@ufpr.br')),
    'QUINTA',
    '14:00',
    '16:00',
    'Atendimento Remoto (Microsoft Teams)',
    'https://teams.microsoft.com/l/meetup-join/monitoria-ci1055'
),
-- Beatriz (CM041): Segunda e Quarta presenciais
(
    (SELECT id FROM monitores WHERE aluno_id = (SELECT id FROM usuarios WHERE email = 'beatriz.costa@ufpr.br')),
    'SEGUNDA',
    '10:00',
    '12:00',
    'Sala de Monitoria de Matemática - Prédio de Exatas',
    NULL
),
(
    (SELECT id FROM monitores WHERE aluno_id = (SELECT id FROM usuarios WHERE email = 'beatriz.costa@ufpr.br')),
    'QUARTA',
    '10:00',
    '12:00',
    'Sala de Monitoria de Matemática - Prédio de Exatas',
    NULL
);

-- 9. Inserir Registros de Atividades Realizadas
INSERT INTO registros_atividades (monitor_id, data_atividade, hora_inicio, hora_fim, tipo_atividade, descricao, quantidade_alunos_atendidos, status_aprovacao, feedback_professor) VALUES
-- Atividades do Lucas (Monitor de CI1055)
(
    (SELECT id FROM monitores WHERE aluno_id = (SELECT id FROM usuarios WHERE email = 'lucas.silva@ufpr.br')),
    '2026-08-11',
    '14:00',
    '16:00',
    'ATENDIMENTO_DUVIDAS',
    'Plantão presencial de dúvidas sobre alocação dinâmica de memória com malloc/free e manipulação de ponteiros.',
    6,
    'APROVADO',
    'Ótimo registro. Continue estimulando o uso do Valgrind pelos discentes.'
),
(
    (SELECT id FROM monitores WHERE aluno_id = (SELECT id FROM usuarios WHERE email = 'lucas.silva@ufpr.br')),
    '2026-08-13',
    '14:00',
    '16:00',
    'PREPARACAO_MATERIAL',
    'Elaboração de lista comentada de exercícios sobre pilhas e filas com implementação em linguagem C.',
    0,
    'APROVADO',
    'Material didático bem elaborado e revisado.'
),
(
    (SELECT id FROM monitores WHERE aluno_id = (SELECT id FROM usuarios WHERE email = 'lucas.silva@ufpr.br')),
    '2026-08-18',
    '14:00',
    '16:00',
    'ATENDIMENTO_DUVIDAS',
    'Atendimento remoto sobre árvores binárias de busca e balanceamento simples.',
    4,
    'PENDENTE',
    NULL
),
-- Atividades da Beatriz (Monitora de CM041)
(
    (SELECT id FROM monitores WHERE aluno_id = (SELECT id FROM usuarios WHERE email = 'beatriz.costa@ufpr.br')),
    '2026-08-10',
    '10:00',
    '12:00',
    'ATENDIMENTO_DUVIDAS',
    'Resolução em lousa de limites indeterminados (0/0) e introdução à regra de L''Hôpital.',
    9,
    'APROVADO',
    'Excelente dedicação com a turma.'
),
(
    (SELECT id FROM monitores WHERE aluno_id = (SELECT id FROM usuarios WHERE email = 'beatriz.costa@ufpr.br')),
    '2026-08-12',
    '10:00',
    '12:00',
    'ATENDIMENTO_DUVIDAS',
    'Plantão para tirar dúvidas sobre interpretação geométrica da derivada e retas tangentes.',
    5,
    'PENDENTE',
    NULL
);
