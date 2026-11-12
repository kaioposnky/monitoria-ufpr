package com.sistema.integration;

import org.slf4j.Logger;

/**
 * Executa chamadas a dependências externas com degradação graciosa para que
 * indisponibilidades em provedores externos não revertam operações persistidas.
 */
public final class IntegracaoExecutor {

    private IntegracaoExecutor() {
    }

    public static void executarSemInterromper(Logger log, String contexto, Runnable acao) {
        try {
            acao.run();
        } catch (RuntimeException ex) {
            log.warn("Falha na integração externa ({}): {}", contexto, ex.getMessage());
        }
    }
}
