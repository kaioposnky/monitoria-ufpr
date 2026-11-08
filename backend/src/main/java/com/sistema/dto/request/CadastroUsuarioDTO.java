package com.sistema.dto.request;

import com.sistema.entity.Usuario;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CadastroUsuarioDTO(
        @NotBlank String nome,
        @NotBlank @Email String email,
        @NotNull Usuario.TipoUsuario tipoUsuario,
        String matricula,
        Long cursoId
) {
}
