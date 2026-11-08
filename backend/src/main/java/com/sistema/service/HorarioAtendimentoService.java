package com.sistema.service;

import com.sistema.dto.request.*;
import com.sistema.dto.response.HorarioAtendimentoResponseDTO;
import com.sistema.entity.HorarioAtendimento;
import com.sistema.exception.RecursoNaoEncontradoException;
import com.sistema.exception.RegraNegocioException;
import com.sistema.repository.HorarioAtendimentoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class HorarioAtendimentoService {
    private final HorarioAtendimentoRepository repository;
    public HorarioAtendimentoService(HorarioAtendimentoRepository repository) { this.repository = repository; }
    @Transactional(readOnly = true) public List<HorarioAtendimentoResponseDTO> listar() { return repository.findAll().stream().map(HorarioAtendimentoResponseDTO::from).toList(); }
    @Transactional(readOnly = true) public HorarioAtendimentoResponseDTO buscar(Long id) { return HorarioAtendimentoResponseDTO.from(get(id)); }
    @Transactional(readOnly = true) public List<HorarioAtendimentoResponseDTO> porMonitor(Long id) { return repository.findByMonitorId(id).stream().map(HorarioAtendimentoResponseDTO::from).toList(); }
    @Transactional public HorarioAtendimentoResponseDTO criar(CadastroHorarioAtendimentoDTO d) { validar(d.horaInicio(), d.horaFim()); return HorarioAtendimentoResponseDTO.from(repository.save(new HorarioAtendimento(d.monitorId(), d.diaSemana(), d.horaInicio(), d.horaFim(), d.localAtendimento(), d.linkReuniao()))); }
    @Transactional public HorarioAtendimentoResponseDTO atualizar(Long id, AtualizacaoHorarioAtendimentoDTO d) { validar(d.horaInicio(), d.horaFim()); HorarioAtendimento e = get(id); e.atualizar(d.diaSemana(), d.horaInicio(), d.horaFim(), d.localAtendimento(), d.linkReuniao()); return HorarioAtendimentoResponseDTO.from(e); }
    @Transactional public void excluir(Long id) { repository.delete(get(id)); }
    private HorarioAtendimento get(Long id) { return repository.findById(id).orElseThrow(() -> new RecursoNaoEncontradoException("Horário não encontrado.")); }
    private void validar(java.time.LocalTime inicio, java.time.LocalTime fim) { if (!fim.isAfter(inicio)) throw new RegraNegocioException("Hora final deve ser posterior à hora inicial."); }
}
