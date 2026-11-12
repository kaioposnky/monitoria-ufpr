package com.sistema.service;

import com.sistema.config.CacheNames;
import com.sistema.dto.request.*;
import com.sistema.dto.response.MateriaResponseDTO;
import com.sistema.entity.Materia;
import com.sistema.exception.*;
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
    public MateriaService(MateriaRepository repository) { this.repository = repository; }

    @Cacheable(cacheNames = CacheNames.MATERIAS_LIST)
    @Transactional(readOnly = true) public List<MateriaResponseDTO> listar() { return repository.findAll().stream().map(MateriaResponseDTO::from).toList(); }

    @Cacheable(cacheNames = CacheNames.MATERIAS_DETAIL, key = "#id")
    @Transactional(readOnly = true) public MateriaResponseDTO buscar(Long id) { return MateriaResponseDTO.from(repository.findById(id).orElseThrow(() -> new RecursoNaoEncontradoException("Matéria não encontrada."))); }

    @CacheEvict(cacheNames = CacheNames.MATERIAS_LIST, allEntries = true)
    @Transactional public MateriaResponseDTO criar(CadastroMateriaDTO d) { if (repository.existsByCodigo(d.codigo())) throw new RegraNegocioException("Código de matéria já cadastrado."); return MateriaResponseDTO.from(repository.save(new Materia(d.codigo(), d.nome(), d.departamento()))); }

    @Caching(evict = {
        @CacheEvict(cacheNames = CacheNames.MATERIAS_LIST, allEntries = true),
        @CacheEvict(cacheNames = CacheNames.MATERIAS_DETAIL, key = "#id")
    })
    @Transactional public MateriaResponseDTO atualizar(Long id, AtualizacaoMateriaDTO d) { Materia e = repository.findById(id).orElseThrow(() -> new RecursoNaoEncontradoException("Matéria não encontrada.")); e.atualizar(d.codigo(), d.nome(), d.departamento()); return MateriaResponseDTO.from(e); }

    @Caching(evict = {
        @CacheEvict(cacheNames = CacheNames.MATERIAS_LIST, allEntries = true),
        @CacheEvict(cacheNames = CacheNames.MATERIAS_DETAIL, key = "#id"),
        @CacheEvict(cacheNames = CacheNames.CURSO_MATERIAS_LIST, allEntries = true),
        @CacheEvict(cacheNames = CacheNames.VAGAS_LIST, allEntries = true),
        @CacheEvict(cacheNames = CacheNames.VAGAS_DETAIL, allEntries = true)
    })
    @Transactional public void excluir(Long id) { if (!repository.existsById(id)) throw new RecursoNaoEncontradoException("Matéria não encontrada."); repository.deleteById(id); }
}
