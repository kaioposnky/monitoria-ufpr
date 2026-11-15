package com.sistema.service;

import com.sistema.config.CacheNames;
import com.sistema.dto.request.AtualizacaoParcialVagaMonitoriaDTO;
import com.sistema.dto.request.AtualizacaoVagaMonitoriaDTO;
import com.sistema.dto.request.CadastroVagaMonitoriaDTO;
import com.sistema.dto.response.VagaMonitoriaResponseDTO;
import com.sistema.entity.Disciplina;
import com.sistema.entity.VagaMonitoria;
import com.sistema.exception.RecursoNaoEncontradoException;
import com.sistema.exception.RegraNegocioException;
import com.sistema.integration.IntegracaoExecutor;
import com.sistema.integration.agenda.ServicoAgenda;
import com.sistema.repository.DisciplinaRepository;
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
public class VagaMonitoriaService {

    private static final Logger log = LoggerFactory.getLogger(VagaMonitoriaService.class);

    private final VagaMonitoriaRepository repository;
    private final DisciplinaRepository disciplinaRepository;
    private final UsuarioRepository usuarioRepository;
    private final ServicoAgenda servicoAgenda;

    public VagaMonitoriaService(
            VagaMonitoriaRepository repository,
            DisciplinaRepository disciplinaRepository,
            UsuarioRepository usuarioRepository,
            ServicoAgenda servicoAgenda) {
        this.repository = repository;
        this.disciplinaRepository = disciplinaRepository;
        this.usuarioRepository = usuarioRepository;
        this.servicoAgenda = servicoAgenda;
    }

    @Cacheable(cacheNames = CacheNames.VAGAS_LIST)
    @Transactional(readOnly = true)
    public List<VagaMonitoriaResponseDTO> listar() {
        return repository.findAll().stream().map(VagaMonitoriaResponseDTO::from).toList();
    }

    @Cacheable(cacheNames = CacheNames.VAGAS_DETAIL, key = "#id")
    @Transactional(readOnly = true)
    public VagaMonitoriaResponseDTO buscar(Long id) {
        return VagaMonitoriaResponseDTO.from(buscarEntidade(id));
    }

    @CacheEvict(cacheNames = CacheNames.VAGAS_LIST, allEntries = true)
    @Transactional
    public VagaMonitoriaResponseDTO criar(CadastroVagaMonitoriaDTO dto) {
        Disciplina disciplina = disciplinaRepository.findById(dto.disciplinaId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Disciplina não encontrada."));
        if (!usuarioRepository.existsById(dto.professorId())) {
            throw new RecursoNaoEncontradoException("Professor não encontrado.");
        }
        validarPeriodo(dto.dataAbertura(), dto.dataEncerramento());

        VagaMonitoria salva = repository.save(new VagaMonitoria(
                dto.disciplinaId(),
                dto.professorId(),
                dto.semestre(),
                dto.quantidadeVagas(),
                dto.tipoVaga(),
                dto.requisitos(),
                dto.descricao(),
                dto.dataAbertura(),
                dto.dataEncerramento()));
        sincronizarAgenda(salva, disciplina);
        return VagaMonitoriaResponseDTO.from(salva);
    }

    @Caching(evict = {
        @CacheEvict(cacheNames = CacheNames.VAGAS_LIST, allEntries = true),
        @CacheEvict(cacheNames = CacheNames.VAGAS_DETAIL, key = "#id")
    })
    @Transactional
    public VagaMonitoriaResponseDTO atualizar(Long id, AtualizacaoVagaMonitoriaDTO dto) {
        VagaMonitoria vaga = buscarEntidade(id);
        validarPeriodo(dto.dataAbertura(), dto.dataEncerramento());
        vaga.atualizar(
                dto.semestre(),
                dto.quantidadeVagas(),
                dto.tipoVaga(),
                dto.requisitos(),
                dto.descricao(),
                dto.status(),
                dto.dataAbertura(),
                dto.dataEncerramento());
        sincronizarAgenda(vaga, disciplinaRepository.findById(vaga.getDisciplinaId()).orElse(null));
        return VagaMonitoriaResponseDTO.from(vaga);
    }

    @Caching(evict = {
        @CacheEvict(cacheNames = CacheNames.VAGAS_LIST, allEntries = true),
        @CacheEvict(cacheNames = CacheNames.VAGAS_DETAIL, key = "#id")
    })
    @Transactional
    public VagaMonitoriaResponseDTO atualizarParcial(Long id, AtualizacaoParcialVagaMonitoriaDTO dto) {
        VagaMonitoria vaga = buscarEntidade(id);
        LocalDate abertura = dto.dataAbertura() == null ? vaga.getDataAbertura() : dto.dataAbertura();
        LocalDate encerramento = dto.dataEncerramento() == null ? vaga.getDataEncerramento() : dto.dataEncerramento();
        validarPeriodo(abertura, encerramento);

        vaga.atualizar(
                dto.semestre() == null ? vaga.getSemestre() : dto.semestre(),
                dto.quantidadeVagas() == null ? vaga.getQuantidadeVagas() : dto.quantidadeVagas(),
                dto.tipoVaga() == null ? vaga.getTipoVaga() : dto.tipoVaga(),
                dto.requisitos() == null ? vaga.getRequisitos() : dto.requisitos(),
                dto.descricao() == null ? vaga.getDescricao() : dto.descricao(),
                dto.status() == null ? vaga.getStatus() : dto.status(),
                abertura,
                encerramento);
        sincronizarAgenda(vaga, disciplinaRepository.findById(vaga.getDisciplinaId()).orElse(null));
        return VagaMonitoriaResponseDTO.from(vaga);
    }

    @Caching(evict = {
        @CacheEvict(cacheNames = CacheNames.VAGAS_LIST, allEntries = true),
        @CacheEvict(cacheNames = CacheNames.VAGAS_DETAIL, key = "#id"),
        @CacheEvict(cacheNames = CacheNames.MONITORES_BY_VAGA, key = "#id")
    })
    @Transactional
    public void excluir(Long id) {
        if (!repository.existsById(id)) {
            throw new RecursoNaoEncontradoException("Vaga de monitoria não encontrada.");
        }
        repository.deleteById(id);
        IntegracaoExecutor.executarSemInterromper(log, "remover eventos da vaga " + id,
                () -> servicoAgenda.removerEventosVaga(id));
    }

    private VagaMonitoria buscarEntidade(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Vaga de monitoria não encontrada."));
    }

    private void validarPeriodo(LocalDate abertura, LocalDate encerramento) {
        if (abertura != null && encerramento != null && encerramento.isBefore(abertura)) {
            throw new RegraNegocioException("Data de encerramento deve ser igual ou posterior à data de abertura.");
        }
    }

    private void sincronizarAgenda(VagaMonitoria vaga, Disciplina disciplina) {
        String codigo = disciplina != null ? disciplina.getCodigo() : null;
        String nome = disciplina != null ? disciplina.getNome() : null;
        IntegracaoExecutor.executarSemInterromper(log, "sincronizar vaga " + vaga.getId(),
                () -> servicoAgenda.sincronizarVaga(vaga, codigo, nome));
    }
}
