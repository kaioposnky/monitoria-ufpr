package com.sistema.repository;

import com.sistema.entity.CursoDisciplina;
import com.sistema.entity.CursoDisciplinaId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CursoDisciplinaRepository extends JpaRepository<CursoDisciplina, CursoDisciplinaId> {
}
