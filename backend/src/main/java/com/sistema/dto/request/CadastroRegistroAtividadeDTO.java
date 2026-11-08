package com.sistema.dto.request;

import com.sistema.entity.RegistroAtividade;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;

public record CadastroRegistroAtividadeDTO(@NotNull Long monitorId, @NotNull LocalDate dataAtividade,
        @NotNull LocalTime horaInicio, @NotNull LocalTime horaFim, @NotNull RegistroAtividade.TipoAtividade tipoAtividade,
        @NotBlank String descricao, @NotNull @Min(0) Integer quantidadeAlunosAtendidos) {}
