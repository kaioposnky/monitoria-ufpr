package com.sistema.dto.request;

import com.sistema.entity.Usuario;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CadastroUsuarioDTO(
        @NotBlank String nome,
        @NotBlank @Email String email,
        @NotNull Usuario.TipoUsuario tipoUsuario,
        String matricula,
        Long cursoId,
        @NotBlank @Size(min = 6, message = "A senha deve ter ao menos 6 caracteres.") String senha
) {
}
