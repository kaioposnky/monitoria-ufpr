package com.sistema.integration.agenda;

import com.sistema.entity.HorarioAtendimento;
import com.sistema.entity.VagaMonitoria;

import java.util.List;

/**
 * Porta de saída para sincronização de prazos de vagas e horários de monitoria
 * com uma agenda externa (simulada, feed iCalendar ou API de calendário).
 */
public interface ServicoAgenda {

    List<EventoAgenda> sincronizarVaga(VagaMonitoria vaga, String codigoDisciplina, String nomeDisciplina);

    void removerEventosVaga(Long vagaId);

    EventoAgenda sincronizarHorario(
            HorarioAtendimento horario,
            Long vagaId,
            String codigoDisciplina,
            String nomeDisciplina,
            String nomeMonitor);

    void removerHorario(Long horarioId);

    List<EventoAgenda> listarEventos();

    String exportarCalendarioIcs();
}
