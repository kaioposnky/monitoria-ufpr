package com.sistema.integration.agenda;

import com.sistema.entity.HorarioAtendimento;
import com.sistema.entity.VagaMonitoria;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

abstract class AbstractMapaAgenda implements ServicoAgenda {

    protected final Map<String, EventoAgenda> eventos = new ConcurrentHashMap<>();

    @Override
    public List<EventoAgenda> sincronizarVaga(VagaMonitoria vaga, String codigoDisciplina, String nomeDisciplina) {
        removerEventosVaga(vaga.getId());
        List<EventoAgenda> gerados = AgendaSupport.construirEventosVaga(vaga, codigoDisciplina, nomeDisciplina);
        gerados.forEach(evento -> eventos.put(evento.idExterno(), evento));
        aposAlteracao(gerados.isEmpty() ? "remocao-vaga:" + vaga.getId() : "sync-vaga:" + vaga.getId());
        return gerados;
    }

    @Override
    public void removerEventosVaga(Long vagaId) {
        eventos.remove(AgendaSupport.keyAbertura(vagaId));
        eventos.remove(AgendaSupport.keyEncerramento(vagaId));
        aposAlteracao("remocao-vaga:" + vagaId);
    }

    @Override
    public EventoAgenda sincronizarHorario(
            HorarioAtendimento horario,
            Long vagaId,
            String codigoDisciplina,
            String nomeDisciplina,
            String nomeMonitor) {
        EventoAgenda evento = AgendaSupport.construirEventoHorario(
                horario, vagaId, codigoDisciplina, nomeDisciplina, nomeMonitor);
        eventos.put(evento.idExterno(), evento);
        aposAlteracao("sync-horario:" + horario.getId());
        return evento;
    }

    @Override
    public void removerHorario(Long horarioId) {
        eventos.remove(AgendaSupport.keyHorario(horarioId));
        aposAlteracao("remocao-horario:" + horarioId);
    }

    @Override
    public List<EventoAgenda> listarEventos() {
        return AgendaSupport.ordenar(eventos.values());
    }

    @Override
    public String exportarCalendarioIcs() {
        return AgendaSupport.formatarIcs(eventos.values(), prodId());
    }

    public void limpar() {
        eventos.clear();
    }

    protected abstract String prodId();

    protected void aposAlteracao(String operacao) {
    }
}
