package com.sistema.repository;
import com.sistema.entity.RegistroAtividade;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface RegistroAtividadeRepository extends JpaRepository<RegistroAtividade, Long> {
    List<RegistroAtividade> findByMonitorId(Long monitorId);
}
