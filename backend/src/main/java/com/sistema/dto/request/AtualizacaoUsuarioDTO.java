package com.sistema.dto.request;

import com.sistema.entity.Usuario;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AtualizacaoUsuarioDTO(
        @NotBlank String nome,
        @NotBlank @Email String email,
        Usuario.TipoUsuario tipoUsuario,
        String matricula,
        Long cursoId,
        Boolean ativo,
        @Size(min = 6, message = "A senha deve ter ao menos 6 caracteres.") String senha
) {}
