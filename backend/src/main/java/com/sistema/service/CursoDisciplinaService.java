package com.sistema.service;

import com.sistema.config.CacheNames;
import com.sistema.dto.response.CursoDisciplinaResponseDTO;
import com.sistema.entity.CursoDisciplina;
import com.sistema.exception.RecursoNaoEncontradoException;
import com.sistema.exception.RegraNegocioException;
import com.sistema.repository.CursoDisciplinaRepository;
import com.sistema.repository.CursoRepository;
import com.sistema.repository.DisciplinaRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CursoDisciplinaService {
    private final CursoDisciplinaRepository repository;
    private final CursoRepository cursos;
    private final DisciplinaRepository disciplinas;

    public CursoDisciplinaService(
            CursoDisciplinaRepository repository,
            CursoRepository cursos,
            DisciplinaRepository disciplinas) {
        this.repository = repository;
        this.cursos = cursos;
        this.disciplinas = disciplinas;
    }

    private CursoDisciplinaResponseDTO out(CursoDisciplina e) {
        return new CursoDisciplinaResponseDTO(e.getCursoId(), e.getDisciplinaId());
    }

    @Cacheable(cacheNames = CacheNames.CURSO_DISCIPLINAS_LIST)
    @Transactional(readOnly = true)
    public List<CursoDisciplinaResponseDTO> listar() {
        return repository.findAll().stream().map(this::out).toList();
    }

    @CacheEvict(cacheNames = CacheNames.CURSO_DISCIPLINAS_LIST, allEntries = true)
    @Transactional
    public CursoDisciplinaResponseDTO vincular(Long cursoId, Long disciplinaId) {
        if (!cursos.existsById(cursoId)) {
            throw new RecursoNaoEncontradoException("Curso não encontrado.");
        }
        if (!disciplinas.existsById(disciplinaId)) {
            throw new RecursoNaoEncontradoException("Disciplina não encontrada.");
        }
        CursoDisciplina e = new CursoDisciplina(cursoId, disciplinaId);
        if (repository.existsById(e.getId())) {
            throw new RegraNegocioException("Curso já vinculado à disciplina.");
        }
        return out(repository.save(e));
    }

    @CacheEvict(cacheNames = CacheNames.CURSO_DISCIPLINAS_LIST, allEntries = true)
    @Transactional
    public void desvincular(Long cursoId, Long disciplinaId) {
        CursoDisciplina e = new CursoDisciplina(cursoId, disciplinaId);
        if (!repository.existsById(e.getId())) {
            throw new RecursoNaoEncontradoException("Vínculo não encontrado.");
        }
        repository.deleteById(e.getId());
    }
}
