package com.sistema.repository;
import com.sistema.entity.HorarioAtendimento;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface HorarioAtendimentoRepository extends JpaRepository<HorarioAtendimento, Long> {
    List<HorarioAtendimento> findByMonitorId(Long monitorId);
}
