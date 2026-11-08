package com.sistema.dto.request;

import com.sistema.entity.HorarioAtendimento;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalTime;

public record CadastroHorarioAtendimentoDTO(@NotNull Long monitorId, @NotNull HorarioAtendimento.DiaSemana diaSemana,
        @NotNull LocalTime horaInicio, @NotNull LocalTime horaFim, @NotBlank String localAtendimento, String linkReuniao) {}
