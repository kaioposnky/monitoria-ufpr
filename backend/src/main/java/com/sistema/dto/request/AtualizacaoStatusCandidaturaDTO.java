package com.sistema.dto.request;

import com.sistema.entity.Candidatura;
import jakarta.validation.constraints.NotNull;

public record AtualizacaoStatusCandidaturaDTO(@NotNull Candidatura.StatusCandidatura status) {}
