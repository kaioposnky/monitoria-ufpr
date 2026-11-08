package com.sistema.repository;
import com.sistema.entity.Curso;
import org.springframework.data.jpa.repository.JpaRepository;
public interface CursoRepository extends JpaRepository<Curso, Long> { boolean existsByCodigo(String codigo); }
