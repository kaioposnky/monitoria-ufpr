package com.sistema.repository;

import com.sistema.entity.Materia;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MateriaRepository extends JpaRepository<Materia, Long> {
    List<Materia> findByDisciplinaId(Long disciplinaId);
}
