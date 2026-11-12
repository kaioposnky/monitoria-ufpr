package com.sistema.repository;
import com.sistema.entity.Monitor;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface MonitorRepository extends JpaRepository<Monitor, Long> {
    List<Monitor> findByVagaId(Long vagaId);
    List<Monitor> findByAlunoId(Long alunoId);
    boolean existsByVagaIdAndAlunoId(Long vagaId, Long alunoId);
    boolean existsByAlunoIdAndStatus(Long alunoId, Monitor.StatusMonitor status);
    long countByVagaIdAndStatus(Long vagaId, Monitor.StatusMonitor status);
}
