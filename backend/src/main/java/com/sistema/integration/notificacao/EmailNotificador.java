package com.sistema.integration.notificacao;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * Adaptador de e-mail para {@link Notificador}. Valida destinatário e prepara
 * o despacho externo sem acoplar o domínio ao provedor SMTP.
 */
@Service
@ConditionalOnProperty(name = "app.integracoes.notificador", havingValue = "email")
public class EmailNotificador implements Notificador {

    private static final Logger log = LoggerFactory.getLogger(EmailNotificador.class);

    private final String remetente;
    private final List<String> enviosRegistrados = new CopyOnWriteArrayList<>();

    public EmailNotificador(
            @Value("${app.integracoes.email.remetente:monitoria-exatas@ufpr.br}") String remetente) {
        this.remetente = remetente;
    }

    @Override
    public void notificar(NotificacaoMensagem mensagem) {
        if (mensagem == null || mensagem.destinatarioEmail() == null || !mensagem.destinatarioEmail().contains("@")) {
            throw new IllegalArgumentException("E-mail de destinatário inválido para envio.");
        }
        String payload = String.format("FROM=%s; TO=%s; SUBJECT=%s",
                remetente, mensagem.destinatarioEmail(), mensagem.assunto());
        enviosRegistrados.add(payload);
        log.info("[EmailNotificador] {}", payload);
    }

    public List<String> listarEnviosRegistrados() {
        return List.copyOf(enviosRegistrados);
    }
}
