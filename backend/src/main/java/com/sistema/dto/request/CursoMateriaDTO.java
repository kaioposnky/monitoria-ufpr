package com.sistema.dto.request;

import jakarta.validation.constraints.NotNull;

public record CursoMateriaDTO(@NotNull Long cursoId, @NotNull Long materiaId) {}
