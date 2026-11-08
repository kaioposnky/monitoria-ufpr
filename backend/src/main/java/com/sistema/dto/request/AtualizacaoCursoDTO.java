package com.sistema.dto.request;

import jakarta.validation.constraints.NotBlank;

public record AtualizacaoCursoDTO(@NotBlank String codigo, @NotBlank String nome, String setor) {}
