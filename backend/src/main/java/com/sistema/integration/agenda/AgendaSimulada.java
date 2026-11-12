package com.sistema.integration.agenda;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

/**
 * Implementação simulada em memória e log da {@link ServicoAgenda} para
 * desenvolvimento e testes sem dependência de API externa de calendário.
 */
@Service
@ConditionalOnProperty(name = "app.integracoes.agenda", havingValue = "simulada", matchIfMissing = true)
public class AgendaSimulada extends AbstractMapaAgenda {

    private static final Logger log = LoggerFactory.getLogger(AgendaSimulada.class);

    @Override
    protected String prodId() {
        return "-//UFPR Exatas//Monitoria Agenda Simulada//PT";
    }

    @Override
    protected void aposAlteracao(String operacao) {
        log.info("[AgendaSimulada] operacao={} eventosAtivos={}", operacao, eventos.size());
    }
}
