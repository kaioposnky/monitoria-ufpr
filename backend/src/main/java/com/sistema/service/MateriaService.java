package com.sistema.service;

import com.sistema.config.CacheNames;
import com.sistema.dto.request.AtualizacaoMateriaDTO;
import com.sistema.dto.request.CadastroMateriaDTO;
import com.sistema.dto.response.MateriaResponseDTO;
import com.sistema.entity.Materia;
import com.sistema.exception.RecursoNaoEncontradoException;
import com.sistema.repository.DisciplinaRepository;
import com.sistema.repository.MateriaRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MateriaService {
    private final MateriaRepository repository;
    private final DisciplinaRepository disciplinaRepository;

    public MateriaService(MateriaRepository repository, DisciplinaRepository disciplinaRepository) {
        this.repository = repository;
        this.disciplinaRepository = disciplinaRepository;
    }

    @Cacheable(cacheNames = CacheNames.MATERIAS_LIST)
    @Transactional(readOnly = true)
    public List<MateriaResponseDTO> listar() {
        return repository.findAll().stream().map(MateriaResponseDTO::from).toList();
    }

    @Cacheable(cacheNames = CacheNames.MATERIAS_DETAIL, key = "#id")
    @Transactional(readOnly = true)
    public MateriaResponseDTO buscar(Long id) {
        return MateriaResponseDTO.from(repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Matéria não encontrada.")));
    }

    @Cacheable(cacheNames = CacheNames.MATERIAS_BY_DISCIPLINA, key = "#disciplinaId")
    @Transactional(readOnly = true)
    public List<MateriaResponseDTO> porDisciplina(Long disciplinaId) {
        return repository.findByDisciplinaId(disciplinaId).stream().map(MateriaResponseDTO::from).toList();
    }

    @Caching(evict = {
        @CacheEvict(cacheNames = CacheNames.MATERIAS_LIST, allEntries = true),
        @CacheEvict(cacheNames = CacheNames.MATERIAS_BY_DISCIPLINA, key = "#d.disciplinaId()")
    })
    @Transactional
    public MateriaResponseDTO criar(CadastroMateriaDTO d) {
        if (!disciplinaRepository.existsById(d.disciplinaId())) {
            throw new RecursoNaoEncontradoException("Disciplina não encontrada.");
        }
        return MateriaResponseDTO.from(repository.save(new Materia(d.disciplinaId(), d.nome(), d.descricao())));
    }

    @Caching(evict = {
        @CacheEvict(cacheNames = CacheNames.MATERIAS_LIST, allEntries = true),
        @CacheEvict(cacheNames = CacheNames.MATERIAS_DETAIL, key = "#id"),
        @CacheEvict(cacheNames = CacheNames.MATERIAS_BY_DISCIPLINA, allEntries = true)
    })
    @Transactional
    public MateriaResponseDTO atualizar(Long id, AtualizacaoMateriaDTO d) {
        Materia e = repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Matéria não encontrada."));
        if (!disciplinaRepository.existsById(d.disciplinaId())) {
            throw new RecursoNaoEncontradoException("Disciplina não encontrada.");
        }
        e.atualizar(d.disciplinaId(), d.nome(), d.descricao());
        return MateriaResponseDTO.from(e);
    }

    @Caching(evict = {
        @CacheEvict(cacheNames = CacheNames.MATERIAS_LIST, allEntries = true),
        @CacheEvict(cacheNames = CacheNames.MATERIAS_DETAIL, key = "#id"),
        @CacheEvict(cacheNames = CacheNames.MATERIAS_BY_DISCIPLINA, allEntries = true)
    })
    @Transactional
    public void excluir(Long id) {
        if (!repository.existsById(id)) {
            throw new RecursoNaoEncontradoException("Matéria não encontrada.");
        }
        repository.deleteById(id);
    }
}
