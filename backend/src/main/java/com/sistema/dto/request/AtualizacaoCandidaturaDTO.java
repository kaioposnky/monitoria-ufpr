package com.sistema.dto.request;

import com.sistema.entity.Candidatura;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import java.math.BigDecimal;

public record AtualizacaoCandidaturaDTO(@DecimalMin("0") @DecimalMax("100") BigDecimal notaDisciplina,
        @DecimalMin("0") @DecimalMax("100") BigDecimal cr, String justificativa,
        Candidatura.StatusCandidatura status) {}
