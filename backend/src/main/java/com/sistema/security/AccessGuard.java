package com.sistema.security;

import com.sistema.entity.Monitor;
import com.sistema.entity.Usuario;
import com.sistema.repository.CandidaturaRepository;
import com.sistema.repository.HorarioAtendimentoRepository;
import com.sistema.repository.MonitorRepository;
import com.sistema.repository.RegistroAtividadeRepository;
import com.sistema.repository.VagaMonitoriaRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Component("accessGuard")
public class AccessGuard {

    private final VagaMonitoriaRepository vagaRepository;
    private final CandidaturaRepository candidaturaRepository;
    private final MonitorRepository monitorRepository;
    private final HorarioAtendimentoRepository horarioRepository;
    private final RegistroAtividadeRepository registroRepository;

    public AccessGuard(
            VagaMonitoriaRepository vagaRepository,
            CandidaturaRepository candidaturaRepository,
            MonitorRepository monitorRepository,
            HorarioAtendimentoRepository horarioRepository,
            RegistroAtividadeRepository registroRepository) {
        this.vagaRepository = vagaRepository;
        this.candidaturaRepository = candidaturaRepository;
        this.monitorRepository = monitorRepository;
        this.horarioRepository = horarioRepository;
        this.registroRepository = registroRepository;
    }

    public boolean isAdmin(Authentication auth) {
        return user(auth) != null && user(auth).tipoUsuario() == Usuario.TipoUsuario.ADMIN;
    }

    public boolean isProfessorOrAdmin(Authentication auth) {
        var u = user(auth);
        return u != null && (u.tipoUsuario() == Usuario.TipoUsuario.ADMIN
                || u.tipoUsuario() == Usuario.TipoUsuario.PROFESSOR);
    }

    public boolean isSelfOrAdmin(Long userId, Authentication auth) {
        var u = user(auth);
        return u != null && (u.tipoUsuario() == Usuario.TipoUsuario.ADMIN || u.id().equals(userId));
    }

    public boolean canCreateVacancy(Long professorId, Authentication auth) {
        var u = user(auth);
        if (u == null) return false;
        if (u.tipoUsuario() == Usuario.TipoUsuario.ADMIN) return true;
        return u.tipoUsuario() == Usuario.TipoUsuario.PROFESSOR && u.id().equals(professorId);
    }

    public boolean canManageVacancy(Long vagaId, Authentication auth) {
        var u = user(auth);
        if (u == null) return false;
        if (u.tipoUsuario() == Usuario.TipoUsuario.ADMIN) return true;
        if (u.tipoUsuario() != Usuario.TipoUsuario.PROFESSOR) return false;
        return vagaRepository.findById(vagaId)
                .map(vaga -> vaga.getProfessorId().equals(u.id()))
                .orElse(true);
    }

    public boolean canCreateApplication(Long alunoId, Authentication auth) {
        var u = user(auth);
        if (u == null) return false;
        if (u.tipoUsuario() == Usuario.TipoUsuario.ADMIN) return true;
        return u.tipoUsuario() == Usuario.TipoUsuario.ALUNO && u.id().equals(alunoId);
    }

    public boolean canReadStudentApplications(Long alunoId, Authentication auth) {
        var u = user(auth);
        if (u == null) return false;
        if (isProfessorOrAdmin(auth)) return true;
        return u.tipoUsuario() == Usuario.TipoUsuario.ALUNO && u.id().equals(alunoId);
    }

    public boolean canReadApplication(Long candidaturaId, Authentication auth) {
        var u = user(auth);
        if (u == null) return false;
        if (isProfessorOrAdmin(auth)) return true;
        return candidaturaRepository.findById(candidaturaId)
                .map(c -> c.getAlunoId().equals(u.id()))
                .orElse(true);
    }

