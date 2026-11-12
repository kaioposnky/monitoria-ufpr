package com.sistema.integration.notificacao;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * Implementação simulada em memória e log do {@link Notificador} para desenvolvimento e testes.
 */
@Service
@ConditionalOnProperty(name = "app.integracoes.notificador", havingValue = "fake", matchIfMissing = true)
public class NotificadorFake implements Notificador {

    private static final Logger log = LoggerFactory.getLogger(NotificadorFake.class);

    public record RegistroNotificacao(OffsetDateTime enviadaEm, NotificacaoMensagem mensagem) {
    }

    private final List<RegistroNotificacao> historico = new CopyOnWriteArrayList<>();

    @Override
    public void notificar(NotificacaoMensagem mensagem) {
        if (mensagem == null || mensagem.destinatarioEmail() == null || mensagem.destinatarioEmail().isBlank()) {
            throw new IllegalArgumentException("Destinatário de notificação obrigatório.");
        }
        historico.add(new RegistroNotificacao(OffsetDateTime.now(), mensagem));
        log.info("[NotificadorFake] tipo={} para={} assunto=\"{}\"",
                mensagem.tipo(), mensagem.destinatarioEmail(), mensagem.assunto());
    }

    public List<RegistroNotificacao> listarHistorico() {
        return List.copyOf(historico);
    }

    public void limparHistorico() {
        historico.clear();
    }
}
