package com.sistema.dto.response;

import com.sistema.entity.Usuario;

public record AuthUserDTO(
        Long id,
        String nome,
        String email,
        Usuario.TipoUsuario tipoUsuario,
        String matricula,
        Long cursoId,
        boolean ativo,
        boolean monitor
) {
    public static AuthUserDTO from(Usuario usuario, boolean monitor) {
        return new AuthUserDTO(
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getTipoUsuario(),
                usuario.getMatricula(),
                usuario.getCursoId(),
                usuario.isAtivo(),
                monitor
        );
    }
}
