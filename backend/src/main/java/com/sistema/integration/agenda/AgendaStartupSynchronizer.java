package com.sistema.integration.agenda;

import com.sistema.entity.Materia;
import com.sistema.entity.Monitor;
import com.sistema.entity.Usuario;
import com.sistema.entity.VagaMonitoria;
import com.sistema.integration.IntegracaoExecutor;
import com.sistema.repository.HorarioAtendimentoRepository;
import com.sistema.repository.MateriaRepository;
import com.sistema.repository.MonitorRepository;
import com.sistema.repository.UsuarioRepository;
import com.sistema.repository.VagaMonitoriaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Popula a agenda externa na inicialização do perfil {@code dev} com vagas e
 * horários semeados, evitando consultas extras em perfis de teste unitário/cache.
 */
@Component
@ConditionalOnProperty(name = "app.integracoes.agenda.sync-on-startup", havingValue = "true")
public class AgendaStartupSynchronizer {

    private static final Logger log = LoggerFactory.getLogger(AgendaStartupSynchronizer.class);

    private final VagaMonitoriaRepository vagaRepository;
    private final HorarioAtendimentoRepository horarioRepository;
    private final MonitorRepository monitorRepository;
    private final MateriaRepository materiaRepository;
    private final UsuarioRepository usuarioRepository;
    private final ServicoAgenda servicoAgenda;

    public AgendaStartupSynchronizer(
            VagaMonitoriaRepository vagaRepository,
            HorarioAtendimentoRepository horarioRepository,
            MonitorRepository monitorRepository,
            MateriaRepository materiaRepository,
            UsuarioRepository usuarioRepository,
            ServicoAgenda servicoAgenda) {
        this.vagaRepository = vagaRepository;
        this.horarioRepository = horarioRepository;
        this.monitorRepository = monitorRepository;
        this.materiaRepository = materiaRepository;
        this.usuarioRepository = usuarioRepository;
        this.servicoAgenda = servicoAgenda;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void sincronizarCargaInicial() {
        IntegracaoExecutor.executarSemInterromper(log, "carga inicial da agenda", () -> {
            Map<Long, Materia> materias = materiaRepository.findAll().stream()
                    .collect(Collectors.toMap(Materia::getId, Function.identity()));
            Map<Long, VagaMonitoria> vagas = vagaRepository.findAll().stream()
                    .collect(Collectors.toMap(VagaMonitoria::getId, Function.identity()));
            Map<Long, Monitor> monitores = monitorRepository.findAll().stream()
                    .collect(Collectors.toMap(Monitor::getId, Function.identity()));
            Map<Long, Usuario> usuarios = usuarioRepository.findAll().stream()
                    .collect(Collectors.toMap(Usuario::getId, Function.identity()));

            for (VagaMonitoria vaga : vagas.values()) {
                Materia materia = materias.get(vaga.getMateriaId());
                servicoAgenda.sincronizarVaga(vaga,
                        materia != null ? materia.getCodigo() : null,
                        materia != null ? materia.getNome() : null);
            }

            for (var horario : horarioRepository.findAll()) {
                Monitor monitor = monitores.get(horario.getMonitorId());
                if (monitor == null) continue;
                VagaMonitoria vaga = vagas.get(monitor.getVagaId());
                Materia materia = vaga != null ? materias.get(vaga.getMateriaId()) : null;
                Usuario aluno = usuarios.get(monitor.getAlunoId());
                servicoAgenda.sincronizarHorario(
                        horario,
                        monitor.getVagaId(),
                        materia != null ? materia.getCodigo() : null,
                        materia != null ? materia.getNome() : null,
                        aluno != null ? aluno.getNome() : "Monitor #" + monitor.getId());
            }
        });
    }
}
