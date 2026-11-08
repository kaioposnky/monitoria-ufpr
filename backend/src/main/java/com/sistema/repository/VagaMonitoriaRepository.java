package com.sistema.repository;

import com.sistema.entity.VagaMonitoria;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VagaMonitoriaRepository extends JpaRepository<VagaMonitoria, Long> {
    List<VagaMonitoria> findByStatus(VagaMonitoria.StatusVaga status);
}
