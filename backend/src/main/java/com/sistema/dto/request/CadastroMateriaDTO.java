package com.sistema.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CadastroMateriaDTO(@NotNull Long disciplinaId, @NotBlank String nome, String descricao) {}
