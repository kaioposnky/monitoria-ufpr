# Modelagem do banco de dados

## 1. Diagrama entidade-relacionamento

```mermaid
erDiagram
    CURSO ||--o{ CURSO_DISCIPLINA : possui
    DISCIPLINA ||--o{ CURSO_DISCIPLINA : pertence
    DISCIPLINA ||--o{ MATERIA : "contem (1:N)"
    CURSO ||--o{ USUARIO : matricula

    USUARIO ||--o{ VAGA_MONITORIA : "cria (Professor)"
    DISCIPLINA ||--o{ VAGA_MONITORIA : "tem vagas"

    USUARIO ||--o{ CANDIDATURA : "submete (Aluno)"
    VAGA_MONITORIA ||--o{ CANDIDATURA : "recebe"

    USUARIO ||--o{ MONITOR : "atua (Aluno)"
    VAGA_MONITORIA ||--o{ MONITOR : "origina"
    CANDIDATURA ||--o| MONITOR : "promove"

    MONITOR ||--o{ HORARIO_ATENDIMENTO : "disponibiliza"
    MONITOR ||--o{ REGISTRO_ATIVIDADE : "reporta"

    CURSO {
        bigint id PK
        varchar codigo UK
        varchar nome
        varchar setor
    }

    USUARIO {
        bigint id PK
        varchar nome
        varchar email UK
        varchar tipo_usuario "ALUNO | PROFESSOR | ADMIN"
        varchar matricula UK
        bigint curso_id FK
        varchar senha_hash
        boolean ativo
        timestamp criado_em
    }

    DISCIPLINA {
        bigint id PK
        varchar codigo UK
        varchar nome
        varchar departamento
    }

    CURSO_DISCIPLINA {
        bigint curso_id PK,FK
        bigint disciplina_id PK,FK
    }

    MATERIA {
        bigint id PK
        bigint disciplina_id FK
        varchar nome
        text descricao
    }

    VAGA_MONITORIA {
        bigint id PK
        bigint disciplina_id FK
        bigint professor_id FK
        varchar semestre "ex: 2026/2"
        int quantidade_vagas
        varchar tipo_vaga "REMUNERADA | VOLUNTARIA"
        varchar status "ABERTA | EM_SELECAO | ENCERRADA | CANCELADA"
        date data_abertura
        date data_encerramento
        text requisitos
        text descricao
        timestamp criado_em
    }

    CANDIDATURA {
        bigint id PK
        bigint vaga_id FK
        bigint aluno_id FK
        numeric nota_disciplina
        numeric cr
        text justificativa
        varchar status "PENDENTE | EM_ANALISE | APROVADO | REPROVADO | DESISTENTE"
        timestamp criado_em
    }

    MONITOR {
        bigint id PK
        bigint vaga_id FK
        bigint aluno_id FK
        bigint candidatura_id FK
        int carga_horaria_semanal
        varchar status "ATIVO | INATIVO | DESLIGADO | CONCLUIDO"
        date data_inicio
        date data_fim
    }

    HORARIO_ATENDIMENTO {
        bigint id PK
        bigint monitor_id FK
        varchar dia_semana "SEGUNDA..SABADO"
        time hora_inicio
        time hora_fim
        varchar local_atendimento
        varchar link_reuniao
    }

    REGISTRO_ATIVIDADE {
        bigint id PK
        bigint monitor_id FK
        date data_atividade
        time hora_inicio
        time hora_fim
        varchar tipo_atividade "ATENDIMENTO_DUVIDAS | PREPARACAO_MATERIAL | AUXILIO_AULA_PRATICA | CORRECAO_EXERCICIOS | OUTRO"
        text descricao
        int quantidade_alunos_atendidos
        varchar status_aprovacao "PENDENTE | APROVADO | REJEITADO"
        text feedback_professor
        timestamp criado_em
    }
```

## 2. Dicionário das tabelas (V1–V5)

### cursos

