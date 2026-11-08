package com.sistema.service;

import com.sistema.dto.request.*;
import com.sistema.dto.response.CandidaturaResponseDTO;
import com.sistema.entity.Candidatura;
import com.sistema.exception.*;
import com.sistema.repository.CandidaturaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class CandidaturaService {
    private final CandidaturaRepository repository;
    public CandidaturaService(CandidaturaRepository repository) { this.repository = repository; }
    @Transactional(readOnly = true) public List<CandidaturaResponseDTO> listar() { return repository.findAll().stream().map(CandidaturaResponseDTO::from).toList(); }
    @Transactional(readOnly = true) public CandidaturaResponseDTO buscar(Long id) { return CandidaturaResponseDTO.from(repository.findById(id).orElseThrow(() -> new RecursoNaoEncontradoException("Candidatura não encontrada."))); }
    @Transactional(readOnly = true) public List<CandidaturaResponseDTO> porVaga(Long id) { return repository.findByVagaId(id).stream().map(CandidaturaResponseDTO::from).toList(); }
    @Transactional(readOnly = true) public List<CandidaturaResponseDTO> porAluno(Long id) { return repository.findByAlunoId(id).stream().map(CandidaturaResponseDTO::from).toList(); }
    @Transactional public CandidaturaResponseDTO criar(CadastroCandidaturaDTO d) { if (repository.existsByVagaIdAndAlunoId(d.vagaId(), d.alunoId())) throw new RegraNegocioException("Aluno já se candidatou a esta vaga."); return CandidaturaResponseDTO.from(repository.save(new Candidatura(d.vagaId(), d.alunoId(), d.notaDisciplina(), d.cr(), d.justificativa()))); }
    @Transactional public CandidaturaResponseDTO atualizar(Long id, AtualizacaoCandidaturaDTO d) { Candidatura e = get(id); e.atualizar(d.notaDisciplina(), d.cr(), d.justificativa(), d.status()); return CandidaturaResponseDTO.from(e); }
    @Transactional public CandidaturaResponseDTO status(Long id, AtualizacaoStatusCandidaturaDTO d) { Candidatura e = get(id); e.atualizar(e.getNotaDisciplina(), e.getCr(), e.getJustificativa(), d.status()); return CandidaturaResponseDTO.from(e); }
    @Transactional public void excluir(Long id) { repository.delete(get(id)); }
    private Candidatura get(Long id) { return repository.findById(id).orElseThrow(() -> new RecursoNaoEncontradoException("Candidatura não encontrada.")); }
}
