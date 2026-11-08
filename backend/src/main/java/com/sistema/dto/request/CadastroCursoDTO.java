package com.sistema.dto.request;

import jakarta.validation.constraints.NotBlank;

public record CadastroCursoDTO(@NotBlank String codigo, @NotBlank String nome, String setor) {}