| Coluna | Tipo e restrições | Observação |
| --- | --- | --- |
| id | BIGSERIAL PRIMARY KEY | |
| codigo | VARCHAR(20) NOT NULL UNIQUE | Ex.: BCC, IBM, MAT, EST |
| nome | VARCHAR(150) NOT NULL | |
| setor | VARCHAR(100) DEFAULT 'Setor de Ciências Exatas' | |

### disciplinas

Criada na V5 para separar a unidade curricular (disciplinas, N:N com cursos e alvo de vagas_monitoria) dos tópicos/conteúdos (materias, 1:N sob disciplinas).

| Coluna | Tipo e restrições | Observação |
| --- | --- | --- |
| id | BIGSERIAL PRIMARY KEY | |
| codigo | VARCHAR(20) NOT NULL UNIQUE | Ex.: CI1055, CM041 |
| nome | VARCHAR(150) NOT NULL | |
| departamento | VARCHAR(100) NOT NULL | Ex.: DInf - Departamento de Informática |

### cursos_disciplinas

Associação N:N (criada na V5 substituindo cursos_materias) com chave primária composta (curso_id, disciplina_id). Ambas são BIGINT NOT NULL referenciando cursos(id) e disciplinas(id) com ON DELETE CASCADE.

### materias

Reestruturada na V5 como tópicos/conteúdos pertencentes a uma única disciplina (Disciplina 1:N Materia).

| Coluna | Tipo e restrições | Observação |
| --- | --- | --- |
| id | BIGSERIAL PRIMARY KEY | |
| disciplina_id | BIGINT NOT NULL REFERENCES disciplinas(id) ON DELETE CASCADE | FK adicionada na V5 (fk_materias_disciplina) |
| nome | VARCHAR(150) NOT NULL | Título da matéria/conteúdo da disciplina |
| descricao | TEXT | Descrição opcional do tópico |

### usuarios

| Coluna | Tipo e restrições | Observação |
| --- | --- | --- |
| id | BIGSERIAL PRIMARY KEY | |
| nome | VARCHAR(150) NOT NULL | |
| email | VARCHAR(150) NOT NULL UNIQUE | Validado como @Email na API |
| tipo_usuario | VARCHAR(30) NOT NULL CHECK (...) | ALUNO, PROFESSOR ou ADMIN |
| matricula | VARCHAR(50) UNIQUE | GRR ou matrícula funcional (Siape) |
| curso_id | BIGINT REFERENCES cursos(id) ON DELETE SET NULL | Opcional |
| senha_hash | VARCHAR(255) NOT NULL | Adicionada na V3 (hash BCrypt) |
| ativo | BOOLEAN NOT NULL DEFAULT TRUE | |
| criado_em | TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP | |

### vagas_monitoria

| Coluna | Tipo e restrições | Observação |
| --- | --- | --- |
| id | BIGSERIAL PRIMARY KEY | |
| disciplina_id | BIGINT NOT NULL REFERENCES disciplinas(id) ON DELETE RESTRICT | Migrada de materia_id na V5 (fk_vagas_disciplina) |
| professor_id | BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT | |
| semestre | VARCHAR(10) NOT NULL | Ex.: 2026/2 |
| quantidade_vagas | INT NOT NULL DEFAULT 1 CHECK (quantidade_vagas > 0) | |
| tipo_vaga | VARCHAR(30) NOT NULL CHECK (...) | REMUNERADA, VOLUNTARIA |
| requisitos | TEXT | |
| descricao | TEXT | |
| status | VARCHAR(20) NOT NULL DEFAULT 'ABERTA' CHECK (...) | ABERTA, EM_SELECAO, ENCERRADA, CANCELADA |
| data_abertura | DATE | Adicionada na V4 |
| data_encerramento | DATE | Adicionada na V4; chk_vaga_periodo_inscricao exige data_encerramento >= data_abertura quando ambas preenchidas |
| criado_em | TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP | |

### candidaturas

