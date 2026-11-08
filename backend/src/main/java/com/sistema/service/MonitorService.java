package com.sistema.service;

import com.sistema.dto.request.*;
import com.sistema.dto.response.MonitorResponseDTO;
import com.sistema.entity.Monitor;
import com.sistema.exception.RecursoNaoEncontradoException;
import com.sistema.exception.RegraNegocioException;
import com.sistema.repository.MonitorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class MonitorService {
    private final MonitorRepository repository;
    public MonitorService(MonitorRepository repository) { this.repository = repository; }
    @Transactional(readOnly = true) public List<MonitorResponseDTO> listar() { return repository.findAll().stream().map(MonitorResponseDTO::from).toList(); }
    @Transactional(readOnly = true) public MonitorResponseDTO buscar(Long id) { return MonitorResponseDTO.from(get(id)); }
    @Transactional(readOnly = true) public List<MonitorResponseDTO> porVaga(Long id) { return repository.findByVagaId(id).stream().map(MonitorResponseDTO::from).toList(); }
    @Transactional(readOnly = true) public List<MonitorResponseDTO> porAluno(Long id) { return repository.findByAlunoId(id).stream().map(MonitorResponseDTO::from).toList(); }
    @Transactional public MonitorResponseDTO criar(CadastroMonitorDTO d) { if (repository.existsByVagaIdAndAlunoId(d.vagaId(), d.alunoId())) throw new RegraNegocioException("Aluno já é monitor desta vaga."); return MonitorResponseDTO.from(repository.save(new Monitor(d.vagaId(), d.alunoId(), d.candidaturaId(), d.cargaHorariaSemanal(), d.dataInicio(), d.dataFim()))); }
    @Transactional public MonitorResponseDTO atualizar(Long id, AtualizacaoMonitorDTO d) { Monitor e = get(id); e.atualizar(d.candidaturaId(), d.cargaHorariaSemanal(), d.status(), d.dataInicio(), d.dataFim()); return MonitorResponseDTO.from(e); }
    @Transactional public void excluir(Long id) { repository.delete(get(id)); }
    private Monitor get(Long id) { return repository.findById(id).orElseThrow(() -> new RecursoNaoEncontradoException("Monitor não encontrado.")); }
}
