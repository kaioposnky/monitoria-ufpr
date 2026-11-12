package com.sistema.integration.agenda;

import com.sistema.entity.HorarioAtendimento;

import java.time.LocalDate;
import java.time.LocalTime;

public record EventoAgenda(
        String idExterno,
        TipoEventoAgenda tipo,
        Long referenciaId,
        String titulo,
        String descricao,
        LocalDate data,
        HorarioAtendimento.DiaSemana diaSemana,
        LocalTime horaInicio,
        LocalTime horaFim,
        String localOuLink
) {
    public enum TipoEventoAgenda {
        ABERTURA_VAGA,
        ENCERRAMENTO_VAGA,
        HORARIO_MONITORIA
    }
}