| Coluna | Tipo e restrições | Observação |
| --- | --- | --- |
| id | BIGSERIAL PRIMARY KEY | |
| vaga_id | BIGINT NOT NULL REFERENCES vagas_monitoria(id) ON DELETE CASCADE | |
| aluno_id | BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE | uq_candidatura_vaga_aluno garante unicidade em (vaga_id, aluno_id) |
| nota_disciplina | NUMERIC(4,2) CHECK (0..100) | Opcional |
| cr | NUMERIC(4,2) CHECK (0..100) | Opcional |
| justificativa | TEXT | |
| status | VARCHAR(20) NOT NULL DEFAULT 'PENDENTE' CHECK (...) | PENDENTE, EM_ANALISE, APROVADO, REPROVADO, DESISTENTE |
| criado_em | TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP | |

### monitores

| Coluna | Tipo e restrições | Observação |
| --- | --- | --- |
| id | BIGSERIAL PRIMARY KEY | |
| vaga_id | BIGINT NOT NULL REFERENCES vagas_monitoria(id) ON DELETE RESTRICT | |
| aluno_id | BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT | uq_monitor_vaga_aluno garante unicidade em (vaga_id, aluno_id) |
| candidatura_id | BIGINT REFERENCES candidaturas(id) ON DELETE SET NULL | Opcional; associação 0..1 mantida pela regra de negócio (sem UNIQUE na coluna em SQL) |
| carga_horaria_semanal | INT NOT NULL DEFAULT 12 CHECK (carga_horaria_semanal > 0) | |
| status | VARCHAR(20) NOT NULL DEFAULT 'ATIVO' CHECK (...) | ATIVO, INATIVO, DESLIGADO, CONCLUIDO |
| data_inicio | DATE NOT NULL | |
| data_fim | DATE | |

### horarios_atendimento

| Coluna | Tipo e restrições | Observação |
| --- | --- | --- |
| id | BIGSERIAL PRIMARY KEY | |
| monitor_id | BIGINT NOT NULL REFERENCES monitores(id) ON DELETE CASCADE | |
| dia_semana | VARCHAR(20) NOT NULL CHECK (...) | SEGUNDA, TERCA, QUARTA, QUINTA, SEXTA, SABADO |
| hora_inicio | TIME NOT NULL | |
| hora_fim | TIME NOT NULL | chk_horario_ordem exige hora_fim > hora_inicio |
| local_atendimento | VARCHAR(150) NOT NULL | |
| link_reuniao | VARCHAR(255) | Opcional |

### registros_atividades

| Coluna | Tipo e restrições | Observação |
| --- | --- | --- |
| id | BIGSERIAL PRIMARY KEY | |
| monitor_id | BIGINT NOT NULL REFERENCES monitores(id) ON DELETE CASCADE | |
| data_atividade | DATE NOT NULL | |
| hora_inicio | TIME NOT NULL | |
| hora_fim | TIME NOT NULL | chk_registro_horario exige hora_fim > hora_inicio |
| tipo_atividade | VARCHAR(50) NOT NULL CHECK (...) | ATENDIMENTO_DUVIDAS, PREPARACAO_MATERIAL, AUXILIO_AULA_PRATICA, CORRECAO_EXERCICIOS, OUTRO |
| descricao | TEXT NOT NULL | |
| quantidade_alunos_atendidos | INT DEFAULT 0 CHECK (quantidade_alunos_atendidos >= 0) | |
| status_aprovacao | VARCHAR(20) NOT NULL DEFAULT 'PENDENTE' CHECK (...) | PENDENTE, APROVADO, REJEITADO |
| feedback_professor | TEXT | |
| criado_em | TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP | |

## 3. Índices criados (V1 e V5)

idx_usuarios_email, idx_usuarios_matricula, idx_vagas_disciplina (V5, substituindo idx_vagas_materia), idx_materias_disciplina (V5), idx_vagas_semestre, idx_candidaturas_vaga, idx_candidaturas_aluno, idx_monitores_aluno, idx_horarios_monitor e idx_atividades_monitor.
