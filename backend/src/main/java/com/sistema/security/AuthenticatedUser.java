package com.sistema.security;

import com.sistema.entity.Usuario;

public record AuthenticatedUser(
        Long id,
        String email,
        Usuario.TipoUsuario tipoUsuario
) {
}
