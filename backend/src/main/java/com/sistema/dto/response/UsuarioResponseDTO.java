package com.sistema.dto.response;

import com.sistema.entity.Usuario;

import java.time.OffsetDateTime;

public record UsuarioResponseDTO(
        Long id,
        String nome,
        String email,
        Usuario.TipoUsuario tipoUsuario,
        String matricula,
        Long cursoId,
        boolean ativo,
        OffsetDateTime criadoEm
) {
    public static UsuarioResponseDTO from(Usuario usuario) {
        return new UsuarioResponseDTO(usuario.getId(), usuario.getNome(), usuario.getEmail(),
                usuario.getTipoUsuario(), usuario.getMatricula(), usuario.getCursoId(),
                usuario.isAtivo(), usuario.getCriadoEm());
    }
}
