-- ==============================================================================
-- V5__separar_disciplina_materia.sql
-- Separa Disciplina (N:N com Curso e alvo de VagaMonitoria) de Materia (1:N sob Disciplina)
-- ==============================================================================

-- 1. Criar tabela de disciplinas
CREATE TABLE IF NOT EXISTS disciplinas (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    nome VARCHAR(150) NOT NULL,
    departamento VARCHAR(100) NOT NULL
);

-- Migrar registros existentes de materias (que representavam disciplinas) para disciplinas
INSERT INTO disciplinas (codigo, nome, departamento)
SELECT codigo, nome, departamento
FROM materias
ORDER BY id;

-- 2. Criar relação N:N entre cursos e disciplinas
CREATE TABLE IF NOT EXISTS cursos_disciplinas (
    curso_id BIGINT NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
    disciplina_id BIGINT NOT NULL REFERENCES disciplinas(id) ON DELETE CASCADE,
    PRIMARY KEY (curso_id, disciplina_id)
);

INSERT INTO cursos_disciplinas (curso_id, disciplina_id)
SELECT cm.curso_id, d.id
FROM cursos_materias cm
JOIN materias m ON m.id = cm.materia_id
JOIN disciplinas d ON d.codigo = m.codigo;

DROP TABLE cursos_materias;

-- 3. Migrar vagas_monitoria para referenciar disciplinas(id)
ALTER TABLE vagas_monitoria ADD COLUMN disciplina_id BIGINT;

UPDATE vagas_monitoria v
SET disciplina_id = (
    SELECT d.id
    FROM materias m
    JOIN disciplinas d ON d.codigo = m.codigo
    WHERE m.id = v.materia_id
);

ALTER TABLE vagas_monitoria ALTER COLUMN disciplina_id SET NOT NULL;
ALTER TABLE vagas_monitoria
    ADD CONSTRAINT fk_vagas_disciplina FOREIGN KEY (disciplina_id) REFERENCES disciplinas(id) ON DELETE RESTRICT;

ALTER TABLE vagas_monitoria DROP COLUMN materia_id;
DROP INDEX IF EXISTS idx_vagas_materia;
CREATE INDEX IF NOT EXISTS idx_vagas_disciplina ON vagas_monitoria(disciplina_id);

-- 4. Reestruturar materias como tópicos/conteúdos de uma disciplina (Disciplina 1:N Materia)
DELETE FROM materias;

ALTER TABLE materias DROP COLUMN codigo;
ALTER TABLE materias DROP COLUMN departamento;
ALTER TABLE materias ADD COLUMN disciplina_id BIGINT NOT NULL;
ALTER TABLE materias ADD COLUMN descricao TEXT;
ALTER TABLE materias
    ADD CONSTRAINT fk_materias_disciplina FOREIGN KEY (disciplina_id) REFERENCES disciplinas(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_materias_disciplina ON materias(disciplina_id);

-- 5. Semear matérias (tópicos) por disciplina
INSERT INTO materias (disciplina_id, nome, descricao) VALUES
((SELECT id FROM disciplinas WHERE codigo = 'CI1055'), 'Ponteiros e Alocação Dinâmica', 'Manipulação de memória, ponteiros e structs em C.'),
((SELECT id FROM disciplinas WHERE codigo = 'CI1055'), 'Listas, Pilhas e Filas', 'Implementação e análise de estruturas lineares.'),
((SELECT id FROM disciplinas WHERE codigo = 'CI1056'), 'Árvores Binárias e Balanceadas', 'Percursos, BST, AVL e tabelas hash.'),
((SELECT id FROM disciplinas WHERE codigo = 'CI1056'), 'Grafos e Caminhos Mínimos', 'Representação, busca em largura/profundidade e Dijkstra.'),
((SELECT id FROM disciplinas WHERE codigo = 'CI1001'), 'Lógica e Estruturas de Controle', 'Condicionais, laços, funções e listas em Python.'),
((SELECT id FROM disciplinas WHERE codigo = 'CM041'), 'Limites e Continuidade', 'Definição formal, propriedades e limites laterais.'),
((SELECT id FROM disciplinas WHERE codigo = 'CM041'), 'Derivadas e Integrais', 'Regras de derivação, otimização e integral definida.'),
((SELECT id FROM disciplinas WHERE codigo = 'CM005'), 'Sistemas Lineares e Matrizes', 'Escalonamento, determinantes e inversão matricial.'),
((SELECT id FROM disciplinas WHERE codigo = 'CM005'), 'Espaços Vetoriais e Transformações', 'Base, dimensão, autovalores e autovetores.');
