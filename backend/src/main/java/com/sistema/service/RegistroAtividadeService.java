package com.sistema.service;

import com.sistema.dto.request.*;
import com.sistema.dto.response.RegistroAtividadeResponseDTO;
import com.sistema.entity.RegistroAtividade;
import com.sistema.exception.RecursoNaoEncontradoException;
import com.sistema.exception.RegraNegocioException;
import com.sistema.repository.RegistroAtividadeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class RegistroAtividadeService {
    private final RegistroAtividadeRepository repository;
    public RegistroAtividadeService(RegistroAtividadeRepository repository) { this.repository = repository; }
    @Transactional(readOnly = true) public List<RegistroAtividadeResponseDTO> listar() { return repository.findAll().stream().map(RegistroAtividadeResponseDTO::from).toList(); }
    @Transactional(readOnly = true) public RegistroAtividadeResponseDTO buscar(Long id) { return RegistroAtividadeResponseDTO.from(get(id)); }
    @Transactional(readOnly = true) public List<RegistroAtividadeResponseDTO> porMonitor(Long id) { return repository.findByMonitorId(id).stream().map(RegistroAtividadeResponseDTO::from).toList(); }
    @Transactional public RegistroAtividadeResponseDTO criar(CadastroRegistroAtividadeDTO d) { validar(d.horaInicio(), d.horaFim()); return RegistroAtividadeResponseDTO.from(repository.save(new RegistroAtividade(d.monitorId(), d.dataAtividade(), d.horaInicio(), d.horaFim(), d.tipoAtividade(), d.descricao(), d.quantidadeAlunosAtendidos()))); }
    @Transactional public RegistroAtividadeResponseDTO atualizar(Long id, AtualizacaoRegistroAtividadeDTO d) { validar(d.horaInicio(), d.horaFim()); RegistroAtividade e = get(id); e.atualizar(d.dataAtividade(), d.horaInicio(), d.horaFim(), d.tipoAtividade(), d.descricao(), d.quantidadeAlunosAtendidos()); return RegistroAtividadeResponseDTO.from(e); }
    @Transactional public RegistroAtividadeResponseDTO aprovacao(Long id, AprovacaoRegistroAtividadeDTO d) { RegistroAtividade e = get(id); e.atualizarAprovacao(d.statusAprovacao(), d.feedbackProfessor()); return RegistroAtividadeResponseDTO.from(e); }
    @Transactional public void excluir(Long id) { repository.delete(get(id)); }
    private RegistroAtividade get(Long id) { return repository.findById(id).orElseThrow(() -> new RecursoNaoEncontradoException("Registro de atividade não encontrado.")); }
    private void validar(java.time.LocalTime inicio, java.time.LocalTime fim) { if (!fim.isAfter(inicio)) throw new RegraNegocioException("Hora final deve ser posterior à hora inicial."); }
}
