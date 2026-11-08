package com.sistema.service;

import com.sistema.dto.response.CursoMateriaResponseDTO;
import com.sistema.entity.CursoMateria;
import com.sistema.exception.RecursoNaoEncontradoException;
import com.sistema.exception.RegraNegocioException;
import com.sistema.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class CursoMateriaService {
    private final CursoMateriaRepository repository; private final CursoRepository cursos; private final MateriaRepository materias;
    public CursoMateriaService(CursoMateriaRepository repository, CursoRepository cursos, MateriaRepository materias) { this.repository = repository; this.cursos = cursos; this.materias = materias; }
    private CursoMateriaResponseDTO out(CursoMateria e) { return new CursoMateriaResponseDTO(e.getCursoId(), e.getMateriaId()); }
    @Transactional(readOnly = true) public List<CursoMateriaResponseDTO> listar() { return repository.findAll().stream().map(this::out).toList(); }
    @Transactional public CursoMateriaResponseDTO vincular(Long cursoId, Long materiaId) {
        if (!cursos.existsById(cursoId)) throw new RecursoNaoEncontradoException("Curso não encontrado.");
        if (!materias.existsById(materiaId)) throw new RecursoNaoEncontradoException("Matéria não encontrada.");
        CursoMateria e = new CursoMateria(cursoId, materiaId);
        if (repository.existsById(e.getId())) throw new RegraNegocioException("Curso já vinculado à matéria.");
        return out(repository.save(e));
    }
    @Transactional public void desvincular(Long cursoId, Long materiaId) {
        CursoMateria e = new CursoMateria(cursoId, materiaId);
        if (!repository.existsById(e.getId())) throw new RecursoNaoEncontradoException("Vínculo não encontrado.");
        repository.deleteById(e.getId());
    }
}
