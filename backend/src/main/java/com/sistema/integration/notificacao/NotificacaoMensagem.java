package com.sistema.integration.notificacao;

public record NotificacaoMensagem(
        String destinatarioEmail,
        String assunto,
        String corpo,
        TipoNotificacao tipo
) {
    public enum TipoNotificacao {
        CANDIDATURA_REGISTRADA,
        CANDIDATURA_AVALIADA,
        MONITOR_EFETIVADO,
        ATIVIDADE_AVALIADA
    }
}
