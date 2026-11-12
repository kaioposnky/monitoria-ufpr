package com.sistema.service;

import com.sistema.config.CacheNames;
import com.sistema.dto.request.AtualizacaoMonitorDTO;
import com.sistema.dto.request.CadastroMonitorDTO;
import com.sistema.dto.response.MonitorResponseDTO;
import com.sistema.entity.Candidatura;
import com.sistema.entity.Monitor;
import com.sistema.entity.Usuario;
import com.sistema.entity.VagaMonitoria;
import com.sistema.exception.RecursoNaoEncontradoException;
import com.sistema.exception.RegraNegocioException;
import com.sistema.integration.IntegracaoExecutor;
import com.sistema.integration.notificacao.NotificacaoMensagem;
import com.sistema.integration.notificacao.Notificador;
import com.sistema.repository.CandidaturaRepository;
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

import java.time.LocalDate;
import java.util.List;

@Service
public class MonitorService {

    private static final Logger log = LoggerFactory.getLogger(MonitorService.class);

    private final MonitorRepository repository;
    private final VagaMonitoriaRepository vagaRepository;
    private final CandidaturaRepository candidaturaRepository;
    private final UsuarioRepository usuarioRepository;
    private final Notificador notificador;

    public MonitorService(
            MonitorRepository repository,
            VagaMonitoriaRepository vagaRepository,
            CandidaturaRepository candidaturaRepository,
            UsuarioRepository usuarioRepository,
            Notificador notificador) {
        this.repository = repository;
        this.vagaRepository = vagaRepository;
        this.candidaturaRepository = candidaturaRepository;
        this.usuarioRepository = usuarioRepository;
        this.notificador = notificador;
    }

    @Cacheable(cacheNames = CacheNames.MONITORES_LIST)
    @Transactional(readOnly = true)
    public List<MonitorResponseDTO> listar() {
        return repository.findAll().stream().map(MonitorResponseDTO::from).toList();
    }

    @Cacheable(cacheNames = CacheNames.MONITORES_DETAIL, key = "#id")
    @Transactional(readOnly = true)
    public MonitorResponseDTO buscar(Long id) {
        return MonitorResponseDTO.from(get(id));
    }

    @Cacheable(cacheNames = CacheNames.MONITORES_BY_VAGA, key = "#id")
    @Transactional(readOnly = true)
    public List<MonitorResponseDTO> porVaga(Long id) {
        return repository.findByVagaId(id).stream().map(MonitorResponseDTO::from).toList();
    }

    @Cacheable(cacheNames = CacheNames.MONITORES_BY_ALUNO, key = "#id")
    @Transactional(readOnly = true)
    public List<MonitorResponseDTO> porAluno(Long id) {
        return repository.findByAlunoId(id).stream().map(MonitorResponseDTO::from).toList();
    }

    @Caching(evict = {
        @CacheEvict(cacheNames = CacheNames.MONITORES_LIST, allEntries = true),
        @CacheEvict(cacheNames = CacheNames.MONITORES_BY_VAGA, key = "#d.vagaId()"),
        @CacheEvict(cacheNames = CacheNames.MONITORES_BY_ALUNO, key = "#d.alunoId()")
    })
    @Transactional
    public MonitorResponseDTO criar(CadastroMonitorDTO d) {
        VagaMonitoria vaga = vagaRepository.findById(d.vagaId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Vaga de monitoria não encontrada."));
        Usuario aluno = usuarioRepository.findById(d.alunoId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Aluno não encontrado."));
        validarVigencia(d.dataInicio(), d.dataFim());

        if (d.candidaturaId() != null) {
            Candidatura candidatura = candidaturaRepository.findById(d.candidaturaId())
                    .orElseThrow(() -> new RecursoNaoEncontradoException("Candidatura não encontrada."));
            if (!candidatura.getVagaId().equals(d.vagaId()) || !candidatura.getAlunoId().equals(d.alunoId())) {
                throw new RegraNegocioException("Candidatura informada não corresponde à vaga e ao aluno.");
            }
        }
        if (repository.existsByVagaIdAndAlunoId(d.vagaId(), d.alunoId())) {
            throw new RegraNegocioException("Aluno já é monitor desta vaga.");
        }
        long ativosNaVaga = repository.countByVagaIdAndStatus(d.vagaId(), Monitor.StatusMonitor.ATIVO);
        if (ativosNaVaga >= vaga.getQuantidadeVagas()) {
            throw new RegraNegocioException("Limite de vagas para monitores ativos já foi atingido.");
        }

        Monitor salvo = repository.save(new Monitor(
                d.vagaId(), d.alunoId(), d.candidaturaId(), d.cargaHorariaSemanal(), d.dataInicio(), d.dataFim()));

        IntegracaoExecutor.executarSemInterromper(log, "notificar efetivação monitor " + salvo.getId(), () ->
                notificador.notificar(new NotificacaoMensagem(
                        aluno.getEmail(),
                        "Vínculo de monitoria ativado (#" + salvo.getId() + ")",
                        "Você foi efetivado como monitor na vaga #" + vaga.getId()
                                + " com carga horária de " + salvo.getCargaHorariaSemanal() + "h/semana.",
                        NotificacaoMensagem.TipoNotificacao.MONITOR_EFETIVADO)));

        return MonitorResponseDTO.from(salvo);
    }

    @Caching(evict = {
        @CacheEvict(cacheNames = CacheNames.MONITORES_LIST, allEntries = true),
        @CacheEvict(cacheNames = CacheNames.MONITORES_DETAIL, key = "#id"),
        @CacheEvict(cacheNames = CacheNames.MONITORES_BY_VAGA, allEntries = true),
        @CacheEvict(cacheNames = CacheNames.MONITORES_BY_ALUNO, allEntries = true)
    })
    @Transactional
    public MonitorResponseDTO atualizar(Long id, AtualizacaoMonitorDTO d) {
        validarVigencia(d.dataInicio(), d.dataFim());
        Monitor e = get(id);
        e.atualizar(d.candidaturaId(), d.cargaHorariaSemanal(), d.status(), d.dataInicio(), d.dataFim());
        return MonitorResponseDTO.from(e);
    }

    @Caching(evict = {
        @CacheEvict(cacheNames = CacheNames.MONITORES_LIST, allEntries = true),
        @CacheEvict(cacheNames = CacheNames.MONITORES_DETAIL, key = "#id"),
        @CacheEvict(cacheNames = CacheNames.MONITORES_BY_VAGA, allEntries = true),
        @CacheEvict(cacheNames = CacheNames.MONITORES_BY_ALUNO, allEntries = true),
        @CacheEvict(cacheNames = CacheNames.HORARIOS_BY_MONITOR, key = "#id")
    })
    @Transactional
    public void excluir(Long id) {
        repository.delete(get(id));
    }

    private Monitor get(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Monitor não encontrado."));
    }

    private void validarVigencia(LocalDate inicio, LocalDate fim) {
        if (fim != null && fim.isBefore(inicio)) {
            throw new RegraNegocioException("Data de término deve ser igual ou posterior à data de início.");
        }
    }
}
