package com.sistema.service;

import com.sistema.config.CacheNames;
import com.sistema.dto.request.AtualizacaoHorarioAtendimentoDTO;
import com.sistema.dto.request.CadastroHorarioAtendimentoDTO;
import com.sistema.dto.response.HorarioAtendimentoResponseDTO;
import com.sistema.entity.HorarioAtendimento;
import com.sistema.entity.Materia;
import com.sistema.entity.Monitor;
import com.sistema.entity.Usuario;
import com.sistema.entity.VagaMonitoria;
import com.sistema.exception.RecursoNaoEncontradoException;
import com.sistema.exception.RegraNegocioException;
import com.sistema.integration.IntegracaoExecutor;
import com.sistema.integration.agenda.ServicoAgenda;
import com.sistema.repository.HorarioAtendimentoRepository;
import com.sistema.repository.MateriaRepository;
import com.sistema.repository.MonitorRepository;
import com.sistema.repository.UsuarioRepository;
import com.sistema.repository.VagaMonitoriaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.List;

@Service
public class HorarioAtendimentoService {

    private static final Logger log = LoggerFactory.getLogger(HorarioAtendimentoService.class);

    private final HorarioAtendimentoRepository repository;
    private final MonitorRepository monitorRepository;
    private final VagaMonitoriaRepository vagaRepository;
    private final MateriaRepository materiaRepository;
    private final UsuarioRepository usuarioRepository;
    private final ServicoAgenda servicoAgenda;

    public HorarioAtendimentoService(
            HorarioAtendimentoRepository repository,
            MonitorRepository monitorRepository,
            VagaMonitoriaRepository vagaRepository,
            MateriaRepository materiaRepository,
            UsuarioRepository usuarioRepository,
            ServicoAgenda servicoAgenda) {
        this.repository = repository;
        this.monitorRepository = monitorRepository;
        this.vagaRepository = vagaRepository;
        this.materiaRepository = materiaRepository;
        this.usuarioRepository = usuarioRepository;
        this.servicoAgenda = servicoAgenda;
    }

    @Cacheable(cacheNames = CacheNames.HORARIOS_LIST)
    @Transactional(readOnly = true)
    public List<HorarioAtendimentoResponseDTO> listar() {
        return repository.findAll().stream().map(HorarioAtendimentoResponseDTO::from).toList();
    }

    @Cacheable(cacheNames = CacheNames.HORARIOS_DETAIL, key = "#id")
    @Transactional(readOnly = true)
    public HorarioAtendimentoResponseDTO buscar(Long id) {
        return HorarioAtendimentoResponseDTO.from(get(id));
    }

    @Cacheable(cacheNames = CacheNames.HORARIOS_BY_MONITOR, key = "#id")
    @Transactional(readOnly = true)
    public List<HorarioAtendimentoResponseDTO> porMonitor(Long id) {
        return repository.findByMonitorId(id).stream().map(HorarioAtendimentoResponseDTO::from).toList();
    }

    @Caching(evict = {
        @CacheEvict(cacheNames = CacheNames.HORARIOS_LIST, allEntries = true),
        @CacheEvict(cacheNames = CacheNames.HORARIOS_BY_MONITOR, key = "#d.monitorId()")
    })
    @Transactional
    public HorarioAtendimentoResponseDTO criar(CadastroHorarioAtendimentoDTO d) {
        validar(d.horaInicio(), d.horaFim());
        Monitor monitor = monitorRepository.findById(d.monitorId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Monitor não encontrado."));
        HorarioAtendimento salvo = repository.save(new HorarioAtendimento(
                d.monitorId(), d.diaSemana(), d.horaInicio(), d.horaFim(), d.localAtendimento(), d.linkReuniao()));
        sincronizarAgenda(salvo, monitor);
        return HorarioAtendimentoResponseDTO.from(salvo);
    }

    @Caching(evict = {
        @CacheEvict(cacheNames = CacheNames.HORARIOS_LIST, allEntries = true),
        @CacheEvict(cacheNames = CacheNames.HORARIOS_DETAIL, key = "#id"),
        @CacheEvict(cacheNames = CacheNames.HORARIOS_BY_MONITOR, allEntries = true)
    })
    @Transactional
    public HorarioAtendimentoResponseDTO atualizar(Long id, AtualizacaoHorarioAtendimentoDTO d) {
        validar(d.horaInicio(), d.horaFim());
        HorarioAtendimento horario = get(id);
        horario.atualizar(d.diaSemana(), d.horaInicio(), d.horaFim(), d.localAtendimento(), d.linkReuniao());
        monitorRepository.findById(horario.getMonitorId())
                .ifPresent(monitor -> sincronizarAgenda(horario, monitor));
        return HorarioAtendimentoResponseDTO.from(horario);
    }

    @Caching(evict = {
        @CacheEvict(cacheNames = CacheNames.HORARIOS_LIST, allEntries = true),
        @CacheEvict(cacheNames = CacheNames.HORARIOS_DETAIL, key = "#id"),
        @CacheEvict(cacheNames = CacheNames.HORARIOS_BY_MONITOR, allEntries = true)
    })
    @Transactional
    public void excluir(Long id) {
        repository.delete(get(id));
        IntegracaoExecutor.executarSemInterromper(log, "remover horário " + id,
                () -> servicoAgenda.removerHorario(id));
    }

    private HorarioAtendimento get(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Horário não encontrado."));
    }

    private void validar(LocalTime inicio, LocalTime fim) {
        if (!fim.isAfter(inicio)) {
            throw new RegraNegocioException("Hora final deve ser posterior à hora inicial.");
        }
    }

    private void sincronizarAgenda(HorarioAtendimento horario, Monitor monitor) {
        IntegracaoExecutor.executarSemInterromper(log, "sincronizar horário " + horario.getId(), () -> {
            VagaMonitoria vaga = vagaRepository.findById(monitor.getVagaId()).orElse(null);
            Materia materia = vaga != null ? materiaRepository.findById(vaga.getMateriaId()).orElse(null) : null;
            Usuario aluno = usuarioRepository.findById(monitor.getAlunoId()).orElse(null);
            servicoAgenda.sincronizarHorario(
                    horario,
                    monitor.getVagaId(),
                    materia != null ? materia.getCodigo() : null,
                    materia != null ? materia.getNome() : null,
                    aluno != null ? aluno.getNome() : "Monitor #" + monitor.getId());
        });
    }
}
