package com.sistema.repository;
import com.sistema.entity.Materia;
import org.springframework.data.jpa.repository.JpaRepository;
public interface MateriaRepository extends JpaRepository<Materia, Long> { boolean existsByCodigo(String codigo); }
