package com.sistema.dto.request;

import com.sistema.entity.RegistroAtividade;
import jakarta.validation.constraints.NotNull;

public record AprovacaoRegistroAtividadeDTO(@NotNull RegistroAtividade.StatusAprovacao statusAprovacao, String feedbackProfessor) {}