    public boolean canManageApplication(Long candidaturaId, Authentication auth) {
        var u = user(auth);
        if (u == null) return false;
        if (u.tipoUsuario() == Usuario.TipoUsuario.ADMIN) return true;
        if (u.tipoUsuario() != Usuario.TipoUsuario.ALUNO) return false;
        return candidaturaRepository.findById(candidaturaId)
                .map(c -> c.getAlunoId().equals(u.id()))
                .orElse(true);
    }

    public boolean canReviewApplication(Long candidaturaId, Authentication auth) {
        var u = user(auth);
        if (u == null) return false;
        if (u.tipoUsuario() == Usuario.TipoUsuario.ADMIN) return true;
        if (u.tipoUsuario() != Usuario.TipoUsuario.PROFESSOR) return false;
        return candidaturaRepository.findById(candidaturaId)
                .map(c -> isVacancyOwner(c.getVagaId(), u.id()))
                .orElse(true);
    }

    public boolean canManageMonitorForVacancy(Long vagaId, Authentication auth) {
        return canManageVacancy(vagaId, auth);
    }

    public boolean canManageMonitorById(Long monitorId, Authentication auth) {
        var u = user(auth);
        if (u == null) return false;
        if (u.tipoUsuario() == Usuario.TipoUsuario.ADMIN) return true;
        if (u.tipoUsuario() != Usuario.TipoUsuario.PROFESSOR) return false;
        return monitorRepository.findById(monitorId)
                .map(m -> isVacancyOwner(m.getVagaId(), u.id()))
                .orElse(true);
    }

    public boolean canManageMonitorOwnedResource(Long monitorId, Authentication auth) {
        var u = user(auth);
        if (u == null) return false;
        if (u.tipoUsuario() == Usuario.TipoUsuario.ADMIN) return true;
        return monitorRepository.findById(monitorId)
                .map(m -> isMonitorParticipantOrProfessor(m, u))
                .orElse(true);
    }

    public boolean canManageOfficeHour(Long horarioId, Authentication auth) {
        var u = user(auth);
        if (u == null) return false;
        if (u.tipoUsuario() == Usuario.TipoUsuario.ADMIN) return true;
        return horarioRepository.findById(horarioId)
                .map(h -> canManageMonitorOwnedResource(h.getMonitorId(), auth))
                .orElse(true);
    }

    public boolean canManageActivityLog(Long registroId, Authentication auth) {
        var u = user(auth);
        if (u == null) return false;
        if (u.tipoUsuario() == Usuario.TipoUsuario.ADMIN) return true;
        return registroRepository.findById(registroId)
                .map(r -> canManageMonitorOwnedResource(r.getMonitorId(), auth))
                .orElse(true);
    }

    public boolean canApproveActivityLog(Long registroId, Authentication auth) {
        var u = user(auth);
        if (u == null) return false;
        if (u.tipoUsuario() == Usuario.TipoUsuario.ADMIN) return true;
        if (u.tipoUsuario() != Usuario.TipoUsuario.PROFESSOR) return false;
        return registroRepository.findById(registroId)
                .map(r -> monitorRepository.findById(r.getMonitorId())
                        .map(m -> isVacancyOwner(m.getVagaId(), u.id()))
                        .orElse(true))
                .orElse(true);
    }

    private boolean isMonitorParticipantOrProfessor(Monitor monitor, AuthenticatedUser u) {
        if (u.tipoUsuario() == Usuario.TipoUsuario.PROFESSOR) {
            return isVacancyOwner(monitor.getVagaId(), u.id());
        }
        return u.tipoUsuario() == Usuario.TipoUsuario.ALUNO
                && monitor.getAlunoId().equals(u.id())
                && monitor.getStatus() == Monitor.StatusMonitor.ATIVO;
    }

    private boolean isVacancyOwner(Long vagaId, Long professorId) {
        return vagaRepository.findById(vagaId)
                .map(vaga -> vaga.getProfessorId().equals(professorId))
                .orElse(false);
    }

    private AuthenticatedUser user(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) return null;
        if (auth.getPrincipal() instanceof AuthenticatedUser authenticatedUser) {
            return authenticatedUser;
        }
        return null;
    }
}
