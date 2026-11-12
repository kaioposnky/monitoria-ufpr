package com.sistema.service;

import com.sistema.config.CacheNames;
import com.sistema.dto.request.*;
import com.sistema.dto.response.CursoResponseDTO;
import com.sistema.entity.Curso;
import com.sistema.exception.*;
import com.sistema.repository.CursoRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class CursoService {
    private final CursoRepository repository;
    public CursoService(CursoRepository repository) { this.repository = repository; }

    @Cacheable(cacheNames = CacheNames.CURSOS_LIST)
    @Transactional(readOnly = true) public List<CursoResponseDTO> listar() { return repository.findAll().stream().map(CursoResponseDTO::from).toList(); }

    @Cacheable(cacheNames = CacheNames.CURSOS_DETAIL, key = "#id")
    @Transactional(readOnly = true) public CursoResponseDTO buscar(Long id) { return CursoResponseDTO.from(repository.findById(id).orElseThrow(() -> new RecursoNaoEncontradoException("Curso não encontrado."))); }

    @CacheEvict(cacheNames = CacheNames.CURSOS_LIST, allEntries = true)
    @Transactional public CursoResponseDTO criar(CadastroCursoDTO d) { if (repository.existsByCodigo(d.codigo())) throw new RegraNegocioException("Código de curso já cadastrado."); return CursoResponseDTO.from(repository.save(new Curso(d.codigo(), d.nome(), d.setor()))); }

    @Caching(evict = {
        @CacheEvict(cacheNames = CacheNames.CURSOS_LIST, allEntries = true),
        @CacheEvict(cacheNames = CacheNames.CURSOS_DETAIL, key = "#id")
    })
    @Transactional public CursoResponseDTO atualizar(Long id, AtualizacaoCursoDTO d) { Curso e = repository.findById(id).orElseThrow(() -> new RecursoNaoEncontradoException("Curso não encontrado.")); e.atualizar(d.codigo(), d.nome(), d.setor()); return CursoResponseDTO.from(e); }

    @Caching(evict = {
        @CacheEvict(cacheNames = CacheNames.CURSOS_LIST, allEntries = true),
        @CacheEvict(cacheNames = CacheNames.CURSOS_DETAIL, key = "#id"),
        @CacheEvict(cacheNames = CacheNames.CURSO_MATERIAS_LIST, allEntries = true)
    })
    @Transactional public void excluir(Long id) { if (!repository.existsById(id)) throw new RecursoNaoEncontradoException("Curso não encontrado."); repository.deleteById(id); }
}
