package com.sistema.repository;
import com.sistema.entity.Candidatura;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface CandidaturaRepository extends JpaRepository<Candidatura, Long> {
    boolean existsByVagaIdAndAlunoId(Long vagaId, Long alunoId);
    List<Candidatura> findByVagaId(Long vagaId);
    List<Candidatura> findByAlunoId(Long alunoId);
}
