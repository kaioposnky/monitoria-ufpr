package com.sistema.service;

import com.sistema.config.CacheNames;
import com.sistema.dto.request.AtualizacaoDisciplinaDTO;
import com.sistema.dto.request.CadastroDisciplinaDTO;
import com.sistema.dto.response.DisciplinaResponseDTO;
import com.sistema.entity.Disciplina;
import com.sistema.exception.RecursoNaoEncontradoException;
import com.sistema.exception.RegraNegocioException;
import com.sistema.repository.DisciplinaRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DisciplinaService {
    private final DisciplinaRepository repository;

    public DisciplinaService(DisciplinaRepository repository) {
        this.repository = repository;
    }

    @Cacheable(cacheNames = CacheNames.DISCIPLINAS_LIST)
    @Transactional(readOnly = true)
    public List<DisciplinaResponseDTO> listar() {
        return repository.findAll().stream().map(DisciplinaResponseDTO::from).toList();
    }

    @Cacheable(cacheNames = CacheNames.DISCIPLINAS_DETAIL, key = "#id")
    @Transactional(readOnly = true)
    public DisciplinaResponseDTO buscar(Long id) {
        return DisciplinaResponseDTO.from(repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Disciplina não encontrada.")));
    }

    @CacheEvict(cacheNames = CacheNames.DISCIPLINAS_LIST, allEntries = true)
    @Transactional
    public DisciplinaResponseDTO criar(CadastroDisciplinaDTO d) {
        if (repository.existsByCodigo(d.codigo())) {
            throw new RegraNegocioException("Código de disciplina já cadastrado.");
        }
        return DisciplinaResponseDTO.from(repository.save(new Disciplina(d.codigo(), d.nome(), d.departamento())));
    }

    @Caching(evict = {
        @CacheEvict(cacheNames = CacheNames.DISCIPLINAS_LIST, allEntries = true),
        @CacheEvict(cacheNames = CacheNames.DISCIPLINAS_DETAIL, key = "#id")
    })
    @Transactional
    public DisciplinaResponseDTO atualizar(Long id, AtualizacaoDisciplinaDTO d) {
        Disciplina e = repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Disciplina não encontrada."));
        e.atualizar(d.codigo(), d.nome(), d.departamento());
        return DisciplinaResponseDTO.from(e);
    }

    @Caching(evict = {
        @CacheEvict(cacheNames = CacheNames.DISCIPLINAS_LIST, allEntries = true),
        @CacheEvict(cacheNames = CacheNames.DISCIPLINAS_DETAIL, key = "#id"),
        @CacheEvict(cacheNames = CacheNames.CURSO_DISCIPLINAS_LIST, allEntries = true),
        @CacheEvict(cacheNames = CacheNames.MATERIAS_LIST, allEntries = true),
        @CacheEvict(cacheNames = CacheNames.MATERIAS_DETAIL, allEntries = true),
        @CacheEvict(cacheNames = CacheNames.MATERIAS_BY_DISCIPLINA, key = "#id"),
        @CacheEvict(cacheNames = CacheNames.VAGAS_LIST, allEntries = true),
        @CacheEvict(cacheNames = CacheNames.VAGAS_DETAIL, allEntries = true)
    })
    @Transactional
    public void excluir(Long id) {
        if (!repository.existsById(id)) {
            throw new RecursoNaoEncontradoException("Disciplina não encontrada.");
        }
        repository.deleteById(id);
    }
}
