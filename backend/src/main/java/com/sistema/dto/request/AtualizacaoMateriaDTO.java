package com.sistema.dto.request;

import jakarta.validation.constraints.NotBlank;

public record AtualizacaoMateriaDTO(@NotBlank String codigo, @NotBlank String nome, @NotBlank String departamento) {}
