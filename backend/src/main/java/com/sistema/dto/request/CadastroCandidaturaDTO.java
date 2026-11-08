package com.sistema.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record CadastroCandidaturaDTO(@NotNull Long vagaId, @NotNull Long alunoId,
        @DecimalMin("0") @DecimalMax("100") BigDecimal notaDisciplina,
        @DecimalMin("0") @DecimalMax("100") BigDecimal cr, String justificativa) {}
