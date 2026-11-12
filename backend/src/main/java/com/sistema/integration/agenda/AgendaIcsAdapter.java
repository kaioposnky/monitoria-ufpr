package com.sistema.integration.agenda;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

/**
 * Adaptador de calendário iCalendar (RFC 5545) para {@link ServicoAgenda}.
 * Atualiza o feed {@code .ics} a cada alteração de vaga ou horário.
 */
@Service
@ConditionalOnProperty(name = "app.integracoes.agenda", havingValue = "ics")
public class AgendaIcsAdapter extends AbstractMapaAgenda {

    private static final Logger log = LoggerFactory.getLogger(AgendaIcsAdapter.class);

    private final String prodId;
    private volatile String ultimoFeedIcs = "";

    public AgendaIcsAdapter(
            @Value("${app.integracoes.agenda.ics-prod-id:-//UFPR Exatas//Monitoria Calendario ICS//PT}") String prodId) {
        this.prodId = prodId;
        this.ultimoFeedIcs = exportarCalendarioIcs();
    }

    @Override
    protected String prodId() {
        return prodId;
    }

    @Override
    protected void aposAlteracao(String operacao) {
        this.ultimoFeedIcs = exportarCalendarioIcs();
        log.info("[AgendaIcsAdapter] operacao={} bytesIcs={}", operacao, ultimoFeedIcs.length());
    }

    public String getUltimoFeedIcs() {
        return ultimoFeedIcs;
    }
}
