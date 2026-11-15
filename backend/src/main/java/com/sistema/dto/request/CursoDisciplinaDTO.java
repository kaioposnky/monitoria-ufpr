package com.sistema.dto.request;

import jakarta.validation.constraints.NotNull;

public record CursoDisciplinaDTO(@NotNull Long cursoId, @NotNull Long disciplinaId) {}
