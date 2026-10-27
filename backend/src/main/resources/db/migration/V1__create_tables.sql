-- ==============================================================================
-- V1__create_tables.sql
-- Sistema de Monitoria Acadêmica - UFPR
-- ==============================================================================

-- 1. Cursos
CREATE TABLE IF NOT EXISTS cursos (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    nome VARCHAR(150) NOT NULL,
    setor VARCHAR(100) DEFAULT 'Setor de Ciências Exatas'
);

-- 2. Matérias (Disciplinas)
CREATE TABLE IF NOT EXISTS materias (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    nome VARCHAR(150) NOT NULL,
    departamento VARCHAR(100) NOT NULL
);

-- 3. Cursos vs Matérias (relação N:N)
CREATE TABLE IF NOT EXISTS cursos_materias (
    curso_id BIGINT NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
    materia_id BIGINT NOT NULL REFERENCES materias(id) ON DELETE CASCADE,
    PRIMARY KEY (curso_id, materia_id)
);

-- 4. Usuários (Professores, Alunos e Administradores)
CREATE TABLE IF NOT EXISTS usuarios (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    tipo_usuario VARCHAR(30) NOT NULL CHECK (tipo_usuario IN ('ALUNO', 'PROFESSOR', 'ADMIN')),
    matricula VARCHAR(50) UNIQUE, -- GRR para alunos ou Siape para professores
    curso_id BIGINT REFERENCES cursos(id) ON DELETE SET NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Vagas de Monitoria
CREATE TABLE IF NOT EXISTS vagas_monitoria (
    id BIGSERIAL PRIMARY KEY,
    materia_id BIGINT NOT NULL REFERENCES materias(id) ON DELETE RESTRICT,
    professor_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    semestre VARCHAR(10) NOT NULL, -- Ex: '2026/2'
    quantidade_vagas INT NOT NULL DEFAULT 1 CHECK (quantidade_vagas > 0),
    tipo_vaga VARCHAR(30) NOT NULL CHECK (tipo_vaga IN ('REMUNERADA', 'VOLUNTARIA')),
    requisitos TEXT,
    descricao TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'ABERTA' CHECK (status IN ('ABERTA', 'EM_SELECAO', 'ENCERRADA', 'CANCELADA')),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Candidaturas
CREATE TABLE IF NOT EXISTS candidaturas (
    id BIGSERIAL PRIMARY KEY,
    vaga_id BIGINT NOT NULL REFERENCES vagas_monitoria(id) ON DELETE CASCADE,
    aluno_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nota_disciplina NUMERIC(4,2) CHECK (nota_disciplina >= 0 AND nota_disciplina <= 100),
    cr NUMERIC(4,2) CHECK (cr >= 0 AND cr <= 100),
    justificativa TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE', 'EM_ANALISE', 'APROVADO', 'REPROVADO', 'DESISTENTE')),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_candidatura_vaga_aluno UNIQUE (vaga_id, aluno_id)
);

-- 7. Monitores (Alunos formalmente alocados como monitores)
CREATE TABLE IF NOT EXISTS monitores (
    id BIGSERIAL PRIMARY KEY,
    vaga_id BIGINT NOT NULL REFERENCES vagas_monitoria(id) ON DELETE RESTRICT,
    aluno_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    candidatura_id BIGINT REFERENCES candidaturas(id) ON DELETE SET NULL,
    carga_horaria_semanal INT NOT NULL DEFAULT 12 CHECK (carga_horaria_semanal > 0),
    status VARCHAR(20) NOT NULL DEFAULT 'ATIVO' CHECK (status IN ('ATIVO', 'INATIVO', 'DESLIGADO', 'CONCLUIDO')),
    data_inicio DATE NOT NULL,
    data_fim DATE,
    CONSTRAINT uq_monitor_vaga_aluno UNIQUE (vaga_id, aluno_id)
);

-- 8. Horários de Atendimento do Monitor
CREATE TABLE IF NOT EXISTS horarios_atendimento (
    id BIGSERIAL PRIMARY KEY,
    monitor_id BIGINT NOT NULL REFERENCES monitores(id) ON DELETE CASCADE,
    dia_semana VARCHAR(20) NOT NULL CHECK (dia_semana IN ('SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO')),
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    local_atendimento VARCHAR(150) NOT NULL,
    link_reuniao VARCHAR(255),
    CONSTRAINT chk_horario_ordem CHECK (hora_fim > hora_inicio)
);

-- 9. Registro de Atividades dos Monitores
CREATE TABLE IF NOT EXISTS registros_atividades (
    id BIGSERIAL PRIMARY KEY,
    monitor_id BIGINT NOT NULL REFERENCES monitores(id) ON DELETE CASCADE,
    data_atividade DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    tipo_atividade VARCHAR(50) NOT NULL CHECK (tipo_atividade IN ('ATENDIMENTO_DUVIDAS', 'PREPARACAO_MATERIAL', 'AUXILIO_AULA_PRATICA', 'CORRECAO_EXERCICIOS', 'OUTRO')),
    descricao TEXT NOT NULL,
    quantidade_alunos_atendidos INT DEFAULT 0 CHECK (quantidade_alunos_atendidos >= 0),
    status_aprovacao VARCHAR(20) NOT NULL DEFAULT 'PENDENTE' CHECK (status_aprovacao IN ('PENDENTE', 'APROVADO', 'REJEITADO')),
    feedback_professor TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_registro_horario CHECK (hora_fim > hora_inicio)
);

-- Índices para otimização de consultas frequentes
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_matricula ON usuarios(matricula);
CREATE INDEX IF NOT EXISTS idx_vagas_materia ON vagas_monitoria(materia_id);
CREATE INDEX IF NOT EXISTS idx_vagas_semestre ON vagas_monitoria(semestre);
CREATE INDEX IF NOT EXISTS idx_candidaturas_vaga ON candidaturas(vaga_id);
CREATE INDEX IF NOT EXISTS idx_candidaturas_aluno ON candidaturas(aluno_id);
CREATE INDEX IF NOT EXISTS idx_monitores_aluno ON monitores(aluno_id);
CREATE INDEX IF NOT EXISTS idx_horarios_monitor ON horarios_atendimento(monitor_id);
CREATE INDEX IF NOT EXISTS idx_atividades_monitor ON registros_atividades(monitor_id);
