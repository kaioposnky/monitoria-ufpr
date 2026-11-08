package com.sistema.repository;
import com.sistema.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface CursoMateriaRepository extends JpaRepository<CursoMateria, CursoMateriaId> {
    List<CursoMateria> findByIdCursoId(Long cursoId);
    List<CursoMateria> findByIdMateriaId(Long materiaId);
}
