package com.sistema.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record AtualizacaoUsuarioDTO(@NotBlank String nome, @NotBlank @Email String email,
                                    String matricula, Long cursoId, Boolean ativo) {}
