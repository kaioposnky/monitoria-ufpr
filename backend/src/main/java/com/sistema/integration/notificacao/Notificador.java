package com.sistema.integration.notificacao;

/**
 * Porta de saída para envio de notificações acadêmicas.
 */
public interface Notificador {

    void notificar(NotificacaoMensagem mensagem);
}
