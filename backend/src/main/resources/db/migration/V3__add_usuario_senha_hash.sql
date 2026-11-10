-- ==============================================================================
-- V3__add_usuario_senha_hash.sql
-- Adiciona coluna de hash de senha para autenticação JWT (senha padrão dev: monitoria123)
-- ==============================================================================

ALTER TABLE usuarios
    ADD COLUMN senha_hash VARCHAR(255) NOT NULL DEFAULT '$2a$10$47f37N29/Gy/9Fya07V75.0VLhyLlk/3qEcCRDATzalPpgk8O9Inu';
