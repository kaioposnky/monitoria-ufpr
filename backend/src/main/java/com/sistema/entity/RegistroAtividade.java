package com.sistema.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;

@Entity
@Table(name = "registros_atividades")
public class RegistroAtividade {
    public enum TipoAtividade { ATENDIMENTO_DUVIDAS, PREPARACAO_MATERIAL, AUXILIO_AULA_PRATICA, CORRECAO_EXERCICIOS, OUTRO }
    public enum StatusAprovacao { PENDENTE, APROVADO, REJEITADO }
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "monitor_id", nullable = false) private Long monitorId;
    @Column(name = "data_atividade", nullable = false) private LocalDate dataAtividade;
    @Column(name = "hora_inicio", nullable = false) private LocalTime horaInicio;
    @Column(name = "hora_fim", nullable = false) private LocalTime horaFim;
    @Enumerated(EnumType.STRING) @Column(name = "tipo_atividade", nullable = false, length = 50) private TipoAtividade tipoAtividade;
    @Column(nullable = false, columnDefinition = "TEXT") private String descricao;
    @Column(name = "quantidade_alunos_atendidos") private Integer quantidadeAlunosAtendidos = 0;
    @Enumerated(EnumType.STRING) @Column(name = "status_aprovacao", nullable = false, length = 20) private StatusAprovacao statusAprovacao = StatusAprovacao.PENDENTE;
    @Column(name = "feedback_professor", columnDefinition = "TEXT") private String feedbackProfessor;
    @Column(name = "criado_em", insertable = false, updatable = false) private OffsetDateTime criadoEm;
    protected RegistroAtividade() {}
    public RegistroAtividade(Long monitorId, LocalDate data, LocalTime inicio, LocalTime fim, TipoAtividade tipo, String descricao, Integer quantidade) {
        this.monitorId = monitorId; this.dataAtividade = data; this.horaInicio = inicio; this.horaFim = fim;
        this.tipoAtividade = tipo; this.descricao = descricao; this.quantidadeAlunosAtendidos = quantidade;
    }
    public Long getId() { return id; } public Long getMonitorId() { return monitorId; }
    public LocalDate getDataAtividade() { return dataAtividade; } public LocalTime getHoraInicio() { return horaInicio; }
    public LocalTime getHoraFim() { return horaFim; } public TipoAtividade getTipoAtividade() { return tipoAtividade; }
    public String getDescricao() { return descricao; } public Integer getQuantidadeAlunosAtendidos() { return quantidadeAlunosAtendidos; }
    public StatusAprovacao getStatusAprovacao() { return statusAprovacao; } public String getFeedbackProfessor() { return feedbackProfessor; }
    public OffsetDateTime getCriadoEm() { return criadoEm; }
    public void atualizar(LocalDate data, LocalTime inicio, LocalTime fim, TipoAtividade tipo, String descricao, Integer quantidade) {
        this.dataAtividade = data; this.horaInicio = inicio; this.horaFim = fim; this.tipoAtividade = tipo;
        this.descricao = descricao; this.quantidadeAlunosAtendidos = quantidade;
    }
    public void atualizarAprovacao(StatusAprovacao status, String feedback) { this.statusAprovacao = status; this.feedbackProfessor = feedback; }
}
