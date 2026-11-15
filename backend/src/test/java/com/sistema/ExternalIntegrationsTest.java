package com.sistema;

import com.sistema.dto.request.CadastroCandidaturaDTO;
import com.sistema.dto.request.CadastroHorarioAtendimentoDTO;
import com.sistema.dto.request.CadastroVagaMonitoriaDTO;
import com.sistema.entity.Candidatura;
import com.sistema.entity.Disciplina;
import com.sistema.entity.HorarioAtendimento;
import com.sistema.entity.Monitor;
import com.sistema.entity.Usuario;
import com.sistema.entity.VagaMonitoria;
import com.sistema.integration.agenda.AgendaIcsAdapter;
import com.sistema.integration.agenda.AgendaSimulada;
import com.sistema.integration.agenda.EventoAgenda;
import com.sistema.integration.agenda.ServicoAgenda;
import com.sistema.integration.notificacao.EmailNotificador;
import com.sistema.integration.notificacao.NotificacaoMensagem;
import com.sistema.integration.notificacao.Notificador;
import com.sistema.integration.notificacao.NotificadorFake;
import com.sistema.repository.CandidaturaRepository;
import com.sistema.repository.DisciplinaRepository;
import com.sistema.repository.HorarioAtendimentoRepository;
import com.sistema.repository.MonitorRepository;
import com.sistema.repository.UsuarioRepository;
import com.sistema.repository.VagaMonitoriaRepository;
import com.sistema.service.CandidaturaService;
import com.sistema.service.HorarioAtendimentoService;
import com.sistema.service.VagaMonitoriaService;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class ExternalIntegrationsTest {

    private final ApplicationContextRunner integrationContextRunner = new ApplicationContextRunner()
            .withUserConfiguration(
                    NotificadorFake.class,
                    EmailNotificador.class,
                    AgendaSimulada.class,
                    AgendaIcsAdapter.class);

    @Test
    void alternaImplementacoesDeNotificadorEAgendaPorPropriedade() {
        integrationContextRunner.run(ctx -> {
            assertThat(ctx).hasSingleBean(Notificador.class);
            assertThat(ctx.getBean(Notificador.class)).isInstanceOf(NotificadorFake.class);
            assertThat(ctx).hasSingleBean(ServicoAgenda.class);
            assertThat(ctx.getBean(ServicoAgenda.class)).isInstanceOf(AgendaSimulada.class);
        });

        integrationContextRunner
                .withPropertyValues(
                        "app.integracoes.notificador=email",
                        "app.integracoes.agenda=ics")
                .run(ctx -> {
                    assertThat(ctx).hasSingleBean(Notificador.class);
                    assertThat(ctx.getBean(Notificador.class)).isInstanceOf(EmailNotificador.class);
                    assertThat(ctx).hasSingleBean(ServicoAgenda.class);
                    assertThat(ctx.getBean(ServicoAgenda.class)).isInstanceOf(AgendaIcsAdapter.class);
                });
    }

    @Test
    void agendaIcsGeraFeedRfc5545ERemoveEventosDeVagaEncerrada() {
        AgendaIcsAdapter adapter = new AgendaIcsAdapter("-//UFPR//Teste//PT");
        VagaMonitoria vaga = mock(VagaMonitoria.class);
        when(vaga.getId()).thenReturn(10L);
        when(vaga.getDisciplinaId()).thenReturn(1L);
        when(vaga.getSemestre()).thenReturn("2026/2");
        when(vaga.getQuantidadeVagas()).thenReturn(2);
        when(vaga.getStatus()).thenReturn(VagaMonitoria.StatusVaga.ABERTA);
        when(vaga.getDataAbertura()).thenReturn(LocalDate.of(2026, 8, 1));
        when(vaga.getDataEncerramento()).thenReturn(LocalDate.of(2026, 8, 20));

        List<EventoAgenda> sincronizados = adapter.sincronizarVaga(vaga, "CI1055", "Algoritmos 1");
        assertThat(sincronizados).hasSize(2);
        assertThat(adapter.getUltimoFeedIcs())
                .contains("PRODID:-//UFPR//Teste//PT")
                .contains("DTSTART;VALUE=DATE:20260801")
                .contains("DTSTART;VALUE=DATE:20260820");

        // Ao encerrar a vaga, eventos de inscrição são retirados da agenda
        when(vaga.getStatus()).thenReturn(VagaMonitoria.StatusVaga.ENCERRADA);
        adapter.sincronizarVaga(vaga, "CI1055", "Algoritmos 1");
        assertThat(adapter.listarEventos()).isEmpty();
    }

    @Test
    void emailNotificadorFormataEDespachaMensagem() {
        EmailNotificador emailNotificador = new EmailNotificador("nao-responda@ufpr.br");
        emailNotificador.notificar(new NotificacaoMensagem(
                "aluno@ufpr.br",
                "Candidatura aprovada",
                "Parabéns",
                NotificacaoMensagem.TipoNotificacao.CANDIDATURA_AVALIADA));

        assertThat(emailNotificador.listarEnviosRegistrados())
                .singleElement()
                .asString()
                .contains("FROM=nao-responda@ufpr.br")
                .contains("TO=aluno@ufpr.br");
    }

    @Test
    void falhaEmDependenciaExternaNaoRevertePersistenciaDeNegocio() {
        // 1. Falha no Notificador não impede salvar candidatura
        CandidaturaRepository candRepo = mock(CandidaturaRepository.class);
        VagaMonitoriaRepository vagaRepo = mock(VagaMonitoriaRepository.class);
        UsuarioRepository userRepo = mock(UsuarioRepository.class);
        Notificador notificadorQueFalha = mock(Notificador.class);
        doThrow(new IllegalStateException("SMTP indisponível")).when(notificadorQueFalha).notificar(any());

        VagaMonitoria vagaAberta = new VagaMonitoria(1L, 1L, "2026/2", 2,
                VagaMonitoria.TipoVaga.REMUNERADA, null, null,
                LocalDate.of(2026, 8, 1), LocalDate.of(2026, 8, 30));
        Usuario aluno = new Usuario("Aluno Teste", "aluno@ufpr.br", Usuario.TipoUsuario.ALUNO, "GRR1", 1L, "hash");

        when(vagaRepo.findById(1L)).thenReturn(Optional.of(vagaAberta));
        when(userRepo.findById(2L)).thenReturn(Optional.of(aluno));
        when(candRepo.existsByVagaIdAndAlunoId(1L, 2L)).thenReturn(false);
        when(candRepo.save(any(Candidatura.class))).thenAnswer(inv -> inv.getArgument(0));

        Clock clockFixo = Clock.fixed(Instant.parse("2026-08-10T12:00:00Z"), ZoneOffset.UTC);
        CandidaturaService candidaturaService = new CandidaturaService(
                candRepo, vagaRepo, userRepo, notificadorQueFalha, clockFixo);

        var candDto = candidaturaService.criar(new CadastroCandidaturaDTO(
                1L, 2L, new BigDecimal("85.00"), new BigDecimal("80.00"), "Quero participar"));
        assertThat(candDto.status()).isEqualTo(Candidatura.StatusCandidatura.PENDENTE);

        // 2. Falha na ServicoAgenda não impede salvar vaga nem horário
        DisciplinaRepository disciplinaRepo = mock(DisciplinaRepository.class);
        ServicoAgenda agendaQueFalha = mock(ServicoAgenda.class);
        doThrow(new IllegalStateException("Google Calendar offline"))
                .when(agendaQueFalha).sincronizarVaga(any(), anyString(), anyString());
        doThrow(new IllegalStateException("Google Calendar offline"))
                .when(agendaQueFalha).sincronizarHorario(any(), any(), any(), any(), any());

        Disciplina disciplina = new Disciplina("CI1055", "Algoritmos 1", "DInf");
        when(disciplinaRepo.findById(1L)).thenReturn(Optional.of(disciplina));
        when(userRepo.existsById(1L)).thenReturn(true);
        when(vagaRepo.save(any(VagaMonitoria.class))).thenAnswer(inv -> inv.getArgument(0));

        VagaMonitoriaService vagaService = new VagaMonitoriaService(
                vagaRepo, disciplinaRepo, userRepo, agendaQueFalha);
        var vagaDto = vagaService.criar(new CadastroVagaMonitoriaDTO(
                1L, 1L, "2026/2", 2, VagaMonitoria.TipoVaga.REMUNERADA, null, null,
                LocalDate.of(2026, 8, 1), LocalDate.of(2026, 8, 30)));
        assertThat(vagaDto.semestre()).isEqualTo("2026/2");

        HorarioAtendimentoRepository horarioRepo = mock(HorarioAtendimentoRepository.class);
        MonitorRepository monitorRepo = mock(MonitorRepository.class);
        Monitor monitor = new Monitor(1L, 2L, null, 12, LocalDate.of(2026, 8, 1), null);
        when(monitorRepo.findById(3L)).thenReturn(Optional.of(monitor));
        when(horarioRepo.save(any(HorarioAtendimento.class))).thenAnswer(inv -> inv.getArgument(0));

        HorarioAtendimentoService horarioService = new HorarioAtendimentoService(
                horarioRepo, monitorRepo, vagaRepo, disciplinaRepo, userRepo, agendaQueFalha);
        var horarioDto = horarioService.criar(new CadastroHorarioAtendimentoDTO(
                3L, HorarioAtendimento.DiaSemana.TERCA, LocalTime.of(14, 0), LocalTime.of(16, 0), "Lab 2", null));
        assertThat(horarioDto.localAtendimento()).isEqualTo("Lab 2");
    }
}
