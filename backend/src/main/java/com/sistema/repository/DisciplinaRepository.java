package com.sistema.repository;

import com.sistema.entity.Disciplina;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DisciplinaRepository extends JpaRepository<Disciplina, Long> {
    boolean existsByCodigo(String codigo);
}
